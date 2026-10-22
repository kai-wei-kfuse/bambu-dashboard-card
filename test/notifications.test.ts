import { describe, expect, it, vi } from 'vitest';
import { automationId, buildNotificationAutomation, destinationKey, discoverNotifyTargets, parseNotificationAutomation, sameConfig } from '../src/domain/notifications';
import type { NotificationSettings } from '../src/domain/notifications';
import { discoverPrinters } from '../src/domain/printers';
import { NotificationClient } from '../src/ha/notifications';
import { fixtureHass, fixtureRegistry } from './fixtures';

const printer = discoverPrinters(fixtureRegistry(), fixtureHass(), { type: 'custom:bambu-dashboard-card' }).find((candidate) => candidate.id === 'printer-one')!;
const standard: NotificationSettings = { enabled: true, target: { kind: 'entity', id: 'notify.test_phone' }, language: 'en', style: 'standard' };
const alarm: NotificationSettings = { ...standard, target: { kind: 'service', id: 'notify.mobile_app_test_phone' }, language: 'zh', style: 'android_alarm' };
const missing = () => new Response(JSON.stringify({ message: 'Resource not found' }), { status: 404 });
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });

describe('completion notification model', () => {
  it('discovers explicit destinations, keeps unknown notify entities usable and rejects unavailable/disabled entities', () => {
    const registry = fixtureRegistry();
    registry.entities.push(
      { entity_id: 'notify.phone', platform: 'mobile_app', name: 'Phone' },
      { entity_id: 'notify.offline' }, { entity_id: 'notify.disabled', disabled_by: 'user' },
    );
    const targets = discoverNotifyTargets(registry, {
      'notify.phone': { entity_id: 'notify.phone', state: 'unknown', attributes: {} },
      'notify.offline': { entity_id: 'notify.offline', state: 'unavailable', attributes: {} },
    }, { notify: { send_message: {}, notify: {}, persistent_notification: {}, mobile_app_phone: { name: 'Phone app' } } });
    expect(targets.map(destinationKey).sort()).toEqual(['entity:notify.offline', 'entity:notify.phone', 'service:notify.mobile_app_phone']);
    expect(targets.find((target) => target.id === 'notify.phone')?.available).toBe(true);
    expect(targets.find((target) => target.id === 'notify.offline')?.available).toBe(false);
    expect(discoverNotifyTargets(registry, {}, {}).every((target) => !target.available)).toBe(true);
  });

  it('binds each printer and only triggers from running/pause to finish, excluding reconnects and failures', () => {
    const config = buildNotificationAutomation(printer, standard);
    expect(config.id).toBe(automationId(printer.id));
    expect(config.triggers).toEqual([{ trigger: 'state', entity_id: 'sensor.one_print_status', from: ['running', 'pause'], to: 'finish' }]);
    expect(config.conditions).toEqual([]);
    expect(config.actions).toEqual([{ action: 'notify.send_message', target: { entity_id: 'notify.test_phone' }, data: {
      title: '3D print completed', message: expect.stringContaining("states('sensor.one_subtask_name')"),
    } }]);
    const second = discoverPrinters(fixtureRegistry(), fixtureHass(), { type: 'custom:bambu-dashboard-card' }).find((candidate) => candidate.id === 'printer-two')!;
    const secondConfig = buildNotificationAutomation(second, standard);
    expect(secondConfig.id).not.toBe(config.id);
    expect(JSON.stringify(secondConfig.triggers)).toContain('sensor.two_print_status');
    expect(JSON.stringify(secondConfig.actions)).not.toContain('sensor.one_');
  });

  it('uses the documented Android alarm payload only through a specific phone service', () => {
    const config = buildNotificationAutomation(printer, alarm);
    expect(config.actions).toEqual([{ action: 'notify.mobile_app_test_phone', data: {
      title: '3D 打印已完成', message: expect.any(String), data: { ttl: 0, priority: 'high', channel: 'alarm_stream' },
    } }]);
    expect(parseNotificationAutomation(printer, config).settings).toEqual(alarm);
    expect(() => buildNotificationAutomation(printer, { ...standard, style: 'android_alarm' })).toThrow('does not accept channel data');
    expect(() => buildNotificationAutomation(printer, { ...alarm, target: { kind: 'service', id: 'notify.notify' } })).toThrow('specific notification');
  });

  it('persists disabled state and never embeds device names in executable templates', () => {
    const config = buildNotificationAutomation({ ...printer, name: "{{ dangerous('x') }}" }, { ...alarm, enabled: false });
    expect(config.initial_state).toBe(false);
    expect(JSON.stringify(config.actions)).not.toContain('dangerous');
    expect(() => automationId("bad'); attack('")).toThrow('identifier');
    const foreignStatus = { ...printer, entities: printer.entities.map((entity) => ({ ...entity, entry: { ...entity.entry, device_id: 'other-device' } })) };
    expect(() => buildNotificationAutomation(foreignStatus, alarm)).toThrow('print-status');
  });

  it('round-trips configuration and rejects foreign ownership or custom actions without deleting them', () => {
    const config = buildNotificationAutomation(printer, standard);
    expect(parseNotificationAutomation(printer, { ...config, alias: 'My reminder' }).settings).toEqual(standard);
    expect(() => parseNotificationAutomation(printer, { ...config, description: 'Mine' })).toThrow('owned by another');
    expect(() => parseNotificationAutomation(printer, { ...config, actions: [...config.actions as unknown[], { action: 'light.turn_on' }] })).toThrow();
    expect(() => parseNotificationAutomation(printer, { ...config, conditions: [{ condition: 'template', value_template: false }] })).toThrow('customized');
    expect(sameConfig({ b: [1, 2], a: true }, { a: true, b: [1, 2] })).toBe(true);
    expect(sameConfig({ a: 1 }, { a: 1, b: undefined })).toBe(false);
  });
});

describe('HA notification configuration API', () => {
  it('recognizes only the actual missing-config response and exposes authorization, endpoint and parse failures', async () => {
    const request = vi.fn().mockResolvedValueOnce(missing()).mockResolvedValueOnce(json({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(json({ message: 'Endpoint missing' }, 404)).mockResolvedValueOnce(new Response('<html>proxy error</html>', { status: 502 }));
    const client = new NotificationClient(fixtureHass({ fetchWithAuth: request }));
    expect(await client.load(printer)).toBeNull();
    await expect(client.load(printer)).rejects.toThrow('HTTP 401');
    await expect(client.load(printer)).rejects.toThrow('HTTP 404');
    await expect(client.load(printer)).rejects.toThrow('HTTP 502; invalid JSON response');
    expect(request.mock.calls[0][0]).toBe(`/api/config/automation/config/${automationId(printer.id)}`);
  });

  it('saves backend configuration with an authenticated POST and never sends a phone message', async () => {
    const request = vi.fn().mockResolvedValueOnce(missing()).mockResolvedValueOnce(json({ result: 'ok' }));
    const callService = vi.fn();
    const client = new NotificationClient(fixtureHass({ fetchWithAuth: request, callService }));
    const saved = await client.save(printer, alarm, null);
    expect(saved.settings).toEqual(alarm);
    expect(request.mock.calls[1][1].method).toBe('POST');
    expect(JSON.parse(request.mock.calls[1][1].body)).toEqual(buildNotificationAutomation(printer, alarm));
    expect(callService).not.toHaveBeenCalled();
  });

  it('refuses stale settings and failed writes, preserving the backend error', async () => {
    const config = buildNotificationAutomation(printer, standard);
    const request = vi.fn().mockResolvedValueOnce(json(config)).mockResolvedValueOnce(missing()).mockResolvedValueOnce(json({ message: 'Invalid action' }, 400));
    const client = new NotificationClient(fixtureHass({ fetchWithAuth: request }));
    await expect(client.save(printer, alarm, null)).rejects.toThrow('changed in HA');
    expect(request).toHaveBeenCalledTimes(1);
    await expect(client.save(printer, alarm, null)).rejects.toThrow('HTTP 400. Invalid action');
  });

  it('reapplies an unchanged saved switch when runtime was toggled elsewhere', async () => {
    const config = buildNotificationAutomation(printer, alarm);
    const hass = fixtureHass({ fetchWithAuth: vi.fn().mockResolvedValueOnce(json(config)).mockResolvedValueOnce(json({ result: 'ok' })), callService: vi.fn().mockResolvedValue(undefined) });
    hass.states['automation.reminder'] = { entity_id: 'automation.reminder', state: 'off', attributes: { id: config.id } };
    await new NotificationClient(hass).save(printer, alarm, config);
    expect(hass.callService).toHaveBeenCalledWith('automation', 'turn_on', { entity_id: 'automation.reminder' });
  });

  it('validates service/runtime API contracts rather than masking missing capabilities', async () => {
    const callWS = vi.fn().mockResolvedValueOnce({ notify: { mobile_app_phone: null } }).mockResolvedValueOnce({ config: null });
    const client = new NotificationClient(fixtureHass({ callWS }));
    await expect(client.services()).rejects.toThrow('invalid service catalog');
    await expect(client.loadedConfig('automation.reminder')).rejects.toThrow('invalid loaded');
  });
});
