import { describe, expect, it } from 'vitest';
import { alertGroup, diagnosticEntity, officialHmsLink, printerAlerts } from '../src/domain/diagnostics';
import { entityAvailability, findEntity } from '../src/domain/printers';
import { entityValue, stageValue } from '../src/ui/entity-value';
import { diagnosticFixture } from './diagnostic-fixtures';

describe('printer diagnostic contracts', () => {
  it('parses installed HMS and print-error schemas without copying unrelated attributes', () => {
    const api = diagnosticFixture();
    api.hass.states['binary_sensor.one_hms_errors'] = { entity_id: 'binary_sensor.one_hms_errors', state: 'on', attributes: {
      Count: 1, '1-Code': 'HMS_0300_0100', '1-Error': 'Synthetic fan fault', '1-Severity': 'serious', '1-Wiki': 'https://wiki.bambulab.com/en/hms/0300', unrelated_secret: 'SYNTHETIC_SECRET',
    } };
    api.hass.states['binary_sensor.one_print_error'] = { entity_id: 'binary_sensor.one_print_error', state: 'on', attributes: { code: '0500_0100', error: 'Synthetic print error' } };
    const result = printerAlerts(api.printer());
    expect(result.status).toBe('alert');
    expect(result.groups[0].alerts).toEqual([{ code: 'HMS_0300_0100', description: 'Synthetic fan fault', severity: 'serious', wiki: 'https://wiki.bambulab.com/en/hms/0300', linkRejected: false }]);
    expect(result.groups[1].alerts[0].description).toBe('Synthetic print error');
    expect(JSON.stringify(result.groups.map((group) => group.alerts))).not.toContain('SYNTHETIC_SECRET');
    expect(printerAlerts(api.printer('printer-two')).status).toBe('clear');
  });

  it('never turns malformed details or an asserted alarm without details into a healthy result', () => {
    const api = diagnosticFixture();
    api.hass.states['binary_sensor.one_hms_errors'].state = 'on';
    api.hass.states['binary_sensor.one_hms_errors'].attributes = { Count: 2, '1-Error': 'Synthetic alarm' };
    const group = alertGroup(api.printer(), 'hms_errors');
    expect(group.active).toBe(true);
    expect(group.invalid).toBe(true);
    expect(group.detailError).toContain('count does not match');
    api.hass.states['binary_sensor.one_print_error'].state = 'on';
    expect(alertGroup(api.printer(), 'print_error').alerts).toEqual([]);
    expect(printerAlerts(api.printer()).status).toBe('alert');
  });

  it('distinguishes offline, unknown, disabled and missing reports', () => {
    const api = diagnosticFixture();
    expect(printerAlerts(api.printer()).status).toBe('clear');
    api.hass.states['binary_sensor.one_online'].state = 'off';
    expect(printerAlerts(api.printer()).status).toBe('offline');
    api.hass.states['binary_sensor.one_online'].state = 'on';
    api.hass.states['binary_sensor.one_hms_errors'].state = 'unknown';
    expect(printerAlerts(api.printer()).status).toBe('unknown');
    const entry = api.registry.entities.find((candidate) => candidate.entity_id === 'binary_sensor.one_hms_errors')!;
    entry.disabled_by = 'user';
    expect(findEntity(api.printer().entities, 'hms_errors', 'binary_sensor')).toBeUndefined();
    expect(entityAvailability(diagnosticEntity(api.printer(), 'hms_errors', 'binary_sensor'))).toBe('disabled');
    expect(alertGroup(api.printer(), 'hms_errors').active).toBeNull();
    api.registry.entities = api.registry.entities.filter((candidate) => candidate !== entry);
    expect(alertGroup(api.printer(), 'hms_errors').availability).toBe('unsupported');
    api.hass.states['sensor.one_print_status'].state = 'unavailable';
    expect(printerAlerts(api.printer()).status).toBe('offline');
  });

  it('restricts official help links to the expected HTTPS origin and flags rejected links', () => {
    for (const value of ['javascript:alert(1)', 'http://wiki.bambulab.com/en/hms', 'https://wiki.bambulab.com.evil.invalid/a', 'https://user:pass@wiki.bambulab.com/a', 'https://wiki.bambulab.com:8080/a', null]) expect(officialHmsLink(value)).toBeUndefined();
    const api = diagnosticFixture();
    api.hass.states['binary_sensor.one_hms_errors'].state = 'on';
    api.hass.states['binary_sensor.one_hms_errors'].attributes = { Count: 1, '1-Error': 'Synthetic issue', '1-Wiki': 'javascript:alert(1)' };
    expect(alertGroup(api.printer(), 'hms_errors').alerts[0]).toMatchObject({ linkRejected: true, wiki: undefined });
  });

  it('preserves zero readings and translates known stages while retaining unknown stage text', () => {
    const api = diagnosticFixture();
    const fan = diagnosticEntity(api.printer(), 'heatbreak_fan_speed');
    expect(entityValue('zh', fan)).toBe('0 %');
    api.hass.states['sensor.one_stage'].state = 'heatbed_preheating';
    expect(stageValue('zh', api.printer().stage)).toBe('预热热床');
    api.hass.states['sensor.one_stage'].state = 'future_stage';
    expect(stageValue('zh', api.printer().stage)).toBe('future_stage');
    delete api.hass.states['sensor.one_stage'];
    expect(stageValue('zh', api.printer().stage)).toBe('未载入');
  });
});
