import { parseLayoutPreference } from '../domain/layout';
import type { LayoutPreference } from '../domain/layout';
import type { HomeAssistant } from './types';
import { getUserData, setUserData } from './user-data';

export class LayoutClient {
  constructor(private hass: HomeAssistant) {}

  async load(printerId: string): Promise<LayoutPreference> {
    return parseLayoutPreference(await getUserData(this.hass, this.key(printerId)));
  }

  async save(printerId: string, preference: LayoutPreference): Promise<void> {
    const value = parseLayoutPreference(preference);
    await setUserData(this.hass, this.key(printerId), value);
  }

  private key(printerId: string): string { return `bambu_dashboard.detail_layout.v1.${printerId}`; }
}
