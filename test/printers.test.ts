import { describe, expect, it } from 'vitest';
import { discoverPrinters, filamentRemaining, findEntity, parameterAttributes } from '../src/domain/printers';
import { fixtureHass, fixtureRegistry } from './fixtures';

describe('dynamic printer directory', () => {
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
