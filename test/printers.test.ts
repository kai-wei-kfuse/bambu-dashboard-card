import { describe, expect, it } from 'vitest';
import { discoverPrinters, filamentRemaining, findEntity, parameterAttributes, speedPercentage } from '../src/domain/printers';
import { fixtureHass, fixtureRegistry } from './fixtures';

describe('dynamic printer directory', () => {
  it('uses the reported speed modifier, preserving custom percentages without mapping mode names', () => {
    const registry = fixtureRegistry();
    registry.entities.push({ entity_id: 'sensor.one_speed_profile', device_id: 'printer-one', platform: 'bambu_lab', translation_key: 'speed_profile' });
    const hass = fixtureHass();
    hass.states['sensor.one_speed_profile'] = { entity_id: 'sensor.one_speed_profile', state: 'standard', attributes: { modifier: 124 } };
    const printer = discoverPrinters(registry, hass, { type: 'custom:bambu-dashboard-card' }).find((item) => item.id === 'printer-one')!;
    for (const modifier of [100, 124, 150, 55, 0, 166]) {
      hass.states['sensor.one_speed_profile'].attributes.modifier = modifier;
      expect(speedPercentage(printer)).toBe(modifier);
    }
    for (const modifier of [undefined, '100', -1, Number.NaN, Infinity]) {
      hass.states['sensor.one_speed_profile'].attributes.modifier = modifier;
      expect(speedPercentage(printer)).toBeNull();
    }
    hass.states['sensor.one_speed_profile'].attributes.modifier = 100;
    hass.states['sensor.one_speed_profile'].state = 'unavailable';
    expect(speedPercentage(printer)).toBeNull();
  });

  it('separates the printer-reported name from a renamed HA device without changing identity', () => {
    const registry = fixtureRegistry();
    registry.devices[0].name = 'A1_HA_IDENTIFIER';
    Object.assign(registry.devices[0], { name_by_user: 'HA Workshop' });
    registry.entities.push({ entity_id: 'sensor.one_printer_name', device_id: 'printer-one', platform: 'bambu_lab', translation_key: 'printer_name' });
    const hass = fixtureHass();
    hass.states['sensor.one_printer_name'] = { entity_id: 'sensor.one_printer_name', state: 'My workshop printer', attributes: {} };
    const printer = discoverPrinters(registry, hass, { type: 'custom:bambu-dashboard-card' }).find((item) => item.id === 'printer-one')!;
    expect(printer.name).toBe('My workshop printer');
    expect(printer.haName).toBe('HA Workshop');
    expect(printer.id).toBe('printer-one');
    expect(printer.pause!.entry.entity_id).toBe('button.one_pause');
  });

  it.each(['unknown', 'unavailable', '   '])('retains the HA display name when the printer-name value is %s', (state) => {
    const registry = fixtureRegistry();
    registry.entities.push({ entity_id: 'sensor.one_printer_name', device_id: 'printer-one', platform: 'bambu_lab', translation_key: 'printer_name' });
    const hass = fixtureHass();
    hass.states['sensor.one_printer_name'] = { entity_id: 'sensor.one_printer_name', state, attributes: {} };
    const printer = discoverPrinters(registry, hass, { type: 'custom:bambu-dashboard-card' }).find((item) => item.id === 'printer-one')!;
    expect(printer.name).toBe('Workshop A1');
    expect(printer.haName).toBe('Workshop A1');
  });

  it('discovers printers and owns each child device without a model allow-list', () => {
    const registry = fixtureRegistry();
    registry.devices[1].model = 'Future Bambu Model';
    const printers = discoverPrinters(registry, fixtureHass(), { type: 'custom:bambu-dashboard-card' });
    expect(printers).toHaveLength(2);
    expect(printers.find((printer) => printer.id === 'printer-one')!.ams[0].slots.map((slot) => slot.index)).toEqual([1, 2, 3, 4]);
    expect(printers.find((printer) => printer.id === 'printer-two')!.ams[0].external).toBe(true);
    expect(printers.find((printer) => printer.id === 'printer-two')!.model).toBe('Future Bambu Model');
  });

  it('does not confuse the camera with its switch or duplicate tray translation keys', () => {
    const printer = discoverPrinters(fixtureRegistry(), fixtureHass(), { type: 'custom:bambu-dashboard-card' })[0];
    expect(printer.camera!.entry.entity_id).toBe('camera.two_camera');
    const first = discoverPrinters(fixtureRegistry(), fixtureHass(), { type: 'custom:bambu-dashboard-card', discovery: 'selected', devices: ['printer-one'] })[0];
    expect(first.ams[0].slots).toHaveLength(4);
    expect(findEntity(first.entities, 'camera', 'switch')!.entry.entity_id).toBe('switch.one_camera');
  });

  it('preserves explicit device order and handles additions, removals and disabled devices', () => {
    const registry = fixtureRegistry();
    const config = { type: 'custom:bambu-dashboard-card', discovery: 'selected' as const, devices: ['printer-one', 'printer-two'] };
    expect(discoverPrinters(registry, fixtureHass(), config).map((printer) => printer.id)).toEqual(config.devices);
    registry.devices[0].disabled_by = 'user';
    expect(discoverPrinters(registry, fixtureHass(), config).map((printer) => printer.id)).toEqual(['printer-two']);
    registry.devices = [];
    expect(discoverPrinters(registry, fixtureHass(), config)).toEqual([]);
  });

  it('keeps unknown separate from zero and exposes all registered entities', () => {
    const hass = fixtureHass();
    hass.states['sensor.one_print_progress'].state = 'unknown';
    const registry = fixtureRegistry();
    const printers = discoverPrinters(registry, hass, { type: 'custom:bambu-dashboard-card' });
    expect(printers.find((printer) => printer.id === 'printer-one')!.progress).toBeNull();
    hass.states['sensor.one_print_progress'].state = '0';
    expect(discoverPrinters(registry, hass, { type: 'custom:bambu-dashboard-card' }).find((printer) => printer.id === 'printer-one')!.progress).toBe(0);
    expect(printers.flatMap((printer) => printer.allEntities)).toHaveLength(registry.entities.length);
  });

  it('does not expose authentication attributes or invent spool remaining amounts', () => {
    const printer = discoverPrinters(fixtureRegistry(), fixtureHass(), { type: 'custom:bambu-dashboard-card', devices: ['printer-two'], discovery: 'selected' })[0];
    const spool = printer.ams[0].slots[0].entity;
    expect(filamentRemaining(spool)).toBeNull();
    spool.state!.attributes.access_token = 'not-a-real-token';
    spool.state!.attributes.entity_picture = '/api/image_proxy/image.preview?token=not-a-real-token&v=1';
    spool.state!.attributes.nested = { password: 'not-a-password', material: 'PLA' };
    expect(parameterAttributes(spool)).not.toHaveProperty('access_token');
    expect(parameterAttributes(spool).entity_picture).toBe('/api/image_proxy/image.preview?token=[redacted]&v=1');
    expect(parameterAttributes(spool).nested).toEqual({ material: 'PLA' });
  });
});
