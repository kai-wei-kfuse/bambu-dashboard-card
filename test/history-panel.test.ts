import { afterEach, describe, expect, it, vi } from 'vitest';
import { BambuPrinterHistory } from '../src/ui/history-panel';
import { diagnosticFixture } from './diagnostic-fixtures';

afterEach(() => { document.body.replaceChildren(); vi.useRealTimers(); });
const now = Date.parse('2026-01-01T01:00:00Z');

function response(path: string) {
  const url = new URL(path, 'https://ha.invalid/api/');
  const end = Date.parse(url.searchParams.get('end_time')!);
  return url.searchParams.get('filter_entity_id')!.split(',').map((id) => [
    { entity_id: id, state: id.includes('target') ? '0' : '25', last_changed: new Date(end - 1_800_000).toISOString(), attributes: { unit_of_measurement: '°C' } },
    { entity_id: id, state: id.includes('target') ? '0' : '31', last_changed: new Date(end - 1000).toISOString(), attributes: { unit_of_measurement: '°C' } },
  ]);
}

function setup(callApi = vi.fn().mockImplementation(async (_method, path) => response(path)), variant: 'temperature' | 'events' = 'temperature') {
  const api = diagnosticFixture({ callApi, callService: vi.fn() });
  const element = new BambuPrinterHistory();
  Object.assign(element, { hass: api.hass, printer: api.printer(), variant, now });
  document.body.append(element);
  return { api, element, callApi };
}

describe('history information blocks', () => {
  it('renders real recorded curves and zero targets, and refreshes from the existing minute clock without its own timer', async () => {
    vi.useFakeTimers();
    const { api, element, callApi } = setup();
    await vi.waitFor(() => expect(element.querySelectorAll('.temperature-chart path')).toHaveLength(4));
    expect(element.textContent).toContain('0 °C');
    expect(element.querySelector('svg')!.innerHTML).not.toContain('NaN');
    expect(vi.getTimerCount()).toBe(0);
    element.now = now + 30_000;
    await element.updateComplete;
    expect(callApi).toHaveBeenCalledOnce();
    element.now = now + 60_000;
    await vi.waitFor(() => expect(callApi).toHaveBeenCalledTimes(2));
    expect(api.hass.callService).not.toHaveBeenCalled();
  });

  it('distinguishes successful empty history from errors and supports explicit retry', async () => {
    const callApi = vi.fn().mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('HTTP 503')).mockImplementation(async (_method, path) => response(path));
    const { element } = setup(callApi);
    await vi.waitFor(() => expect(element.textContent).toContain('No valid temperature history'));
    expect(element.querySelector('[role="alert"]')).toBeNull();
    element.querySelector<HTMLButtonElement>('.icon-button')!.click();
    await vi.waitFor(() => expect(element.querySelector('[role="alert"]')?.textContent).toContain('HTTP 503'));
    expect(element.textContent).toContain('History/Recorder');
    element.querySelector<HTMLButtonElement>('.history-error button')!.click();
    await vi.waitFor(() => expect(element.querySelector('.temperature-chart')).not.toBeNull());
    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  it('keeps the last successful result visibly dated when a refresh fails instead of fabricating a new graph', async () => {
    const { element, callApi } = setup();
    await vi.waitFor(() => expect(element.querySelector('.temperature-chart')).not.toBeNull());
    const graph = element.querySelector('svg')!.innerHTML;
    callApi.mockRejectedValueOnce(new Error('Recorder unavailable'));
    element.now = now + 60_000;
    await vi.waitFor(() => expect(element.querySelector('[role="alert"]')?.textContent).toContain('Recorder unavailable'));
    expect(element.querySelector('svg')!.innerHTML).toBe(graph);
    expect(element.textContent).toContain('Showing the last successful result');
  });

  it('ignores a late response after switching printer and after unmounting', async () => {
    let finish!: (value: unknown) => void;
    const delayed = new Promise((resolve) => { finish = resolve; });
    const callApi = vi.fn().mockReturnValueOnce(delayed).mockResolvedValue([]);
    const { api, element } = setup(callApi);
    await vi.waitFor(() => expect(callApi).toHaveBeenCalledOnce());
    const originalPath = callApi.mock.calls[0][1];
    element.printer = api.printer('printer-two');
    await vi.waitFor(() => expect(element.textContent).toContain('No valid temperature history'));
    finish(response(originalPath));
    await delayed;
    await element.updateComplete;
    expect(element.querySelector('.temperature-chart')).toBeNull();
    expect(callApi.mock.calls[1][1]).toContain('sensor.two_nozzle_temp');
    element.remove();
    element.now += 60_000;
    await element.updateComplete;
    expect(callApi).toHaveBeenCalledTimes(2);
  });

  it('shows recorded event transitions chronologically with honest scope, not a cache-derived print archive', async () => {
    const callApi = vi.fn().mockImplementation(async (_method, path) => {
      const url = new URL(path, 'https://ha.invalid/api/');
      const id = url.searchParams.get('filter_entity_id')!.split(',')[0];
      return [[
        { entity_id: id, state: 'prepare', last_changed: new Date(now - 10_000).toISOString() },
        { entity_id: id, state: 'running', last_changed: new Date(now - 9000).toISOString() },
        { entity_id: id, state: 'pause', last_changed: new Date(now - 8000).toISOString() },
        { entity_id: id, state: 'running', last_changed: new Date(now - 7000).toISOString() },
        { entity_id: id, state: 'finish', last_changed: new Date(now - 1000).toISOString() },
      ]];
    });
    const { element } = setup(callApi, 'events');
    await vi.waitFor(() => expect(element.querySelectorAll('.printer-event-list li')).toHaveLength(5));
    const labels = [...element.querySelectorAll('.printer-event-list b')].map((item) => item.textContent);
    expect(labels).toEqual(['Print completed', 'Print resumed', 'Paused', 'Print started', 'Preparing']);
    expect(element.textContent).toContain('not a complete print archive');
    expect(callApi.mock.calls[0][1]).toContain('skip_initial_state=1');
  });

  it('does not issue an unfiltered request when history entities are disabled or missing', async () => {
    const api = diagnosticFixture();
    for (const entry of api.registry.entities) if (['nozzle_temp', 'target_nozzle_temp', 'bed_temp', 'target_bed_temp'].includes(entry.translation_key || '')) entry.disabled_by = 'user';
    const callApi = vi.fn();
    const element = new BambuPrinterHistory();
    Object.assign(element, { hass: { ...api.hass, callApi }, printer: api.printer(), now });
    document.body.append(element);
    await element.updateComplete;
    expect(element.textContent).toContain('No supported history entities');
    expect(callApi).not.toHaveBeenCalled();
  });
});
