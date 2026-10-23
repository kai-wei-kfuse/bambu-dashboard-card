import { printerAlerts } from './diagnostics';
import type { Printer } from './printers';

export type FleetFilter = 'all' | 'printing' | 'attention' | 'idle' | 'offline';

export function fleetState(printer: Printer) {
  const diagnostic = printerAlerts(printer);
  const offline = diagnostic.status === 'offline';
  const attention = diagnostic.status === 'alert';
  return {
    diagnostic, offline, attention,
    printing: !offline && ['prepare', 'running', 'pause'].includes(printer.status),
    idle: !offline && !attention && ['idle', 'finish'].includes(printer.status),
  };
}

export function matchesFleetFilter(printer: Printer, filter: FleetFilter): boolean {
  return filter === 'all' || fleetState(printer)[filter];
}

export function fleetCounts(printers: readonly Printer[]): Record<FleetFilter, number> {
  return printers.reduce((counts, printer) => {
    const state = fleetState(printer);
    counts.all++;
    for (const filter of ['printing', 'attention', 'idle', 'offline'] as const) if (state[filter]) counts[filter]++;
    return counts;
  }, { all: 0, printing: 0, attention: 0, idle: 0, offline: 0 });
}
