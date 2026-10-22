import { findEntity, numeric } from './printers';
import type { Printer } from './printers';

const UNIT_MILLISECONDS: Record<string, number> = { h: 3_600_000, min: 60_000, s: 1_000 };

export function remainingDuration(printer: Printer): number | null {
  const entity = findEntity(printer.entities, 'remaining_time');
  const value = numeric(entity);
  const unit = entity?.state?.attributes.unit_of_measurement;
  if (value === null || value < 0 || typeof unit !== 'string' || !Object.hasOwn(UNIT_MILLISECONDS, unit)) return null;
  const duration = value * UNIT_MILLISECONDS[unit];
  return Number.isFinite(duration) ? duration : null;
}

export function estimateCompletion(printer: Printer, now: number): number | null {
  if (!['running', 'prepare'].includes(printer.status)) return null;
  const duration = remainingDuration(printer);
  if (duration === null) return null;
  const timestamp = now + duration;
  // Date's platform-supported range, rather than a product-specific duration cap, defines validity.
  return Number.isNaN(new Date(timestamp).getTime()) ? null : timestamp;
}
