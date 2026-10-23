import { afterEach, describe, expect, it, vi } from 'vitest';
import { BambuPrinterCamera } from '../src/ui/printer-camera';
import { BambuDashboardCard } from '../src/card';
import { discoverPrinters } from '../src/domain/printers';
import { fixtureHass, fixtureRegistry } from './fixtures';

afterEach(() => document.body.replaceChildren());

function backend(withExternal = true) {
  const registry = fixtureRegistry();
  const stored = new Map<string, unknown>();
  const callWS = vi.fn().mockImplementation(async ({ type, key, value }) => {
    if (type === 'config/device_registry/list') return registry.devices;
    if (type === 'config/entity_registry/list') return registry.entities;
    if (type === 'frontend/get_user_data') return { value: stored.get(key) ?? null };
    if (type === 'frontend/set_user_data') { stored.set(key, structuredClone(value)); return; }
    if (type === 'get_services') return {};
    throw new Error('Unexpected request');
  });
  const hass = fixtureHass({ user: { is_admin: false }, callWS, callService: vi.fn() });
  const add = () => { hass.states['camera.workbench'] = { entity_id: 'camera.workbench', state: 'idle', attributes: { friendly_name: 'Workbench camera', supported_features: 2 } }; };
  if (withExternal) add();
  const discovered = discoverPrinters(registry, hass, { type: 'custom:bambu-dashboard-card' });
  const printers = ['printer-one', 'printer-two'].map((id) => discovered.find((printer) => printer.id === id)!);
  const create = (index = 0, variant = 'tile') => {
    const element = new BambuPrinterCamera();
    Object.assign(element, { hass, registry, printer: printers[index], variant });
    document.body.append(element);
    return element;
  };
  const mount = async (index = 0, variant = 'tile') => {
    const element = create(index, variant);
    await vi.waitFor(() => expect(element.querySelector<HTMLButtonElement>('.camera-source-entry')?.disabled).toBe(false));
    return element;
  };
  return { hass, registry, printers, stored, callWS, add, create, mount };
}

async function open(element: BambuPrinterCamera) {
  element.querySelector<HTMLButtonElement>('.camera-source-entry')!.click();
  await element.updateComplete;
}
async function choose(element: BambuPrinterCamera, value: string) {
  const select = element.querySelector<HTMLSelectElement>('select')!;
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  await element.updateComplete;
}
function save(element: BambuPrinterCamera) { element.querySelector<HTMLButtonElement>('.dialog-footer .primary')!.click(); }
function camera(element: Element) { return element.querySelector('bambu-dashboard-camera') as HTMLElement & { entity: string }; }

describe('per-printer camera selection', () => {
  it('offers an empty-state setup entry without treating built-in printer cameras as external', async () => {
    const api = backend(false);
    const element = await api.mount();
    expect(camera(element).entity).toBe('camera.one_camera');
    await open(element);
    expect(element.querySelector('dialog')!.open).toBe(true);
    expect(element.textContent).toContain('No external HA cameras found');
    expect(element.querySelectorAll('select option')).toHaveLength(1);
    expect(element.querySelector('a')!.getAttribute('href')).toBe('/config/integrations/dashboard');
    element.querySelector<HTMLButtonElement>('.dialog-footer .button:not(.primary)')!.click();
    await element.updateComplete;
    expect(api.stored.size).toBe(0);
  });

  it('discovers a later camera, saves only on confirmation, restores both variants and keeps printers independent', async () => {
    const api = backend(false);
    const element = await api.mount();
    await open(element);
    api.add();
    element.hass = { ...api.hass, states: { ...api.hass.states } };
    await element.updateComplete;
    expect(element.textContent).toContain('Workbench camera');
    await choose(element, 'camera.workbench');
    expect(camera(element).entity).toBe('camera.one_camera');
    expect(api.stored.size).toBe(0);
    save(element);
    await vi.waitFor(() => expect(element.querySelector('dialog')).toBeNull());
    expect(camera(element).entity).toBe('camera.workbench');
    expect(element.querySelector('[data-camera-kind]')!.getAttribute('data-camera-kind')).toBe('external');
    const detail = await api.mount(0, 'detail');
    expect(camera(detail).entity).toBe('camera.workbench');
    expect(detail.querySelector('.camera-source-caption')!.textContent).toContain('External camera');
    const other = await api.mount(1);
    expect(camera(other).entity).toBe('camera.two_camera');
    await open(element);
    await choose(element, '');
    save(element);
    await vi.waitFor(() => expect(camera(element).entity).toBe('camera.one_camera'));
    expect(api.stored.get('bambu_dashboard.camera_source.v1.printer-one')).toEqual({ version: 1, entityId: null });
    expect(api.hass.callService).not.toHaveBeenCalled();
  });

  it('shows unavailable and missing selections without silently showing the built-in source', async () => {
    const api = backend();
    api.stored.set('bambu_dashboard.camera_source.v1.printer-one', { version: 1, entityId: 'camera.workbench' });
    api.hass.states['camera.workbench'].state = 'unavailable';
    const element = await api.mount();
    expect(camera(element)).toBeNull();
    expect(element.textContent).toContain('Unavailable');
    delete api.hass.states['camera.workbench'];
    element.hass = { ...api.hass, states: { ...api.hass.states } };
    await element.updateComplete;
    expect(element.textContent).toContain('Selected camera is missing');
    expect(element.querySelector('[data-camera-kind]')!.getAttribute('data-camera-kind')).toBe('external');
    await open(element);
    expect(element.querySelector<HTMLSelectElement>('select')!.value).toBe('camera.workbench');
    save(element);
    await vi.waitFor(() => expect(element.querySelector('[role="alert"]')!.textContent).toContain('no longer selectable'));
    expect(api.callWS.mock.calls.filter(([request]) => request.type === 'frontend/set_user_data')).toHaveLength(0);
  });

  it('preserves a failed-save choice, reports read failures and supports explicit retry', async () => {
    const api = backend();
    api.callWS.mockRejectedValueOnce(new Error('Storage read denied'));
    const element = api.create();
    await vi.waitFor(() => expect(element.textContent).toContain('Storage read denied'));
    expect(camera(element)).toBeNull();
    await open(element);
    element.querySelector<HTMLButtonElement>('.banner button')!.click();
    await vi.waitFor(() => expect(element.querySelector<HTMLSelectElement>('select')!.disabled).toBe(false));
    await choose(element, 'camera.workbench');
    api.callWS.mockRejectedValueOnce(new Error('Storage write denied'));
    save(element);
    await vi.waitFor(() => expect(element.querySelector('.banner')!.textContent).toContain('Storage write denied'));
    expect(element.querySelector<HTMLSelectElement>('select')!.value).toBe('camera.workbench');
    expect(camera(element).entity).toBe('camera.one_camera');
    expect(api.stored.size).toBe(0);
  });

  it('ignores stale loads and keeps an in-flight save targeted to the original printer', async () => {
    const api = backend();
    let finishLoad!: (result: unknown) => void;
    const loading = new Promise((resolve) => { finishLoad = resolve; });
    api.callWS.mockReturnValueOnce(loading);
    const element = api.create();
    await element.updateComplete;
    element.printer = api.printers[1];
    await element.updateComplete;
    await vi.waitFor(() => expect(camera(element)?.entity).toBe('camera.two_camera'));
    finishLoad({ value: { version: 1, entityId: 'camera.workbench' } });
    await loading;
    await element.updateComplete;
    expect(camera(element).entity).toBe('camera.two_camera');
    element.printer = api.printers[0];
    await element.updateComplete;
    await vi.waitFor(() => expect(camera(element)?.entity).toBe('camera.one_camera'));
    await open(element);
    await choose(element, 'camera.workbench');
    let finishSave!: () => void;
    const saving = new Promise<void>((resolve) => { finishSave = resolve; });
    api.callWS.mockImplementationOnce(async ({ key, value }) => { await saving; api.stored.set(key, value); });
    save(element);
    element.printer = api.printers[1];
    await element.updateComplete;
    await vi.waitFor(() => expect(camera(element)?.entity).toBe('camera.two_camera'));
    finishSave();
    await saving;
    await element.updateComplete;
    expect(api.stored.get('bambu_dashboard.camera_source.v1.printer-one')).toEqual({ version: 1, entityId: 'camera.workbench' });
    expect(api.stored.has('bambu_dashboard.camera_source.v1.printer-two')).toBe(false);
    expect(camera(element).entity).toBe('camera.two_camera');
  });

  it('exposes the entry on overview tiles and uses the saved entity after navigating to details', async () => {
    const api = backend();
    const dashboard = new BambuDashboardCard();
    dashboard.hass = api.hass;
    document.body.append(dashboard);
    await vi.waitFor(() => expect(dashboard.shadowRoot!.querySelectorAll('.printer-card .camera-source-entry')).toHaveLength(2));
    const overview = [...dashboard.shadowRoot!.querySelectorAll<BambuPrinterCamera>('bambu-printer-camera')].find((view) => view.printer?.id === 'printer-one')!;
    await vi.waitFor(() => expect(camera(overview)?.entity).toBe('camera.one_camera'));
    await open(overview);
    await choose(overview, 'camera.workbench');
    save(overview);
    await vi.waitFor(() => expect(camera(overview).entity).toBe('camera.workbench'));
    [...dashboard.shadowRoot!.querySelectorAll<HTMLButtonElement>('.printer-link')].find((button) => button.textContent!.includes('Workshop'))!.click();
    await vi.waitFor(() => expect(dashboard.shadowRoot!.querySelector('.camera-panel bambu-dashboard-camera')).not.toBeNull());
    const detail = dashboard.shadowRoot!.querySelector<BambuPrinterCamera>('bambu-printer-camera')!;
    expect(camera(detail).entity).toBe('camera.workbench');
    expect(dashboard.shadowRoot!.querySelector('[data-layout-id="camera"]')).not.toBeNull();
  });
});
