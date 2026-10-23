export interface CardPresentation { hidden: boolean; collapsed: boolean; width: 'normal' | 'wide' }
export interface LayoutPreference { version: 2; order: string[]; cards: Record<string, CardPresentation> }
export interface LayoutMove { source: string; target: string; after: boolean }

export function defaultLayout(): LayoutPreference { return { version: 2, order: [], cards: {} }; }

export function cardPresentation(preference: LayoutPreference, id: string): CardPresentation {
  return Object.hasOwn(preference.cards, id) ? preference.cards[id] : { hidden: false, collapsed: false, width: 'normal' };
}

export function updateCardPresentation(preference: LayoutPreference, id: string, patch: Partial<CardPresentation>): LayoutPreference {
  return { ...preference, cards: { ...preference.cards, [id]: { ...cardPresentation(preference, id), ...patch } } };
}

export function parseLayoutPreference(value: unknown): LayoutPreference {
  if (value === null) return defaultLayout();
  if (typeof value !== 'object' || value === null || !('version' in value) || ![1, 2].includes(value.version as number) || !('order' in value) || !Array.isArray(value.order)) {
    throw new Error('HA returned an unsupported detail layout preference.');
  }
  if (!value.order.every((id): id is string => typeof id === 'string' && id.length > 0) || new Set(value.order).size !== value.order.length) {
    throw new Error('Detail layout card IDs must be unique nonempty strings.');
  }
  if (value.version === 1) return { ...defaultLayout(), order: [...value.order] };
  if (!('cards' in value) || typeof value.cards !== 'object' || value.cards === null || Array.isArray(value.cards)) throw new Error('Invalid detail card presentation settings.');
  const cards = Object.fromEntries(Object.entries(value.cards).map(([id, settings]) => {
    if (!id || typeof settings !== 'object' || settings === null || typeof settings.hidden !== 'boolean' || typeof settings.collapsed !== 'boolean' || !['normal', 'wide'].includes(settings.width)) throw new Error('Invalid detail card presentation settings.');
    return [id, { hidden: settings.hidden, collapsed: settings.collapsed, width: settings.width }];
  }));
  return { version: 2, order: [...value.order], cards };
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
