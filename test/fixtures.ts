import { strToU8, zipSync } from 'fflate';
import type { EntityEntry, HassEntity, HomeAssistant, RegistrySnapshot } from '../src/ha/types';
import type { CachedProject, PrintOptions } from '../src/domain/projects';

export const project: CachedProject = { filename: '123-project.3mf', path: 'SYNTHETIC_ONE/prints/cache/123-project.3mf', size: 123, modified: '2026-01-01T10:00:00', thumbnail_path: null, printer_serial: 'SYNTHETIC_ONE', printer_device_id: 'printer-one', printer_name: 'Workshop', printer_model: 'A1' };
export const options: PrintOptions = { plate: 1, timelapse: false, bedLeveling: true, flowCalibration: true, vibrationCalibration: true, useAms: false, amsMapping: '' };

export function fixtureRegistry(): RegistrySnapshot {
  const devices = [
    { id: 'printer-one', name: 'Workshop A1', manufacturer: 'Bambu Lab', model: 'A1', identifiers: [['bambu_lab', 'SYNTHETIC_ONE']] as [string, string][] },
    { id: 'printer-two', name: 'Studio A1', manufacturer: 'Bambu Lab', model: 'A1', identifiers: [['bambu_lab', 'SYNTHETIC_TWO']] as [string, string][] },
    { id: 'ams-one', name: 'AMS Lite', model: 'AMS Lite', via_device_id: 'printer-one' },
    { id: 'external-two', name: 'External spool', model: 'External Spool', via_device_id: 'printer-two' },
  ];
  const entities: EntityEntry[] = [];
  for (const [device, prefix] of [['printer-one', 'one'], ['printer-two', 'two']]) {
    for (const key of ['print_status', 'print_progress', 'stage', 'subtask_name', 'remaining_time', 'current_layer', 'total_layers', 'nozzle_temp', 'target_nozzle_temp', 'bed_temp', 'target_bed_temp', 'cooling_fan_speed', 'print_weight', 'print_length', 'nozzle_diameter']) {
      entities.push({ entity_id: `sensor.${prefix}_${key}`, device_id: device, platform: 'bambu_lab', translation_key: key, unique_id: `SYNTHETIC_${prefix}_${key}`, original_name: key.replaceAll('_', ' ') });
    }
    for (const [domain, key] of [['camera', 'camera'], ['switch', 'camera'], ['light', 'chamber_light'], ['select', 'printing_speed'], ['button', 'pause'], ['button', 'resume'], ['button', 'stop']]) {
      entities.push({ entity_id: `${domain}.${prefix}_${key}`, device_id: device, platform: 'bambu_lab', translation_key: key, unique_id: `SYNTHETIC_${prefix}_${key === 'printing_speed' ? 'Speed' : key}` });
    }
  }
  for (let index = 1; index <= 4; index++) entities.push({ entity_id: `sensor.ams_tray_${index}`, device_id: 'ams-one', platform: 'bambu_lab', translation_key: 'tray', unique_id: `SYNTHETIC_AMS_tray_${index}`, original_name: `Tray ${index}` });
  for (const key of ['humidity', 'ams_temp']) entities.push({ entity_id: `sensor.ams_${key}`, device_id: 'ams-one', platform: 'bambu_lab', translation_key: key, unique_id: `SYNTHETIC_AMS_${key}` });
  entities.push({ entity_id: 'sensor.external_spool', device_id: 'external-two', platform: 'bambu_lab', translation_key: 'external_spool', unique_id: 'SYNTHETIC_ExternalSpool_external_spool' });
  return { devices, entities };
}

export function fixtureStates(): Record<string, HassEntity> {
  const states: Record<string, HassEntity> = {};
  const defaults: Record<string, string> = {
    print_status: 'running', print_progress: '42.7', stage: 'printing', subtask_name: 'Modular desk organizer', remaining_time: '1.25', current_layer: '128', total_layers: '300',
    nozzle_temp: '219', target_nozzle_temp: '220', bed_temp: '60', target_bed_temp: '60', cooling_fan_speed: '85', print_weight: '86.4', print_length: '28.7', nozzle_diameter: '0.4',
  };
  for (const entry of fixtureRegistry().entities) {
    const key = entry.translation_key || '';
    let state = defaults[key] || 'unknown';
    const attributes: Record<string, unknown> = { friendly_name: entry.original_name || key };
    if (entry.entity_id.startsWith('light.')) state = 'off';
    if (entry.entity_id.startsWith('select.')) { state = 'standard'; attributes.options = ['silent', 'standard', 'sport', 'ludicrous']; }
    if (entry.entity_id.startsWith('camera.')) { state = 'idle'; attributes.supported_features = 0; }
    if (key.includes('temp')) attributes.unit_of_measurement = '°C';
    if (key === 'remaining_time') attributes.unit_of_measurement = 'h';
    if (key === 'print_progress' || key === 'cooling_fan_speed') attributes.unit_of_measurement = '%';
    if (key === 'nozzle_diameter') attributes.unit_of_measurement = 'mm';
    if (key === 'print_weight') attributes.unit_of_measurement = 'g';
    if (key === 'print_length') attributes.unit_of_measurement = 'm';
    if (entry.device_id === 'printer-two') {
      if (key === 'print_status') state = 'finish';
      if (key === 'print_progress') state = '100';
      if (key === 'stage') state = 'idle';
      if (key === 'subtask_name') state = 'Cable guide set';
      if (key === 'nozzle_temp') state = '29';
      if (key === 'target_nozzle_temp' || key === 'target_bed_temp') state = '0';
      if (key === 'bed_temp') state = '30';
      if (key === 'remaining_time') state = '0';
      if (entry.entity_id.startsWith('select.')) state = 'unavailable';
    }
    if (key === 'humidity' || key === 'ams_temp') state = 'unknown';
    if (key === 'tray') {
      const slot = Number(entry.entity_id.at(-1));
      state = ['PLA Matte', 'PETG HF', 'PLA Basic', 'PLA Silk'][slot - 1];
      Object.assign(attributes, { slot: slot - 1, active: slot === 1, color: ['#d7dfcf', '#3f5b65', '#ce937c', '#86b7ad'][slot - 1], type: state, remain: [68, 84, 42, 91][slot - 1], remain_enabled: true, empty: false });
    }
    if (key === 'external_spool') { state = 'PLA Basic'; Object.assign(attributes, { type: 'PLA', color: '#a7b9d1', active: true, remain_enabled: false }); }
    states[entry.entity_id] = { entity_id: entry.entity_id, state, attributes, last_updated: '2026-01-01T10:00:00Z' };
  }
  return states;
}

export function slicedProject(model = 'Bambu Lab A1', nozzle = '0.4'): Uint8Array {
  return zipSync({
    'Metadata/project_settings.config': strToU8(JSON.stringify({ printer_model: model, nozzle_diameter: nozzle })),
    'Metadata/model_settings.config': strToU8('<config><plate><metadata key="plater_id" value="1"/><metadata key="plater_name" value="Main plate"/></plate></config>'),
    'Metadata/slice_info.config': strToU8('<config><plate><metadata key="index" value="1"/><filament id="1" type="PLA" color="#aabbcc"/></plate></config>'),
    'Metadata/plate_1.gcode': strToU8('; synthetic test fixture'),
  });
}

export function fixtureHass(overrides: Partial<HomeAssistant> = {}): HomeAssistant {
  const registry = fixtureRegistry();
  return {
    language: 'en', states: fixtureStates(), config: { time_zone: 'UTC' },
    connection: { subscribeEvents: async () => () => {} },
    callWS: async <T>(message: Record<string, unknown>) => (message.type === 'config/device_registry/list' ? registry.devices : registry.entities) as T,
    callService: async () => { throw new Error('Test fixture does not execute printer commands.'); },
    callApi: async () => { throw new Error('Test fixture has no HTTP API response configured.'); },
    fetchWithAuth: async () => { throw new Error('Test fixture has no binary response configured.'); },
    ...overrides,
  };
}
