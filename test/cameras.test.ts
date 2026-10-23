import { describe, expect, it, vi } from 'vitest';
import { externalCameras, parseCameraPreference, resolveCameraSource } from '../src/domain/cameras';
import { discoverPrinters } from '../src/domain/printers';
import { CameraSourceClient } from '../src/ha/cameras';
import { fixtureHass, fixtureRegistry } from './fixtures';

describe('HA camera sources', () => {
  it('discovers accessible external camera states without mixing in built-in cameras, disabled entities or credentials', () => {
    const hass = fixtureHass();
    const registry = fixtureRegistry();
    registry.entities.push({ entity_id: 'camera.disabled', disabled_by: 'user' }, { entity_id: 'camera.offline', name: 'Offline camera' });
    for (const id of ['camera.external', 'camera.disabled', 'camera.offline']) hass.states[id] = { entity_id: id, state: id.endsWith('offline') ? 'unavailable' : 'idle', attributes: { supported_features: 2, access_token: 'SYNTHETIC_SECRET' } };
    hass.states['camera.external'].attributes.friendly_name = 'Workbench camera';
    const options = externalCameras(hass.states, registry);
    expect(options.map((source) => source.entityId)).toEqual(['camera.offline', 'camera.external']);
    expect(options[0].status).toBe('unavailable');
    expect(options[1]).toMatchObject({ name: 'Workbench camera', streaming: true, external: true });
    expect(JSON.stringify(options)).not.toContain('SYNTHETIC_SECRET');
    delete hass.states['camera.external'];
    expect(externalCameras(hass.states, registry).map((source) => source.entityId)).toEqual(['camera.offline']);
  });

  it('keeps explicit unavailable/missing/disabled/unknown external sources instead of falling back to the built-in camera', () => {
    const hass = fixtureHass();
    const registry = fixtureRegistry();
    const printer = discoverPrinters(registry, hass, { type: 'custom:bambu-dashboard-card' }).find((candidate) => candidate.id === 'printer-one')!;
    expect(resolveCameraSource(printer, { version: 1, entityId: null }, hass.states, registry)).toMatchObject({ entityId: 'camera.one_camera', external: false, status: 'ready' });
    const preference = { version: 1 as const, entityId: 'camera.external' };
    expect(resolveCameraSource(printer, preference, hass.states, registry)).toMatchObject({ entityId: 'camera.external', external: true, status: 'missing' });
    hass.states['camera.external'] = { entity_id: 'camera.external', state: 'unavailable', attributes: {} };
    expect(resolveCameraSource(printer, preference, hass.states, registry).status).toBe('unavailable');
    hass.states['camera.external'].state = 'unknown';
    expect(resolveCameraSource(printer, preference, hass.states, registry).status).toBe('unknown');
    registry.entities.push({ entity_id: 'camera.external', disabled_by: 'user' });
    expect(resolveCameraSource(printer, preference, hass.states, registry).status).toBe('disabled');
  });

  it('accepts only supported camera preferences, with null representing an absent saved preference', () => {
    expect(parseCameraPreference(null)).toEqual({ version: 1, entityId: null });
    const saved = { version: 1, entityId: 'camera.workbench' };
    expect(parseCameraPreference(saved)).toEqual(saved);
    expect(parseCameraPreference(saved)).not.toBe(saved);
    for (const value of [undefined, {}, { version: 2, entityId: null }, { version: 1 }, { version: 1, entityId: 'rtsp://example.invalid/camera' }, { version: 1, entityId: 'switch.camera' }, { version: 1, entityId: '' }]) expect(() => parseCameraPreference(value)).toThrow();
  });

  it('uses independent per-printer HA user-data keys and keeps API failures explicit', async () => {
    const callWS = vi.fn().mockResolvedValueOnce({ value: null }).mockResolvedValueOnce({ value: { version: 1, entityId: 'camera.external' } }).mockResolvedValueOnce(undefined).mockResolvedValueOnce({}).mockRejectedValueOnce(new Error('Write denied'));
    const hass = fixtureHass({ callWS, callService: vi.fn() });
    const client = new CameraSourceClient(hass);
    expect(await client.load('printer-one')).toEqual({ version: 1, entityId: null });
    expect((await client.load('printer-two')).entityId).toBe('camera.external');
    await client.save('printer-two', { version: 1, entityId: null });
    expect(callWS.mock.calls[2][0]).toEqual({ type: 'frontend/set_user_data', key: 'bambu_dashboard.camera_source.v1.printer-two', value: { version: 1, entityId: null } });
    await expect(client.load('printer-one')).rejects.toThrow('invalid frontend user-data');
    await expect(client.save('printer-one', { version: 1, entityId: 'camera.external' })).rejects.toThrow('Write denied');
    expect(hass.callService).not.toHaveBeenCalled();
  });
});
