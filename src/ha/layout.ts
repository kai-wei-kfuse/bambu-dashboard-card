import { parseLayoutPreference } from '../domain/layout';
import type { LayoutPreference } from '../domain/layout';
import type { HomeAssistant } from './types';

export class LayoutClient {
  constructor(private hass: HomeAssistant) {}

  async load(printerId: string): Promise<LayoutPreference> {
    const result = await this.hass.callWS<unknown>({ type: 'frontend/get_user_data', key: this.key(printerId) });
    if (typeof result !== 'object' || result === null || !Object.hasOwn(result, 'value')) throw new Error('HA returned an invalid layout storage response.');
    return parseLayoutPreference((result as { value: unknown }).value);
  }

  async save(printerId: string, preference: LayoutPreference): Promise<void> {
    const value = parseLayoutPreference(preference);
    await this.hass.callWS({ type: 'frontend/set_user_data', key: this.key(printerId), value });
  }

  private key(printerId: string): string { return `bambu_dashboard.detail_layout.v1.${printerId}`; }
}
