export interface LayoutPreference { version: 1; order: string[] }
export interface LayoutMove { source: string; target: string; after: boolean }

export function parseLayoutPreference(value: unknown): LayoutPreference {
  if (value === null) return { version: 1, order: [] };
  if (typeof value !== 'object' || value === null || !('version' in value) || value.version !== 1 || !('order' in value) || !Array.isArray(value.order)) {
    throw new Error('HA returned an unsupported detail layout preference.');
  }
  if (!value.order.every((id): id is string => typeof id === 'string' && id.length > 0) || new Set(value.order).size !== value.order.length) {
    throw new Error('Detail layout card IDs must be unique nonempty strings.');
  }
  return { version: 1, order: [...value.order] };
}

/** Keep stored positions for known cards; new capabilities append without hiding anything. */
export function resolveLayoutOrder(available: readonly string[], saved: readonly string[]): string[] {
  const present = new Set(available);
  const remembered = new Set(saved);
  return [...saved.filter((id) => present.has(id)), ...available.filter((id) => !remembered.has(id))];
}

export function moveLayoutCard(available: readonly string[], saved: readonly string[], move: LayoutMove): string[] {
  const order = resolveLayoutOrder(available, saved);
  if (!order.includes(move.source) || !order.includes(move.target)) throw new Error('The layout cards changed. Choose a current card to move.');
  if (move.source === move.target) return [...saved];
  const next = order.filter((id) => id !== move.source);
  next.splice(next.indexOf(move.target) + (move.after ? 1 : 0), 0, move.source);
  // Preserve preferences for a temporarily unavailable AMS/spool so reconnecting restores its place.
  let index = 0;
  const remembered = saved.map((id) => available.includes(id) ? next[index++] : id);
  return [...remembered, ...next.slice(index)];
}
