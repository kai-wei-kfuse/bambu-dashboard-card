import { diagnosticEntity } from './diagnostics';
import type { EntityBinding, Printer } from './printers';

export interface HistoryPoint { entityId: string; state: string; time: number; unit?: string }
export type HistoryRecords = Map<string, HistoryPoint[]>;
export interface HistorySpec { key: string; entity?: EntityBinding; color: string; target: boolean }
export interface PrinterEvent extends HistoryPoint { kind: string; previous?: string }

export function historySpecs(printer: Printer, variant: 'temperature' | 'events'): HistorySpec[] {
  const keys = variant === 'temperature' ? ['nozzle_temp', 'target_nozzle_temp', 'bed_temp', 'target_bed_temp'] : ['print_status', 'hms_errors', 'print_error'];
  return keys.map((key, index) => ({ key, entity: diagnosticEntity(printer, key, key === 'hms_errors' || key === 'print_error' ? 'binary_sensor' : 'sensor'), color: index < 2 ? 'var(--bd-accent)' : 'var(--bd-chart-secondary, #438bcc)', target: key.startsWith('target_') }));
}

export function parseHistoryResponse(value: unknown, requested: readonly string[]): HistoryRecords {
  if (!Array.isArray(value)) throw new Error('HA returned an invalid history response.');
  const records: HistoryRecords = new Map(requested.map((id) => [id, []]));
  for (const group of value) {
    if (!Array.isArray(group)) throw new Error('HA returned an invalid history group.');
    for (const entry of group) {
      if (typeof entry !== 'object' || entry === null || typeof entry.entity_id !== 'string' || !records.has(entry.entity_id) || typeof entry.state !== 'string' || typeof entry.last_changed !== 'string') throw new Error('HA returned an invalid history state.');
      const time = Date.parse(entry.last_changed);
      if (!Number.isFinite(time)) throw new Error('HA returned an invalid history timestamp.');
      const unit = entry.attributes?.unit_of_measurement;
      if (unit !== undefined && typeof unit !== 'string') throw new Error('HA returned an invalid historical temperature unit.');
      records.get(entry.entity_id)!.push({ entityId: entry.entity_id, state: entry.state, time, unit });
    }
  }
  for (const points of records.values()) points.sort((a, b) => a.time - b.time);
  return records;
}

export function celsius(point: HistoryPoint): number | null {
  if (!point.state.trim() || point.state === 'unknown' || point.state === 'unavailable') return null;
  const value = Number(point.state);
  if (!Number.isFinite(value)) return null;
  if (point.unit === '°C') return value;
  if (point.unit === '°F') return (value - 32) * 5 / 9;
  if (point.unit === 'K') return value - 273.15;
  return null;
}

/** Recorder states remain in effect until the next sample, including unknown/unavailable gaps. */
export function recordedTemperatureAt(points: readonly HistoryPoint[], time: number): HistoryPoint | undefined {
  let low = 0;
  let high = points.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (points[middle].time <= time) low = middle + 1; else high = middle;
  }
  return points[low - 1];
}

export function temperatureSegments(points: readonly HistoryPoint[], start: number, end: number): { time: number; value: number }[][] {
  const segments: { time: number; value: number }[][] = [];
  let current: { time: number; value: number }[] = [];
  for (const point of points) {
    if (point.time > end) continue;
    const value = celsius(point);
    if (value === null) { if (current.length) segments.push(current); current = []; continue; }
    current.push({ time: Math.max(start, point.time), value });
  }
  if (current.length) {
    current.push({ time: end, value: current.at(-1)!.value });
    segments.push(current);
  }
  return segments;
}

export function recentPrinterEvents(specs: readonly HistorySpec[], records: HistoryRecords, start: number, end: number): PrinterEvent[] {
  const events: PrinterEvent[] = [];
  for (const spec of specs) {
    if (!spec.entity) continue;
    let previous: string | undefined;
    for (const point of records.get(spec.entity.entry.entity_id) || []) {
      if (point.state === previous) continue;
      if (point.time >= start && point.time <= end) events.push({ ...point, kind: spec.key, previous });
      previous = point.state;
    }
  }
  return events.sort((a, b) => b.time - a.time || a.entityId.localeCompare(b.entityId));
}
