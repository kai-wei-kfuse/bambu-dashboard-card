import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BambuDetailLayout } from '../src/ui/detail-layout';
import { fixtureHass } from './fixtures';

afterEach(() => document.body.replaceChildren());

function backend() {
  const stored = new Map<string, unknown>();
  const callWS = vi.fn().mockImplementation(async ({ type, key, value }) => {
    if (type === 'frontend/get_user_data') return { value: stored.get(key) ?? null };
    if (type === 'frontend/set_user_data') { stored.set(key, structuredClone(value)); return; }
    throw new Error('Unexpected request');
  });
  const hass = fixtureHass({ callWS, callService: vi.fn() });
  const create = () => {
    const element = new BambuDetailLayout();
    Object.assign(element, { hass, printerId: 'printer-one', cards: [
      { id: 'camera', label: 'Camera', content: html`<section><input aria-label="Draft" /></section>` },
      { id: 'job', label: 'Job', content: html`<section>Job</section>` },
      { id: 'controls', label: 'Controls', content: html`<section><button>Device action</button></section>` },
    ] });
    document.body.append(element);
    return element;
  };
  const mount = async () => {
    const element = create();
    await vi.waitFor(() => expect(button(element, 'Edit layout').disabled).toBe(false));
    return element;
  };
  return { stored, hass, callWS, create, mount };
}

function button(element: Element, label: string): HTMLButtonElement {
  return [...element.querySelectorAll<HTMLButtonElement>('.layout-actions button')].find((item) => item.textContent!.trim() === label)!;
}
function order(element: Element): string[] {
  return [...element.querySelectorAll<HTMLElement>('[data-layout-id]')].sort((a, b) => Number(a.style.order) - Number(b.style.order)).map((item) => item.dataset.layoutId!);
}
function earlier(element: Element, label: string): void { element.querySelector<HTMLButtonElement>(`button[aria-label="Move earlier ${label}"]`)!.click(); }

describe('detail layout editing', () => {
  it('moves cards without recreating content, persists only on Save and restores the order in another view', async () => {
    const api = backend();
    const element = await api.mount();
    const input = element.querySelector<HTMLInputElement>('input')!;
    input.value = 'Unsaved card form';
    button(element, 'Edit layout').click();
    await element.updateComplete;
    expect(element.querySelector('.layout-card-content')!.hasAttribute('inert')).toBe(true);
    const camera = element.querySelector<HTMLElement>('[data-layout-id="camera"]')!;
    // Masonry owns the measured span; changing order must not overwrite its inline property.
    camera.style.gridRowEnd = 'span 24';
    earlier(element, 'Job');
    await element.updateComplete;
    expect(order(element)).toEqual(['job', 'camera', 'controls']);
    expect(camera.style.gridRowEnd).toBe('span 24');
    expect(element.querySelector('input')).toBe(input);
    expect(input.value).toBe('Unsaved card form');
    expect(api.stored.size).toBe(0);
    button(element, 'Save layout').click();
    await vi.waitFor(() => expect(element.textContent).toContain('Layout saved'));
    expect(element.querySelector('.layout-card-content')!.hasAttribute('inert')).toBe(false);
    const second = await api.mount();
    expect(order(second)).toEqual(['job', 'camera', 'controls']);
    expect(api.hass.callService).not.toHaveBeenCalled();
  });

  it('keeps Cancel write-free and saves an explicit default reset independently for each printer', async () => {
    const api = backend();
    api.stored.set('bambu_dashboard.detail_layout.v1.printer-one', { version: 1, order: ['job', 'camera', 'controls'] });
    const element = await api.mount();
    button(element, 'Edit layout').click();
    await element.updateComplete;
    button(element, 'Restore default').click();
    await element.updateComplete;
    expect(order(element)).toEqual(['camera', 'job', 'controls']);
    button(element, 'Cancel').click();
    await element.updateComplete;
    expect(order(element)).toEqual(['job', 'camera', 'controls']);
    expect(api.callWS.mock.calls.filter(([request]) => request.type === 'frontend/set_user_data')).toHaveLength(0);
    button(element, 'Edit layout').click();
    await element.updateComplete;
    button(element, 'Restore default').click();
    await element.updateComplete;
    button(element, 'Save layout').click();
    await vi.waitFor(() => expect(element.textContent).toContain('Layout saved'));
    expect(api.stored.get('bambu_dashboard.detail_layout.v1.printer-one')).toEqual({ version: 1, order: [] });
    element.printerId = 'printer-two';
    await element.updateComplete;
    await vi.waitFor(() => expect(button(element, 'Edit layout').disabled).toBe(false));
    expect(order(element)).toEqual(['camera', 'job', 'controls']);
    expect(api.stored.has('bambu_dashboard.detail_layout.v1.printer-two')).toBe(false);
  });

  it('keeps a failed save as an editable draft and shows the backend error', async () => {
    const api = backend();
    const element = await api.mount();
    button(element, 'Edit layout').click();
    await element.updateComplete;
    earlier(element, 'Job');
    await element.updateComplete;
    api.callWS.mockRejectedValueOnce(new Error('HA storage write failed'));
    button(element, 'Save layout').click();
    await vi.waitFor(() => expect(element.querySelector('[role="alert"]')?.textContent).toContain('HA storage write failed'));
    expect(order(element)).toEqual(['job', 'camera', 'controls']);
    expect(button(element, 'Save layout').disabled).toBe(false);
    button(element, 'Cancel').click();
    await element.updateComplete;
    expect(order(element)).toEqual(['camera', 'job', 'controls']);
    expect(api.stored.size).toBe(0);
  });

  it('exposes read errors without pretending settings are loaded and allows retry', async () => {
    const api = backend();
    api.callWS.mockRejectedValueOnce(new Error('Read denied'));
    const element = api.create();
    await vi.waitFor(() => expect(element.querySelector('[role="alert"]')?.textContent).toContain('Read denied'));
    expect(button(element, 'Edit layout').disabled).toBe(true);
    element.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    await vi.waitFor(() => expect(button(element, 'Edit layout').disabled).toBe(false));
  });

  it('ignores a stale load after switching printers', async () => {
    const api = backend();
    let finish!: (result: unknown) => void;
    const delayed = new Promise((resolve) => { finish = resolve; });
    api.callWS.mockReturnValueOnce(delayed);
    const element = api.create();
    await vi.waitFor(() => expect(api.callWS).toHaveBeenCalled());
    element.printerId = 'printer-two';
    await element.updateComplete;
    await vi.waitFor(() => expect(button(element, 'Edit layout').disabled).toBe(false));
    finish({ value: { version: 1, order: ['controls', 'job', 'camera'] } });
    await delayed;
    await element.updateComplete;
    expect(order(element)).toEqual(['camera', 'job', 'controls']);
    expect(element.textContent).not.toContain('Layout saved');
  });

  it('keeps an in-flight save targeted to its original printer after switching views', async () => {
    const api = backend();
    const element = await api.mount();
    button(element, 'Edit layout').click();
    await element.updateComplete;
    earlier(element, 'Job');
    await element.updateComplete;
    let finish!: () => void;
    const delayed = new Promise<void>((resolve) => { finish = resolve; });
    api.callWS.mockImplementationOnce(async ({ key, value }) => {
      await delayed;
      api.stored.set(key, value);
    });
    button(element, 'Save layout').click();
    element.printerId = 'printer-two';
    await element.updateComplete;
    await vi.waitFor(() => expect(button(element, 'Edit layout').disabled).toBe(false));
    button(element, 'Edit layout').click();
    await element.updateComplete;
    earlier(element, 'Controls');
    await element.updateComplete;
    finish();
    await delayed;
    await element.updateComplete;
    expect(api.stored.get('bambu_dashboard.detail_layout.v1.printer-one')).toEqual({ version: 1, order: ['job', 'camera', 'controls'] });
    expect(api.stored.has('bambu_dashboard.detail_layout.v1.printer-two')).toBe(false);
    expect(order(element)).toEqual(['camera', 'controls', 'job']);
    expect(button(element, 'Save layout').disabled).toBe(false);
    expect(element.textContent).not.toContain('Layout saved');
  });
});
