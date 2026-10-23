import { parseHistoryResponse } from '../domain/history';
import type { HistoryRecords } from '../domain/history';
import type { HomeAssistant } from './types';

export class HistoryClient {
  constructor(private hass: HomeAssistant) {}
  async read(entityIds: readonly string[], start: number, end: number, variant: 'temperature' | 'events'): Promise<HistoryRecords> {
    // An empty filter would query unrelated household history, so it is never a valid request.
    if (!entityIds.length || entityIds.some((id) => !/^(sensor|binary_sensor)\.[a-z0-9_]+$/.test(id))) throw new Error('History requires explicit sensor entity IDs.');
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error('History requires a valid time range.');
    const query = new URLSearchParams({ filter_entity_id: [...new Set(entityIds)].join(','), end_time: new Date(end).toISOString(), significant_changes_only: '0' });
    if (variant === 'events') { query.set('no_attributes', '1'); query.set('skip_initial_state', '1'); }
    const response = await this.hass.callApi<unknown>('GET', `history/period/${encodeURIComponent(new Date(start).toISOString())}?${query}`);
    return parseHistoryResponse(response, entityIds);
  }
}
