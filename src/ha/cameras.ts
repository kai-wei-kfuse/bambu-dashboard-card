import { parseCameraPreference } from '../domain/cameras';
import type { CameraPreference } from '../domain/cameras';
import type { HomeAssistant } from './types';
import { getUserData, setUserData } from './user-data';

export class CameraSourceClient {
  constructor(private hass: HomeAssistant) {}
  async load(printerId: string): Promise<CameraPreference> {
    return parseCameraPreference(await getUserData(this.hass, this.key(printerId)));
  }
  async save(printerId: string, preference: CameraPreference): Promise<void> {
    await setUserData(this.hass, this.key(printerId), parseCameraPreference(preference));
  }
  private key(printerId: string): string { return `bambu_dashboard.camera_source.v1.${printerId}`; }
}
