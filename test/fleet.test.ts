import { afterEach, describe, expect, it, vi } from 'vitest';
import { fleetCounts, fleetState, matchesFleetFilter } from '../src/domain/fleet';
import { BambuDashboardCard } from '../src/card';
import { diagnosticFixture } from './diagnostic-fixtures';

afterEach(() => { document.body.replaceChildren(); vi.restoreAllMocks(); });

describe('printer fleet navigation', () => {
  it('distinguishes reported faults, stale offline faults, active jobs, idle and uncertain printers', () => {
    const api = diagnosticFixture();
    expect(fleetCounts(api.printers())).toEqual({ all: 2, printing: 1, attention: 0, idle: 1, offline: 0 });
    api.hass.states['sensor.one_print_status'].state = 'failed';
    expect(fleetState(api.printer())).toMatchObject({ attention: true, diagnostic: { status: 'alert' } });
    for (const status of ['prepare', 'pause', 'running']) {
      api.hass.states['sensor.one_print_status'].state = status;
      expect(matchesFleetFilter(api.printer(), 'printing')).toBe(true);
    }
    api.hass.states['binary_sensor.one_hms_errors'].state = 'on';
    expect(fleetState(api.printer()).attention).toBe(true);
    api.hass.states['binary_sensor.one_online'].state = 'off';
    expect(fleetState(api.printer())).toMatchObject({ offline: true, attention: false, printing: false, idle: false });
    api.hass.states['binary_sensor.two_online'].state = 'unknown';
    api.hass.states['sensor.two_print_status'].state = 'unknown';
    expect(fleetState(api.printer('printer-two')).diagnostic.status).toBe('unknown');
    expect(matchesFleetFilter(api.printer('printer-two'), 'idle')).toBe(false);
  });

  it('filters without reordering, reacts to HA state, and opens even a hidden alert card without saving preferences', async () => {
    const api = diagnosticFixture({ callApi: vi.fn().mockResolvedValue([]), callService: vi.fn() });
    const originalWS = api.hass.callWS;
    api.hass.callWS = vi.fn().mockImplementation((request) => request.type === 'frontend/get_user_data' && request.key === 'bambu_dashboard.detail_layout.v1.printer-one'
      ? Promise.resolve({ value: { version: 2, order: ['job'], cards: { alerts: { hidden: true, collapsed: true, width: 'normal' } } } }) : originalWS(request));
    const dashboard = new BambuDashboardCard();
    dashboard.setConfig({ type: 'custom:bambu-dashboard-card', language: 'en' });
    dashboard.hass = api.hass;
    document.body.append(dashboard);
    const root = dashboard.shadowRoot!;
    await vi.waitFor(() => expect(root.querySelectorAll('.printer-card')).toHaveLength(2));
    const filter = (name: string) => [...root.querySelectorAll<HTMLButtonElement>('.fleet-filters button')].find((button) => button.textContent!.includes(name))!;
    filter('Faults').click();
    await dashboard.updateComplete;
    expect(root.querySelectorAll('.printer-card')).toHaveLength(0);
    expect(root.textContent).toContain('No printers match');
    api.hass.states['binary_sensor.one_print_error'].state = 'on';
    dashboard.hass = { ...api.hass };
    await dashboard.updateComplete;
    expect(root.querySelectorAll('.printer-card')).toHaveLength(1);
    expect(root.querySelector('.printer-card')!.textContent).toContain('Workshop');
    vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(() => {});
    root.querySelector<HTMLButtonElement>('.tile-diagnostics')!.click();
    await vi.waitFor(() => expect(root.querySelector('[data-layout-id="alerts"] .alerts-panel')).not.toBeNull());
    expect(root.querySelector('[data-layout-id="alerts"]')!.classList.contains('layout-revealed')).toBe(true);
    expect(api.hass.callWS).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'frontend/set_user_data' }));
    expect(api.hass.callService).not.toHaveBeenCalled();
  });
});
