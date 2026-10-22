import { asError } from './catalog';
import type { EntityBinding, Printer } from '../domain/printers';
import { canStart, isAvailable } from '../domain/printers';
import { cacheLocation, fileApiPath, remoteProjectPath, validateFileList, validatePrintOptions } from '../domain/projects';
import type { CachedProject, PrintOptions } from '../domain/projects';
import type { HomeAssistant } from './types';

export interface UploadProgress { sent: number; total: number }

export class BambuClient {
  constructor(private hass: HomeAssistant) {}

  async files(): Promise<CachedProject[]> {
    try {
      return validateFileList(await this.hass.callApi('GET', 'bambu_lab/print_history'));
    } catch (error) {
      const message = asError(error).message;
      throw new Error(`Cannot load cached projects. This requires the ha-bambulab cached-file API. ${message}`);
    }
  }

  async fileBytes(path: string): Promise<Uint8Array> {
    if (typeof this.hass.fetchWithAuth !== 'function') throw new Error('This HA frontend does not expose authenticated file requests.');
    const response = await this.hass.fetchWithAuth(fileApiPath(path));
    if (!response.ok) throw new Error(`Cached file request failed: HTTP ${response.status}.`);
    return new Uint8Array(await response.arrayBuffer());
  }

  async press(printer: Printer, action: 'pause' | 'resume' | 'stop'): Promise<void> {
    const permitted = action === 'pause' ? printer.status === 'running' : action === 'resume' ? printer.status === 'pause' : ['running', 'pause'].includes(printer.status);
    const entity = printer[action];
    if (!permitted || !isAvailable(entity)) throw new Error(`${action} is not available in the printer's current state.`);
    this.assertOwner(printer, entity!);
    await this.hass.callService('button', 'press', { entity_id: entity!.entry.entity_id });
  }

  async light(printer: Printer): Promise<void> {
    const entity = printer.light;
    if (!isAvailable(entity) || !['on', 'off'].includes(entity!.state!.state)) throw new Error('Light state is unavailable.');
    this.assertOwner(printer, entity!);
    await this.hass.callService('light', entity!.state!.state === 'on' ? 'turn_off' : 'turn_on', { entity_id: entity!.entry.entity_id });
  }

  async speed(printer: Printer, option: string): Promise<void> {
    const entity = printer.speed;
    if (printer.status !== 'running' || !isAvailable(entity)) throw new Error('Speed control is available while printing.');
    const options = entity!.state!.attributes.options;
    if (!Array.isArray(options) || !options.includes(option)) throw new Error('This speed is not offered by the printer.');
    this.assertOwner(printer, entity!);
    await this.hass.callService('select', 'select_option', { entity_id: entity!.entry.entity_id, option });
  }

  private assertOwner(printer: Printer, entity: EntityBinding): void {
    if (entity.entry.device_id !== printer.id) throw new Error('Control entity does not belong to the target printer.');
  }

  async ensureFile(printer: Printer, file: CachedProject, onProgress?: (progress: UploadProgress) => void): Promise<string> {
    if (!printer.serial) throw new Error('The target printer serial is missing from the device registry.');
    if (!canStart(printer)) throw new Error('The target printer is not idle.');
    cacheLocation(file.path);
    if (!Number.isSafeInteger(file.size) || file.size <= 0) throw new Error('Invalid cached-project size.');
    const targetSerial = printer.serial;
    const unsubscribe = await this.hass.connection.subscribeEvents((event) => {
      const data = event.data;
      if (data.serial === targetSerial && typeof data.bytes_sent === 'number' && typeof data.total === 'number') {
        onProgress?.({ sent: data.bytes_sent, total: data.total });
      }
    }, 'bambu_upload_progress');
    try {
      const result = await this.hass.callApi<{ status: string; detail?: string }>('POST', 'bambu_lab/ensure_cache_file', {
        serial: targetSerial,
        cache_path: file.path,
        expected_size: file.size,
      });
      return remoteProjectPath(file, result);
    } finally {
      unsubscribe();
    }
  }

  async start(printer: Printer, filepath: string, options: PrintOptions): Promise<void> {
    if (!canStart(printer)) throw new Error('The target printer is not idle.');
    if (!filepath || filepath.startsWith('/') || filepath.split('/').some((part) => part === '..' || part === '.' || !part) || /[\\\0]/.test(filepath)) {
      throw new Error('Enter a relative path to a sliced 3MF project on the printer SD card.');
    }
    if (!filepath.toLowerCase().endsWith('.3mf')) throw new Error('Printing requires a sliced .3mf project.');
    validatePrintOptions(options);
    await this.hass.callService('bambu_lab', 'print_project_file', {
      device_id: printer.id,
      filepath,
      plate: options.plate,
      timelapse: options.timelapse,
      bed_leveling: options.bedLeveling,
      flow_cali: options.flowCalibration,
      vibration_cali: options.vibrationCalibration,
      layer_inspect: false,
      use_ams: options.useAms,
      ams_mapping: options.useAms ? options.amsMapping : '0',
    });
  }
}
