import type { HomeAssistant } from './types';

export async function getUserData(hass: HomeAssistant, key: string): Promise<unknown> {
  const result = await hass.callWS<unknown>({ type: 'frontend/get_user_data', key });
  if (typeof result !== 'object' || result === null || !Object.hasOwn(result, 'value')) throw new Error('HA returned an invalid frontend user-data response.');
  return (result as { value: unknown }).value;
}

export async function setUserData(hass: HomeAssistant, key: string, value: unknown): Promise<void> {
  await hass.callWS({ type: 'frontend/set_user_data', key, value });
}
