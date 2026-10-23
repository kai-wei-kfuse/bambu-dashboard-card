import { afterEach, describe, expect, it, vi } from 'vitest';
import { BambuPrinterDiagnostics } from '../src/ui/diagnostics';
import { BambuDashboardCard } from '../src/card';
import { diagnosticFixture } from './diagnostic-fixtures';

afterEach(() => document.body.replaceChildren());

describe('diagnostic detail blocks', () => {
  it('shows alarms, rejected help links and offline uncertainty without an all-clear badge', async () => {
    const api = diagnosticFixture();
    api.hass.states['binary_sensor.one_hms_errors'].state = 'on';
    api.hass.states['binary_sensor.one_hms_errors'].attributes = { Count: 1, '1-Code': 'HMS_SYNTHETIC', '1-Error': 'Synthetic fan alarm', '1-Wiki': 'javascript:alert(1)' };
    const element = new BambuPrinterDiagnostics();
    Object.assign(element, { printer: api.printer(), language: 'zh' });
    document.body.append(element);
    await element.updateComplete;
    expect(element.textContent).toContain('Synthetic fan alarm');
    expect(element.textContent).toContain('官方帮助链接不可用');
    expect(element.querySelector('a')).toBeNull();
    expect(element.querySelector('.diagnostic-state')!.classList.contains('alert')).toBe(true);
    api.hass.states['binary_sensor.one_online'].state = 'off';
    element.printer = api.printer();
    await element.updateComplete;
    expect(element.textContent).toContain('以下为最后上报状态');
    expect(element.querySelector('.diagnostic-state')!.classList.contains('clear')).toBe(false);
  });

  it('updates device readings from HA and preserves zero/unsupported/disabled states and the usage estimate label', async () => {
    const api = diagnosticFixture();
    const element = new BambuPrinterDiagnostics();
    Object.assign(element, { printer: api.printer(), language: 'zh', variant: 'device' });
    document.body.append(element);
    await element.updateComplete;
    expect(element.textContent).toContain('-48 dBm');
    expect(element.textContent).toContain('硬化钢');
    expect(element.textContent).toContain('0.4 mm');
    expect(element.textContent).toContain('累计使用（估算）');
    api.hass.states['sensor.one_wifi_signal'].state = '0';
    api.registry.entities.find((entry) => entry.translation_key === 'nozzle_type' && entry.device_id === 'printer-one')!.disabled_by = 'user';
    element.printer = api.printer();
    await element.updateComplete;
    expect(element.textContent).toContain('0 dBm');
    expect(element.textContent).toContain('已禁用');
  });

  it('adds exactly four stable draggable cards while extending existing stage/fan information', async () => {
    const api = diagnosticFixture({ callApi: vi.fn().mockResolvedValue([]) });
    api.registry.devices.push({ id: 'external-one', name: 'External', model: 'External Spool', via_device_id: 'printer-one' });
    api.registry.entities.push({ entity_id: 'sensor.one_external_spool', device_id: 'external-one', platform: 'bambu_lab', translation_key: 'external_spool' });
    api.hass.states['sensor.one_external_spool'] = { entity_id: 'sensor.one_external_spool', state: 'PLA', attributes: { type: 'PLA' } };
    api.hass.states['sensor.one_stage'].state = 'heatbed_preheating';
    const dashboard = new BambuDashboardCard();
    dashboard.setConfig({ type: 'custom:bambu-dashboard-card', language: 'zh' });
    dashboard.hass = api.hass;
    document.body.append(dashboard);
    await vi.waitFor(() => expect(dashboard.shadowRoot!.querySelectorAll('.printer-link')).toHaveLength(2));
    [...dashboard.shadowRoot!.querySelectorAll<HTMLButtonElement>('.printer-link')].find((button) => button.textContent!.includes('Workshop'))!.click();
    await vi.waitFor(() => expect(dashboard.shadowRoot!.querySelectorAll('[data-layout-id]')).toHaveLength(11));
    const root = dashboard.shadowRoot!;
    for (const id of ['alerts', 'temperature-history', 'device-health', 'recent-events']) expect(root.querySelector(`[data-layout-id="${id}"]`)).not.toBeNull();
    expect(root.querySelector('.job-stage')!.textContent).toContain('预热热床');
    expect(root.querySelector('.detail-metrics')!.textContent).toContain('热端风扇');
    [...root.querySelectorAll<HTMLButtonElement>('.layout-actions button')].find((button) => button.textContent!.includes('编辑布局'))!.click();
    await vi.waitFor(() => expect(root.querySelectorAll('.layout-card-content[inert]')).toHaveLength(11));
    expect(root.querySelectorAll('[data-layout-handle]')).toHaveLength(11);
    [...root.querySelectorAll<HTMLButtonElement>('.printer-link')].find((button) => button.textContent!.includes('Studio'))!.click();
    await vi.waitFor(() => expect(root.querySelectorAll('[data-layout-id]')).toHaveLength(10));
  });
});
