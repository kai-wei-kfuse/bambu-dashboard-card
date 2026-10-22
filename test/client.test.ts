import { describe, expect, it, vi } from 'vitest';
import { BambuClient } from '../src/ha/client';
import { discoverPrinters } from '../src/domain/printers';
import type { HomeAssistant } from '../src/ha/types';
import { fixtureHass, fixtureRegistry, options, project } from './fixtures';

function printer(hass: HomeAssistant, id = 'printer-one') { return discoverPrinters(fixtureRegistry(), hass, { type: 'custom:bambu-dashboard-card' }).find((candidate) => candidate.id === id)!; }

describe('HA controls', () => {
  it('targets the exact printer entity and respects its actual speed options', async () => {
    const callService = vi.fn().mockResolvedValue(undefined);
    const hass = fixtureHass({ callService });
    const client = new BambuClient(hass);
    await client.press(printer(hass), 'pause');
    expect(callService).toHaveBeenLastCalledWith('button', 'press', { entity_id: 'button.one_pause' });
    await client.speed(printer(hass), 'sport');
    expect(callService).toHaveBeenLastCalledWith('select', 'select_option', { entity_id: 'select.one_printing_speed', option: 'sport' });
    await expect(client.speed(printer(hass), '250%')).rejects.toThrow('not offered');
    await expect(client.press(printer(hass, 'printer-two'), 'stop')).rejects.toThrow('not available');
  });
  it('refuses a control entity belonging to another printer', async () => {
    const hass = fixtureHass();
    const wrongTarget = { ...printer(hass), pause: printer(hass, 'printer-two').pause };
    await expect(new BambuClient(hass).press(wrongTarget, 'pause')).rejects.toThrow('does not belong');
  });
  it('uses file-cache APIs for transfer and the captured target device for a new print', async () => {
    const callService = vi.fn().mockResolvedValue(undefined);
    const callApi = vi.fn().mockResolvedValue({ status: 'use_legacy_path', detail: '/cache/project.3mf' });
    const unsubscribe = vi.fn();
    const hass = fixtureHass({ callService, callApi, connection: { subscribeEvents: vi.fn().mockResolvedValue(unsubscribe) } });
    const target = printer(hass, 'printer-two');
    const client = new BambuClient(hass);
    const path = await client.ensureFile(target, project);
    expect(callApi).toHaveBeenCalledWith('POST', 'bambu_lab/ensure_cache_file', { serial: 'SYNTHETIC_TWO', cache_path: project.path, expected_size: 123 });
    expect(unsubscribe).toHaveBeenCalledOnce();
    await client.start(target, path, options);
    expect(callService).toHaveBeenCalledWith('bambu_lab', 'print_project_file', expect.objectContaining({ device_id: 'printer-two', filepath: 'cache/project.3mf', plate: 1, use_ams: false }));
  });
  it('does not treat transfer errors as success and always unsubscribes', async () => {
    const unsubscribe = vi.fn();
    const hass = fixtureHass({ callApi: vi.fn().mockRejectedValue(new Error('FTP unavailable')), connection: { subscribeEvents: vi.fn().mockResolvedValue(unsubscribe) } });
    await expect(new BambuClient(hass).ensureFile(printer(hass, 'printer-two'), project)).rejects.toThrow('FTP unavailable');
    expect(unsubscribe).toHaveBeenCalledOnce();
    await expect(new BambuClient(hass).start(printer(hass), 'cache/project.3mf', options)).rejects.toThrow('not idle');
  });
});
