import { strFromU8, unzipSync } from 'fflate';

export interface CachedProject {
  filename: string;
  path: string;
  size: number;
  size_human?: string;
  modified: string;
  thumbnail_path: string | null;
  printer_serial: string;
  printer_device_id: string;
  printer_name: string;
  printer_model: string;
}

export interface ProjectPlate {
  id: number;
  name: string;
  filaments: { id: number; type: string; color: string }[];
}

export interface ProjectMetadata {
  model: string | null;
  nozzles: number[];
  plates: ProjectPlate[];
}

export function cacheLocation(path: string): { serial: string; relative: string; remote: string } {
  const parts = path.split('/');
  if (parts.length < 3 || parts[1] !== 'prints' || parts.some((part) => !part || part === '.' || part === '..' || /[\\\0]/.test(part))) {
    throw new Error('Invalid cached project path.');
  }
  return { serial: parts[0], relative: parts.slice(1).join('/'), remote: parts.slice(2).join('/') };
}

export function fileApiPath(path: string): string {
  const parts = path.split('/');
  if (parts.length < 2 || parts.some((part) => !part || part === '.' || part === '..' || /[\\\0]/.test(part))) {
    throw new Error('Invalid cached file path.');
  }
  return `/api/bambu_lab/file_cache/${parts.map(encodeURIComponent).join('/')}`;
}

export function validateFileList(value: unknown): CachedProject[] {
  if (typeof value !== 'object' || value === null || !('files' in value) || !Array.isArray(value.files)) {
    throw new Error('The cached-project API returned an invalid response.');
  }
  return value.files.map((file: unknown) => {
    if (typeof file !== 'object' || file === null) throw new Error('Invalid cached-project entry.');
    const record = file as Record<string, unknown>;
    for (const field of ['filename', 'path', 'modified', 'printer_serial', 'printer_device_id', 'printer_name', 'printer_model']) {
      if (typeof record[field] !== 'string') throw new Error(`Cached project is missing ${field}.`);
    }
    if (typeof record.size !== 'number' || !Number.isSafeInteger(record.size) || record.size <= 0) throw new Error('Invalid cached-project size.');
    cacheLocation(record.path as string);
    return record as unknown as CachedProject;
  });
}

function xml(value: string): Document {
  const document = new DOMParser().parseFromString(value, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error('The 3MF contains invalid metadata XML.');
  return document;
}

function metadataValue(element: ParentNode, key: string): string | null {
  const metadata = Array.from(element.querySelectorAll('metadata')).find((node) => node.getAttribute('key') === key);
  return metadata?.getAttribute('value') || metadata?.textContent || null;
}

function parseNozzles(value: unknown): number[] {
  const items = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[;,]/) : [];
  return items.map(Number).filter((item) => Number.isFinite(item) && item > 0);
}

export function inspectProject(bytes: Uint8Array): ProjectMetadata {
  const plateIds = new Set<number>();
  // G-code can be large. Read only project metadata, while indexing sliced plate names.
  const files = unzipSync(bytes, {
    filter: (file) => {
      const plate = file.name.match(/^Metadata\/plate_(\d+)\.gcode$/i);
      if (plate) plateIds.add(Number(plate[1]));
      return ['Metadata/project_settings.config', 'Metadata/model_settings.config', 'Metadata/slice_info.config'].includes(file.name);
    },
  });
  if (!plateIds.size) throw new Error('This is not a sliced 3MF project: no printable G-code plates were found.');
  const settings = files['Metadata/project_settings.config']
    ? JSON.parse(strFromU8(files['Metadata/project_settings.config'])) as Record<string, unknown>
    : undefined;
  const layout = files['Metadata/model_settings.config'] ? xml(strFromU8(files['Metadata/model_settings.config'])) : undefined;
  const slice = files['Metadata/slice_info.config'] ? xml(strFromU8(files['Metadata/slice_info.config'])) : undefined;
  const model = typeof settings?.printer_model === 'string' ? settings.printer_model : null;
  const nozzleValues = parseNozzles(settings?.nozzle_diameter);
  if (!nozzleValues.length && slice) {
    for (const nozzle of slice.querySelectorAll('nozzle')) nozzleValues.push(...parseNozzles(nozzle.getAttribute('nozzle_diameter')));
  }
  const plates = [...plateIds].sort((a, b) => a - b).map((id): ProjectPlate => {
    const layoutPlate = Array.from(layout?.querySelectorAll('plate') || []).find((plate) => Number(metadataValue(plate, 'plater_id')) === id);
    const slicePlate = Array.from(slice?.querySelectorAll('plate') || []).find((plate) => Number(metadataValue(plate, 'index') || plate.getAttribute('id')) === id);
    const filaments = Array.from(slicePlate?.querySelectorAll('filament') || []).map((filament) => ({
      id: Number(filament.getAttribute('id')),
      type: filament.getAttribute('type') || '',
      color: filament.getAttribute('color') || '',
    }));
    return { id, name: layoutPlate ? metadataValue(layoutPlate, 'plater_name') || `Plate ${id}` : `Plate ${id}`, filaments };
  });
  return { model, nozzles: [...new Set(nozzleValues)], plates };
}

export function normalizeModel(model: string): string {
  const compact = model.toLowerCase().replace(/bambu\s*lab/g, '').replace(/[^a-z0-9]/g, '');
  const aliases: Record<string, string> = { x1carbon: 'x1c', x1carboncombo: 'x1c' };
  return aliases[compact] || compact;
}

export function projectCompatibility(metadata: ProjectMetadata, model: string, nozzle: number | null): string[] {
  const errors: string[] = [];
  if (!metadata.model) errors.push('Project printer model is missing. Re-slice the project with printer metadata.');
  else if (normalizeModel(metadata.model) !== normalizeModel(model)) errors.push(`Project model ${metadata.model} does not match target ${model}.`);
  if (!metadata.nozzles.length) errors.push('Project nozzle diameter is missing.');
  else if (nozzle === null) errors.push('Target printer nozzle diameter is unknown.');
  else if (metadata.nozzles.some((diameter) => diameter !== nozzle)) errors.push(`Project nozzle ${metadata.nozzles.join('/')} mm does not match target ${nozzle} mm.`);
  return errors;
}

export interface PrintOptions {
  plate: number;
  timelapse: boolean;
  bedLeveling: boolean;
  flowCalibration: boolean;
  vibrationCalibration: boolean;
  useAms: boolean;
  amsMapping: string;
}

export function validatePrintOptions(options: PrintOptions, plates?: ProjectPlate[]): void {
  // The integration's service schema declares the protocol's plate range as 1..100.
  if (!Number.isInteger(options.plate) || options.plate < 1 || options.plate > 100) throw new Error('Plate must be an integer from 1 to 100.');
  if (plates && !plates.some((plate) => plate.id === options.plate)) throw new Error('The selected plate has no sliced G-code.');
  if (options.useAms && !/^-?\d+(,-?\d+)*$/.test(options.amsMapping)) throw new Error('Choose the AMS mapping for every project filament.');
  if (options.useAms && options.amsMapping.split(',').some((slot) => !Number.isSafeInteger(Number(slot)) || Number(slot) < -1)) throw new Error('AMS mapping accepts non-negative slot IDs or the -1 sentinel.');
}

export function remoteProjectPath(file: CachedProject, result: { status: string; detail?: string }): string {
  if (result.status === 'use_legacy_path') {
    if (!result.detail) throw new Error('The integration did not return the legacy project path.');
    const legacy = result.detail.replace(/^\//, '');
    if (!legacy || legacy.split('/').some((part) => part === '..' || part === '.' || !part) || /[\\\0]/.test(legacy)) {
      throw new Error('The integration returned an unsafe legacy project path.');
    }
    return legacy;
  }
  if (result.status !== 'present' && result.status !== 'uploaded') throw new Error(result.detail || `Unexpected file-check result: ${result.status}`);
  return cacheLocation(file.path).remote;
}
