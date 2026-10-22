import { describe, expect, it, vi } from 'vitest';
import { celsius, historySpecs, parseHistoryResponse, recentPrinterEvents, temperatureSegments } from '../src/domain/history';
import type { HistoryPoint } from '../src/domain/history';
import { HistoryClient } from '../src/ha/history';
import { diagnosticFixture } from './diagnostic-fixtures';
import { fixtureHass } from './fixtures';

const end = Date.parse('2026-01-01T01:00:00Z');
const start = end - 3_600_000;
const point = (state: string, time = start, unit = '°C'): HistoryPoint => ({ entityId: 'sensor.temperature', state, time, unit });

describe('recorded printer history', () => {
  it('parses only requested state data, sorts it and keeps an actual empty response distinct from invalid responses', () => {
    const result = parseHistoryResponse([[{ entity_id: 'sensor.temperature', state: '31', last_changed: new Date(end).toISOString(), attributes: { unit_of_measurement: '°C', irrelevant: 'SYNTHETIC_SECRET' } }, { entity_id: 'sensor.temperature', state: '0', last_changed: new Date(start).toISOString(), attributes: { unit_of_measurement: '°C' } }]], ['sensor.temperature']);
    expect(result.get('sensor.temperature')!.map((entry) => entry.state)).toEqual(['0', '31']);
    expect(JSON.stringify([...result])).not.toContain('SYNTHETIC_SECRET');
    expect(parseHistoryResponse([], ['sensor.temperature']).get('sensor.temperature')).toEqual([]);
    for (const value of [{}, [null], [[{ entity_id: 'sensor.other', state: '0', last_changed: new Date(start).toISOString() }]], [[{ entity_id: 'sensor.temperature', state: '0', last_changed: 'bad date' }]]]) expect(() => parseHistoryResponse(value, ['sensor.temperature'])).toThrow();
  });

  it('uses each record’s temperature unit, preserves zero and breaks curves at unknown or missing-unit samples', () => {
    expect(celsius(point('32', start, '°F'))).toBe(0);
    expect(celsius(point('273.15', start, 'K'))).toBe(0);
    expect(celsius(point('0'))).toBe(0);
    expect(celsius({ ...point('31'), unit: undefined })).toBeNull();
    expect(celsius(point(''))).toBeNull();
    const segments = temperatureSegments([point('0'), point('unknown', start + 1000), point('31', start + 2000), point('unavailable', start + 3000)], start, end);
    expect(segments).toEqual([[{ time: start, value: 0 }], [{ time: start + 2000, value: 31 }]]);
    expect(temperatureSegments([point('20', start - 1000), point('25', start + 1000)], start, end)).toEqual([[{ time: start, value: 20 }, { time: start + 1000, value: 25 }, { time: end, value: 25 }]]);
  });

  it('filters old baselines and duplicate states instead of inventing recent events', () => {
    const api = diagnosticFixture();
    const specs = historySpecs(api.printer(), 'events');
    const id = specs[0].entity!.entry.entity_id;
    const events = recentPrinterEvents(specs, new Map([[id, [
      { entityId: id, state: 'idle', time: start - 1000 },
      { entityId: id, state: 'running', time: start + 1000 },
      { entityId: id, state: 'running', time: start + 2000 },
      { entityId: id, state: 'pause', time: start + 3000 },
      { entityId: id, state: 'running', time: start + 4000 },
      { entityId: id, state: 'finish', time: end },
    ]]]), start, end);
    expect(events.map((event) => event.state)).toEqual(['finish', 'running', 'pause', 'running']);
    expect(events[1].previous).toBe('pause');
    expect(events.at(-1)!.previous).toBe('idle');
    expect(events.every((event) => event.time >= start)).toBe(true);
  });

  it('queries explicit entities through the HA session with the exact REST flags and no device commands', async () => {
    const callApi = vi.fn().mockResolvedValue([]);
    const hass = fixtureHass({ callApi, callService: vi.fn() });
    const client = new HistoryClient(hass);
    await client.read(['sensor.temperature'], start, end, 'temperature');
    const temperature = new URL(callApi.mock.calls[0][1], 'https://ha.invalid/api/');
    expect(decodeURIComponent(temperature.pathname)).toBe('/api/history/period/2026-01-01T00:00:00.000Z');
    expect(temperature.searchParams.get('significant_changes_only')).toBe('0');
    expect(temperature.searchParams.get('filter_entity_id')).toBe('sensor.temperature');
    expect(temperature.searchParams.has('no_attributes')).toBe(false);
    expect(temperature.searchParams.has('minimal_response')).toBe(false);
    await client.read(['binary_sensor.hms', 'sensor.status'], start, end, 'events');
    const events = new URL(callApi.mock.calls[1][1], 'https://ha.invalid/api/');
    expect(events.searchParams.has('skip_initial_state')).toBe(true);
    expect(events.searchParams.has('no_attributes')).toBe(true);
    expect(callApi.mock.calls.every(([method]) => method === 'GET')).toBe(true);
    expect(hass.callService).not.toHaveBeenCalled();
  });

  it('rejects unfiltered/invalid queries and exposes transport/schema failures', async () => {
    const callApi = vi.fn().mockRejectedValueOnce(new Error('HTTP 503')).mockResolvedValueOnce({ error: 'wrong schema' });
    const client = new HistoryClient(fixtureHass({ callApi }));
    await expect(client.read([], start, end, 'events')).rejects.toThrow('explicit sensor');
    await expect(client.read(['camera.private'], start, end, 'events')).rejects.toThrow('explicit sensor');
    await expect(client.read(['sensor.status'], end, start, 'events')).rejects.toThrow('time range');
    expect(callApi).not.toHaveBeenCalled();
    await expect(client.read(['sensor.status'], start, end, 'events')).rejects.toThrow('HTTP 503');
    await expect(client.read(['sensor.status'], start, end, 'events')).rejects.toThrow('invalid history response');
  });
});
