import type { CardConfig, DeviceEntry, EntityEntry, HassEntity, HomeAssistant, RegistrySnapshot } from '../ha/types';

export interface EntityBinding {
  entry: EntityEntry;
  state?: HassEntity;
}

export interface AmsUnit {
  device: DeviceEntry;
  entities: EntityBinding[];
  slots: { index: number; entity: EntityBinding }[];
  external: boolean;
}

export interface Printer {
  id: string;
  name: string;
  model: string;
  serial?: string;
  device: DeviceEntry;
  entities: EntityBinding[];
  allEntities: EntityBinding[];
  ams: AmsUnit[];
  status: string;
  stage?: EntityBinding;
  progress: number | null;
  camera?: EntityBinding;
  light?: EntityBinding;
  speed?: EntityBinding;
  cover?: EntityBinding;
  pause?: EntityBinding;
  resume?: EntityBinding;
  stop?: EntityBinding;
}

export function domainOf(entityId: string): string {
  return entityId.split('.')[0];
}

export function matchesKey(entry: EntityEntry, key: string): boolean {
  if (entry.translation_key === key) return true;
  const uniqueId = entry.unique_id?.toLowerCase();
  if (key === 'printing_speed') return uniqueId?.endsWith('_speed') === true;
  return uniqueId?.endsWith(`_${key.toLowerCase()}`) === true;
}

export function findEntity(entities: EntityBinding[], key: string, domain = 'sensor'): EntityBinding | undefined {
  return entities.find(({ entry }) => !entry.disabled_by && domainOf(entry.entity_id) === domain && matchesKey(entry, key));
}

export function isAvailable(entity?: EntityBinding): boolean {
  // An unpressed button normally has state "unknown"; it is still actionable.
  return Boolean(entity?.state && !entity.entry.disabled_by && entity.state.state !== 'unavailable');
}

export function scalar(entity?: EntityBinding): string | null {
  const value = entity?.state?.state;
  return value === undefined || value === 'unknown' || value === 'unavailable' ? null : value;
}

export function numeric(entity?: EntityBinding): number | null {
  const value = scalar(entity);
  if (value === null || value.trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function entityName(entity: EntityBinding): string {
  return entity.entry.name || entity.entry.original_name || String(entity.state?.attributes.friendly_name || entity.entry.translation_key || entity.entry.entity_id);
}

export function slotIndex(entity: EntityBinding): number | undefined {
  const match = entity.entry.unique_id?.match(/_tray_(\d+)$/i);
  if (match) return Number(match[1]);
  const slot = entity.state?.attributes.slot;
  return typeof slot === 'number' && Number.isInteger(slot) ? slot + 1 : undefined;
}

function descendants(root: string, devices: DeviceEntry[]): DeviceEntry[] {
  const pending = [root];
  const visited = new Set([root]);
  const result: DeviceEntry[] = [];
  while (pending.length) {
    const parent = pending.shift();
    for (const device of devices) {
      if (device.via_device_id !== parent || visited.has(device.id)) continue;
      visited.add(device.id);
      pending.push(device.id);
      result.push(device);
    }
  }
  return result;
}

export function discoverPrinters(snapshot: RegistrySnapshot, hass: HomeAssistant, config: CardConfig): Printer[] {
  const byDevice = new Map<string, EntityBinding[]>();
  for (const entry of snapshot.entities) {
    if (entry.platform !== 'bambu_lab' || !entry.device_id) continue;
    const list = byDevice.get(entry.device_id) || [];
    list.push({ entry, state: hass.states[entry.entity_id] });
    byDevice.set(entry.device_id, list);
  }
  const selected = config.devices || [];
  return snapshot.devices
    .filter((device) => !device.disabled_by && findEntity(byDevice.get(device.id) || [], 'print_status'))
    .filter((device) => config.discovery !== 'selected' || selected.includes(device.id))
    .map((device): Printer => {
      const entities = byDevice.get(device.id) || [];
      const children = descendants(device.id, snapshot.devices);
      const ams = children.filter((child) => /ams|external spool/i.test(child.model || ''))
        .map((child): AmsUnit => {
          const childEntities = byDevice.get(child.id) || [];
          const external = /external spool/i.test(child.model || '');
          const slots = childEntities.filter(({ entry }) => domainOf(entry.entity_id) === 'sensor')
            .map((entity) => ({ entity, index: slotIndex(entity) }))
            .filter((slot): slot is { index: number; entity: EntityBinding } => slot.index !== undefined)
            .sort((a, b) => a.index - b.index);
          if (external) {
            const spool = childEntities.find(({ entry }) => domainOf(entry.entity_id) === 'sensor');
            if (spool) slots.push({ index: 1, entity: spool });
          }
          return { device: child, entities: childEntities, slots, external };
        });
      const rawStatus = scalar(findEntity(entities, 'print_status'));
      const status = rawStatus?.toLowerCase() || findEntity(entities, 'print_status')?.state?.state || 'unknown';
      return {
        id: device.id,
        device,
        name: device.name_by_user || device.name || device.model || 'Bambu Lab',
        model: device.model || 'Unknown',
        serial: device.identifiers?.find(([platform]) => platform === 'bambu_lab')?.[1] || device.serial_number || undefined,
        entities,
        allEntities: [...entities, ...children.flatMap((child) => byDevice.get(child.id) || [])],
        ams,
        status,
        stage: findEntity(entities, 'stage'),
        progress: numeric(findEntity(entities, 'print_progress')),
        camera: findEntity(entities, 'camera', 'camera'),
        light: findEntity(entities, 'chamber_light', 'light') || findEntity(entities, 'camera_light', 'light'),
        speed: findEntity(entities, 'printing_speed', 'select'),
        cover: findEntity(entities, 'cover_image', 'image'),
        pause: findEntity(entities, 'pause', 'button'),
        resume: findEntity(entities, 'resume', 'button'),
        stop: findEntity(entities, 'stop', 'button'),
      };
    })
    .sort((a, b) => {
      if (selected.length) {
        const left = selected.indexOf(a.id);
        const right = selected.indexOf(b.id);
        if (left !== right) return (left < 0 ? Infinity : left) - (right < 0 ? Infinity : right);
      }
      return a.name.localeCompare(b.name);
    });
}

export function canStart(printer: Printer): boolean {
  return ['idle', 'finish', 'finished', 'failed'].includes(printer.status);
}

export function parameterAttributes(entity: EntityBinding): Record<string, unknown> {
  // Authentication attributes are not printer parameters. Never render credentials.
  return Object.fromEntries(Object.entries(entity.state?.attributes || {})
    .filter(([key]) => !isCredentialKey(key)).map(([key, value]) => [key, redactAttribute(value)]));
}

function isCredentialKey(key: string): boolean { return /token|password|secret|credential|authorization|api_key/i.test(key); }
function redactAttribute(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactAttribute);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([key]) => !isCredentialKey(key)).map(([key, item]) => [key, redactAttribute(item)]));
  }
  // HA entity_picture URLs may contain credentials even though their attribute key does not.
  if (typeof value === 'string' && /^(https?:\/\/|\/)/i.test(value)) {
    return value.replace(/([?&](?:[^=&]*(?:token|password|secret|credential|authorization|api_key)[^=&]*)=)[^&#]*/gi, '$1[redacted]');
  }
  return value;
}

export function filamentColor(value: unknown): string | undefined {
  return typeof value === 'string' && /^#[\da-f]{6}([\da-f]{2})?$/i.test(value) ? value : undefined;
}

export function filamentRemaining(entity: EntityBinding): number | null {
  const attributes = entity.state?.attributes;
  if (!attributes?.remain_enabled || typeof attributes.remain !== 'number') return null;
  return attributes.remain >= 0 && attributes.remain <= 100 ? attributes.remain : null;
}
