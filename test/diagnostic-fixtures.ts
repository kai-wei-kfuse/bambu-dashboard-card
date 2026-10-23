import { discoverPrinters } from '../src/domain/printers';
import { fixtureHass, fixtureRegistry } from './fixtures';
import type { HomeAssistant } from '../src/ha/types';

export function diagnosticFixture(overrides: Partial<HomeAssistant> = {}) {
  const registry = fixtureRegistry();
  const hass = fixtureHass({
    callWS: async <T>({ type }: Record<string, unknown>) => {
      if (type === 'config/device_registry/list') return registry.devices as T;
      if (type === 'config/entity_registry/list') return registry.entities as T;
      if (type === 'frontend/get_user_data') return { value: null } as T;
      if (type === 'get_services') return {} as T;
      throw new Error(`Unexpected diagnostic fixture request: ${type}`);
    },
    ...overrides,
  });
  for (const [id, prefix] of [['printer-one', 'one'], ['printer-two', 'two']]) {
    for (const [domain, key, state, unit] of [
      ['binary_sensor', 'online', 'on', ''], ['binary_sensor', 'hms_errors', 'off', ''], ['binary_sensor', 'print_error', 'off', ''],
      ['binary_sensor', 'firmware_update', 'off', ''], ['sensor', 'wifi_signal', '-48', 'dBm'], ['sensor', 'mqtt_mode', 'local', ''],
      ['sensor', 'sdcard_status', 'normal', ''], ['sensor', 'nozzle_type', 'hardened_steel', ''], ['sensor', 'total_usage_hours', '4.82', 'h'],
      ['sensor', 'heatbreak_fan_speed', '0', '%'],
    ]) {
      const entityId = `${domain}.${prefix}_${key}`;
      registry.entities.push({ entity_id: entityId, device_id: id, platform: 'bambu_lab', translation_key: key });
      hass.states[entityId] = { entity_id: entityId, state, attributes: { unit_of_measurement: unit, ...(key === 'hms_errors' ? { Count: 0 } : {}) } };
    }
  }
  const printers = () => discoverPrinters(registry, hass, { type: 'custom:bambu-dashboard-card' });
  const printer = (id = 'printer-one') => printers().find((candidate) => candidate.id === id)!;
  return { registry, hass, printers, printer };
}
