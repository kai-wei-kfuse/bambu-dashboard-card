import { afterEach, describe, expect, it, vi } from 'vitest';
import { CompletionNotifications } from '../src/ui/completion-notifications';
import { automationId, buildNotificationAutomation } from '../src/domain/notifications';
import type { AutomationConfig, NotificationSettings } from '../src/domain/notifications';
import { discoverPrinters } from '../src/domain/printers';
import type { HassEvent } from '../src/ha/types';
import { fixtureHass, fixtureRegistry } from './fixtures';

afterEach(() => document.body.replaceChildren());

function backend(initial?: NotificationSettings) {
  const registry = fixtureRegistry();
  registry.entities.push({ entity_id: 'notify.phone', platform: 'mobile_app', name: 'Test phone' });
  const listeners = new Map<string, (event: HassEvent) => void>();
  const unsubscribe = vi.fn();
  const hass = fixtureHass({
    user: { is_admin: true },
    connection: { subscribeEvents: vi.fn(async (listener, type) => { listeners.set(type, listener); return unsubscribe; }) },
    callService: vi.fn().mockResolvedValue(undefined),
  });
  hass.states['notify.phone'] = { entity_id: 'notify.phone', state: 'unknown', attributes: {} };
  const printers = discoverPrinters(registry, hass, { type: 'custom:bambu-dashboard-card' });
  const configs = new Map<string, AutomationConfig>();
  const loaded = new Map<string, AutomationConfig>();
  if (initial) configs.set(automationId(printers[0].id), buildNotificationAutomation(printers[0], initial));
  hass.fetchWithAuth = vi.fn(async (path, options) => {
    const id = path.split('/').at(-1)!;
    if (options?.method === 'POST') {
      configs.set(id, JSON.parse(options.body as string));
      return Response.json({ result: 'ok' });
    }
    return configs.has(id) ? Response.json(configs.get(id)) : Response.json({ message: 'Resource not found' }, { status: 404 });
  });
  hass.callWS = vi.fn().mockImplementation(async (request: Record<string, unknown>) => {
    if (request.type === 'get_services') return { notify: { send_message: {}, mobile_app_test_phone: { name: 'Android phone' } } };
    if (request.type === 'automation/config') return { config: loaded.get(String(request.entity_id)) };
    throw new Error('Unexpected request');
  });
  const mount = async (index = 0) => {
    const element = new CompletionNotifications();
    element.hass = hass;
    element.printer = printers[index];
    element.registry = registry;
    document.body.append(element);
    await vi.waitFor(() => expect(element.shadowRoot?.querySelector('select')?.hasAttribute('disabled')).toBe(false));
    return element;
  };
  return { hass, printers, registry, configs, loaded, mount, listeners, unsubscribe };
}

function select(element: CompletionNotifications, label: string, value: string) {
  const input = element.shadowRoot!.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`)!;
  input.value = value;
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

const alarm: NotificationSettings = { enabled: true, target: { kind: 'service', id: 'notify.mobile_app_test_phone' }, language: 'en', style: 'android_alarm' };

describe('per-printer completion settings', () => {
  it('tests an explicitly chosen speech style without replacing the saved alarm configuration', async () => {
    const api = backend(alarm);
    const element = await api.mount();
    const before = structuredClone(api.configs.get(automationId(api.printers[0].id)));
    select(element, 'Reminder style', 'android_tts');
    await element.updateComplete;
    select(element, 'Receiving phone / destination', 'service:notify.mobile_app_test_phone');
    await element.updateComplete;
    element.shadowRoot!.querySelector<HTMLButtonElement>('.test-notification')!.click();
    await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('HA accepted the test request'));
    expect(api.hass.callService).toHaveBeenCalledWith('notify', 'mobile_app_test_phone', expect.objectContaining({
      message: 'TTS', data: { ttl: 0, priority: 'high', media_stream: 'alarm_stream', tts_text: expect.any(String) },
    }));
    expect(api.configs.get(automationId(api.printers[0].id))).toEqual(before);
    expect(element.shadowRoot!.textContent).toContain('Unsaved changes');
  });

  it('tests an unsaved phone choice with the automatic reminder disabled and preserves stored settings', async () => {
    const api = backend();
    const element = await api.mount();
    expect(element.shadowRoot!.querySelector<HTMLButtonElement>('.test-notification')!.disabled).toBe(true);
    select(element, 'Receiving phone / destination', 'service:notify.mobile_app_test_phone');
    await element.updateComplete;
    element.shadowRoot!.querySelector<HTMLButtonElement>('.test-notification')!.click();
    await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('HA accepted the test request'));
    expect(api.hass.callService).toHaveBeenCalledTimes(1);
    expect(api.hass.callService).toHaveBeenCalledWith('notify', 'mobile_app_test_phone', expect.objectContaining({ data: { ttl: 0, priority: 'high', channel: 'alarm_stream' } }));
    expect(element.shadowRoot!.querySelector<HTMLInputElement>('input')!.checked).toBe(false);
    expect(api.configs.size).toBe(0);
    expect(vi.mocked(api.hass.fetchWithAuth).mock.calls.every(([, options]) => !options?.method)).toBe(true);
    expect(element.shadowRoot!.textContent).toContain('Unsaved changes');
    select(element, 'Reminder style', 'standard');
    await element.updateComplete;
    expect(element.shadowRoot!.textContent).not.toContain('HA accepted the test request');
  });

  it('prevents duplicate in-flight tests and ignores the late result after switching printers', async () => {
    const api = backend(alarm);
    let finish!: () => void;
    const delayed = new Promise<void>((resolve) => { finish = resolve; });
    api.hass.callService = vi.fn().mockReturnValue(delayed);
    const element = await api.mount();
    const button = element.shadowRoot!.querySelector<HTMLButtonElement>('.test-notification')!;
    button.click();
    button.click();
    expect(api.hass.callService).toHaveBeenCalledTimes(1);
    await element.updateComplete;
    expect(button.disabled).toBe(true);
    element.printer = api.printers[1];
    await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('No reminder configured'));
    finish();
    await delayed;
    await element.updateComplete;
    expect(element.shadowRoot!.textContent).not.toContain('HA accepted the test request');
    expect(element.shadowRoot!.querySelector<HTMLInputElement>('input')!.disabled).toBe(false);
    expect(api.configs.size).toBe(1);
  });

  it('shows a failed test explicitly and lets the user retry without claiming delivery', async () => {
    const api = backend(alarm);
    api.hass.callService = vi.fn().mockRejectedValue(new Error('Phone disconnected'));
    const element = await api.mount();
    element.shadowRoot!.querySelector<HTMLButtonElement>('.test-notification')!.click();
    await vi.waitFor(() => expect(element.shadowRoot!.querySelector('[role="alert"]')?.textContent).toContain('Phone disconnected'));
    expect(element.shadowRoot!.textContent).not.toContain('HA accepted the test request');
    expect(element.shadowRoot!.querySelector<HTMLButtonElement>('.test-notification')!.disabled).toBe(false);
  });

  it('requires an explicit phone, persists an Android alarm automation and confirms runtime separately', async () => {
    const api = backend();
    const element = await api.mount();
    expect(element.shadowRoot!.textContent).toContain('No reminder configured');
    expect(element.shadowRoot!.querySelector<HTMLButtonElement>('.primary')!.disabled).toBe(true);
    element.shadowRoot!.querySelector<HTMLInputElement>('input')!.click();
    select(element, 'Receiving phone / destination', 'service:notify.mobile_app_test_phone');
    await element.updateComplete;
    expect(element.shadowRoot!.textContent).toContain('Unsaved changes');
    element.shadowRoot!.querySelector<HTMLButtonElement>('.primary')!.click();
    await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('Saved; HA runtime loading is not yet confirmed'));
    const config = api.configs.get(automationId(api.printers[0].id))!;
    expect(config.initial_state).toBe(true);
    expect(JSON.stringify(config.actions)).toContain('alarm_stream');
    expect(api.configs.has(automationId(api.printers[1].id))).toBe(false);
    expect(api.hass.callService).not.toHaveBeenCalled();

    api.loaded.set('automation.test_reminder', config);
    const states = { ...api.hass.states, 'automation.test_reminder': { entity_id: 'automation.test_reminder', state: 'on', attributes: { id: config.id } } };
    element.hass = { ...api.hass, states };
    await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('Saved and enabled in HA'));
    element.remove();
    expect(api.unsubscribe).toHaveBeenCalled();
    expect(api.configs.get(automationId(api.printers[0].id))).toEqual(config);
  });

  it('loads saved settings in another view and persists disabling without changing the destination', async () => {
    const api = backend(alarm);
    const element = await api.mount();
    expect(element.shadowRoot!.querySelector<HTMLSelectElement>('select[aria-label="Receiving phone / destination"]')!.value).toBe('service:notify.mobile_app_test_phone');
    expect(element.shadowRoot!.querySelector<HTMLInputElement>('input')!.checked).toBe(true);
    element.shadowRoot!.querySelector<HTMLInputElement>('input')!.click();
    await element.updateComplete;
    element.shadowRoot!.querySelector<HTMLButtonElement>('.primary')!.click();
    await vi.waitFor(() => expect(api.configs.get(automationId(api.printers[0].id))?.initial_state).toBe(false));
    const other = await api.mount();
    expect(other.shadowRoot!.querySelector<HTMLInputElement>('input')!.checked).toBe(false);
    expect(other.shadowRoot!.querySelector<HTMLSelectElement>('select[aria-label="Receiving phone / destination"]')!.value).toBe('service:notify.mobile_app_test_phone');
  });

  it('reports API failure and does not present an unconfigured or successful state', async () => {
    const api = backend();
    api.hass.fetchWithAuth = vi.fn().mockResolvedValue(Response.json({ message: 'Forbidden' }, { status: 403 }));
    const element = new CompletionNotifications();
    Object.assign(element, { hass: api.hass, registry: api.registry, printer: api.printers[0] });
    document.body.append(element);
    await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('HTTP 403'));
    expect(element.shadowRoot!.textContent).not.toContain('No reminder configured');
    expect(element.shadowRoot!.querySelector<HTMLButtonElement>('.primary')!.disabled).toBe(true);
  });

  it('shows an administrator requirement without calling protected APIs for a non-admin', async () => {
    const api = backend();
    const element = new CompletionNotifications();
    Object.assign(element, { hass: { ...api.hass, user: { is_admin: false } }, registry: api.registry, printer: api.printers[0] });
    document.body.append(element);
    await element.updateComplete;
    expect(element.shadowRoot!.textContent).toContain('An HA administrator must configure');
    expect(api.hass.fetchWithAuth).not.toHaveBeenCalled();
    expect(element.shadowRoot!.querySelector('.primary')).toBeNull();
  });

  it('keeps edits through ordinary HA state updates and detects a loaded configuration mismatch', async () => {
    const api = backend(alarm);
    const config = api.configs.get(automationId(api.printers[0].id))!;
    api.hass.states['automation.test_reminder'] = { entity_id: 'automation.test_reminder', state: 'on', attributes: { id: config.id } };
    api.loaded.set('automation.test_reminder', { ...config, initial_state: false });
    const element = await api.mount();
    expect(element.shadowRoot!.textContent).toContain('runtime loading is not yet confirmed');
    element.shadowRoot!.querySelector<HTMLInputElement>('input')!.click();
    element.hass = { ...api.hass, states: { ...api.hass.states } };
    await element.updateComplete;
    expect(element.shadowRoot!.querySelector<HTMLInputElement>('input')!.checked).toBe(false);
    expect(element.shadowRoot!.textContent).toContain('Unsaved changes');
    api.loaded.set('automation.test_reminder', config);
    api.listeners.get('automation_reloaded')!({ event_type: 'automation_reloaded', data: {} });
    await element.updateComplete;
    expect(element.shadowRoot!.querySelector<HTMLInputElement>('input')!.checked).toBe(false);
  });

  it('ignores a late load after switching printers and detaches the old subscription', async () => {
    const api = backend();
    let finish!: (response: Response) => void;
    const delayed = new Promise<Response>((resolve) => { finish = resolve; });
    const original = api.hass.fetchWithAuth;
    api.hass.fetchWithAuth = vi.fn((path, options) => path.endsWith(automationId(api.printers[0].id)) ? delayed : original(path, options));
    const element = new CompletionNotifications();
    Object.assign(element, { hass: api.hass, registry: api.registry, printer: api.printers[0] });
    document.body.append(element);
    await vi.waitFor(() => expect(api.hass.fetchWithAuth).toHaveBeenCalled());
    element.printer = api.printers[1];
    await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('No reminder configured'));
    finish(Response.json(buildNotificationAutomation(api.printers[0], alarm)));
    await delayed;
    await element.updateComplete;
    expect(element.shadowRoot!.querySelector<HTMLInputElement>('input')!.checked).toBe(false);
    expect(element.shadowRoot!.querySelector<HTMLSelectElement>('select[aria-label="Receiving phone / destination"]')!.value).toBe('');
    expect(api.unsubscribe).toHaveBeenCalled();
  });

  it('ignores a queued reload callback from the previous printer without clearing the current runtime confirmation', async () => {
    const api = backend(alarm);
    for (const [index, printer] of api.printers.entries()) {
      const config = buildNotificationAutomation(printer, alarm);
      api.configs.set(automationId(printer.id), config);
      const entityId = `automation.reminder_${index}`;
      api.loaded.set(entityId, config);
      api.hass.states[entityId] = { entity_id: entityId, state: 'on', attributes: { id: config.id } };
    }
    const element = await api.mount();
    const staleCallback = api.listeners.get('automation_reloaded')!;
    element.printer = api.printers[1];
    await element.updateComplete;
    await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('Saved and enabled in HA'));
    const calls = vi.mocked(api.hass.callWS).mock.calls.length;
    staleCallback({ event_type: 'automation_reloaded', data: {} });
    await element.updateComplete;
    expect(vi.mocked(api.hass.callWS).mock.calls).toHaveLength(calls);
    expect(element.shadowRoot!.textContent).toContain('Saved and enabled in HA');
  });

  it('keeps a pending save bound to the original printer while the new printer remains editable', async () => {
    const api = backend(alarm);
    let finish!: () => void;
    const delayed = new Promise<void>((resolve) => { finish = resolve; });
    const original = api.hass.fetchWithAuth;
    api.hass.fetchWithAuth = vi.fn(async (path, options) => {
      const response = await original(path, options);
      if (options?.method === 'POST') await delayed;
      return response;
    });
    const element = await api.mount();
    element.shadowRoot!.querySelector<HTMLInputElement>('input')!.click();
    await element.updateComplete;
    element.shadowRoot!.querySelector<HTMLButtonElement>('.primary')!.click();
    await vi.waitFor(() => expect(api.configs.get(automationId(api.printers[0].id))?.initial_state).toBe(false));
    element.printer = api.printers[1];
    await vi.waitFor(() => expect(element.shadowRoot!.textContent).toContain('No reminder configured'));
    expect(element.shadowRoot!.querySelector<HTMLInputElement>('input')!.disabled).toBe(false);
    finish();
    await delayed;
    await element.updateComplete;
    expect(element.shadowRoot!.querySelector<HTMLInputElement>('input')!.disabled).toBe(false);
    expect(api.configs.has(automationId(api.printers[1].id))).toBe(false);
  });
});
