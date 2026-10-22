import { entityAvailability, findEntity } from './printers';
import type { EntityBinding, Printer } from './printers';

export interface PrinterAlert { code?: string; description?: string; severity?: string; wiki?: string; linkRejected: boolean }
export interface AlertGroup {
  kind: 'hms_errors' | 'print_error';
  entity?: EntityBinding;
  availability: ReturnType<typeof entityAvailability>;
  active: boolean | null;
  alerts: PrinterAlert[];
  invalid: boolean;
  detailError?: string;
}

export function diagnosticEntity(printer: Printer, key: string, domain = 'sensor'): EntityBinding | undefined {
  return findEntity(printer.entities, key, domain, { includeDisabled: true });
}

export function binaryReading(entity?: EntityBinding): boolean | null {
  if (entityAvailability(entity) !== 'ready') return null;
  return entity!.state!.state === 'on' ? true : entity!.state!.state === 'off' ? false : null;
}

export function officialHmsLink(value: unknown): string | undefined {
  if (typeof value !== 'string') return;
  let url: URL;
  try { url = new URL(value); } catch { return; }
  return url.origin === 'https://wiki.bambulab.com' && !url.username && !url.password ? url.href : undefined;
}

function optionalText(value: unknown): string | undefined {
  if (value === undefined || value === null) return;
  if (typeof value !== 'string') throw new Error('Invalid diagnostic text field.');
  return value || undefined;
}

function hmsDetails(attributes: Record<string, unknown>): PrinterAlert[] {
  const count = attributes.Count;
  if (!Number.isSafeInteger(count) || (count as number) < 0) throw new Error('Invalid HMS count.');
  const indexes = Object.keys(attributes).map((key) => /^(\d+)-Error$/.exec(key)?.[1]).filter((index): index is string => index !== undefined).sort((a, b) => Number(a) - Number(b));
  if (indexes.length !== count) throw new Error('HMS count does not match the details.');
  return indexes.map((index) => {
    const description = optionalText(attributes[`${index}-Error`]);
    if (!description) throw new Error('HMS description is missing.');
    const link = attributes[`${index}-Wiki`];
    const wiki = officialHmsLink(link);
    return { code: optionalText(attributes[`${index}-Code`]), description, severity: optionalText(attributes[`${index}-Severity`]), wiki, linkRejected: link !== undefined && link !== null && !wiki };
  });
}

export function alertGroup(printer: Printer, kind: AlertGroup['kind']): AlertGroup {
  const entity = diagnosticEntity(printer, kind, 'binary_sensor');
  const availability = entityAvailability(entity);
  const active = binaryReading(entity);
  const group: AlertGroup = { kind, entity, availability, active, alerts: [], invalid: availability === 'ready' && active === null };
  if (active !== true) return group;
  try {
    if (kind === 'hms_errors') group.alerts = hmsDetails(entity!.state!.attributes);
    else {
      const attributes = entity!.state!.attributes;
      const code = optionalText(attributes.code);
      const description = optionalText(attributes.error);
      if (code || description) group.alerts = [{ code, description, linkRejected: false }];
    }
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    // Keep the asserted alarm visible while flagging an incompatible detail schema.
    group.invalid = true;
    group.detailError = error.message;
  }
  return group;
}

export function printerAlerts(printer: Printer) {
  const groups = [alertGroup(printer, 'hms_errors'), alertGroup(printer, 'print_error')];
  const online = binaryReading(diagnosticEntity(printer, 'online', 'binary_sensor'));
  const status = online === false || ['offline', 'unavailable'].includes(printer.status) ? 'offline' : groups.some((group) => group.active === true) ? 'alert'
    : online === true && printer.status !== 'unknown' && groups.every((group) => group.active === false && !group.invalid) ? 'clear' : 'unknown';
  return { groups, online, status };
}
