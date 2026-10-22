import { describe, expect, it } from 'vitest';
import { discoverPrinters, findEntity } from '../src/domain/printers';
import { estimateCompletion, remainingDuration } from '../src/domain/timing';
import { fixtureHass, fixtureRegistry } from './fixtures';

function printer() {
  return discoverPrinters(fixtureRegistry(), fixtureHass(), { type: 'custom:bambu-dashboard-card' }).find((item) => item.id === 'printer-one')!;
}

describe('remaining duration and wall-clock estimate', () => {
  it.each([['h', '1.25', 4_500_000], ['min', '15', 900_000], ['s', '90', 90_000], ['h', '0', 0]])('normalizes %s values with zero preserved', (unit, value, expected) => {
    const target = printer();
    const entity = findEntity(target.entities, 'remaining_time')!;
    entity.state!.state = String(value);
    entity.state!.attributes.unit_of_measurement = unit;
    expect(remainingDuration(target)).toBe(expected);
    expect(estimateCompletion(target, 1_000)).toBe(1_000 + Number(expected));
  });

  it.each(['unknown', 'unavailable', '-1', 'invalid', '1e308'])('does not calculate an estimate from %s remaining data', (value) => {
    const target = printer();
    findEntity(target.entities, 'remaining_time')!.state!.state = value;
    expect(remainingDuration(target)).toBeNull();
    expect(estimateCompletion(target, Date.now())).toBeNull();
  });

  it.each(['pause', 'idle', 'finish', 'failed', 'unavailable'])('does not promise a running completion time for %s', (status) => {
    expect(estimateCompletion({ ...printer(), status }, Date.now())).toBeNull();
  });

  it('handles midnight rollover and recalculates from the supplied clock', () => {
    const target = printer();
    const now = Date.parse('2026-01-01T23:30:00Z');
    expect(new Date(estimateCompletion(target, now)!).toISOString()).toBe('2026-01-02T00:45:00.000Z');
    expect(estimateCompletion(target, now + 60_000)).toBe(estimateCompletion(target, now)! + 60_000);
    expect(estimateCompletion({ ...target, status: 'prepare' }, now)).not.toBeNull();
    expect(estimateCompletion(target, Number.NaN)).toBeNull();
  });

  it('preserves unsupported or disabled remaining sensors as unavailable for calculation', () => {
    const target = printer();
    const entity = findEntity(target.entities, 'remaining_time')!;
    entity.state!.attributes.unit_of_measurement = 'unknown unit';
    expect(remainingDuration(target)).toBeNull();
    entity.state!.attributes.unit_of_measurement = 'h';
    entity.entry.disabled_by = 'user';
    expect(remainingDuration(target)).toBeNull();
  });
});
