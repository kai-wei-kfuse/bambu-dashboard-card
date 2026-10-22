import { buildNotificationAutomation, buildTestNotification, isRecord, parseNotificationAutomation, sameConfig, automationId, runtimeAutomation } from '../domain/notifications';
import type { AutomationConfig, NotificationSettings, SavedNotification, ServiceCatalog } from '../domain/notifications';
import type { Printer } from '../domain/printers';
import type { HomeAssistant } from './types';
import { asError } from './catalog';

export class NotificationClient {
  constructor(private hass: HomeAssistant) {}

  async services(): Promise<ServiceCatalog> {
    const services = await this.hass.callWS<unknown>({ type: 'get_services' });
    if (!isRecord(services) || !Object.values(services).every((domain) => isRecord(domain) && Object.values(domain).every((service) => isRecord(service) && (service.name === undefined || typeof service.name === 'string')))) throw new Error('HA returned an invalid service catalog.');
    return services as ServiceCatalog;
  }

  async load(printer: Printer): Promise<SavedNotification | null> {
    const value = await this.request(printer.id, 'GET');
    return value === null ? null : parseNotificationAutomation(printer, value);
  }

  async save(printer: Printer, settings: NotificationSettings, previous: AutomationConfig | null): Promise<SavedNotification> {
    // Re-read before writing to detect another editor; the HA API has no conditional-write support.
    const current = await this.load(printer);
    if (!sameConfig(current?.config ?? null, previous)) throw new Error('Notification settings changed in HA. Refresh before saving again.');
    const config = buildNotificationAutomation(printer, settings);
    const result = await this.request(printer.id, 'POST', config);
    if (!isRecord(result) || result.result !== 'ok') throw new Error('HA did not confirm saving the notification automation.');
    // HA skips reload for unchanged raw config. Reapply an explicitly saved switch if it was toggled elsewhere.
    const runtime = runtimeAutomation(this.hass.states, printer.id);
    if (sameConfig(current?.config, config) && runtime && runtime.state !== (settings.enabled ? 'on' : 'off')) {
      await this.hass.callService('automation', settings.enabled ? 'turn_on' : 'turn_off', { entity_id: runtime.entity_id });
    }
    return { config, settings };
  }

  async loadedConfig(entityId: string): Promise<unknown> {
    const result = await this.hass.callWS<unknown>({ type: 'automation/config', entity_id: entityId });
    if (!isRecord(result) || !isRecord(result.config)) throw new Error('HA returned an invalid loaded automation configuration.');
    return result.config;
  }

  async test(printer: Printer, settings: Omit<NotificationSettings, 'enabled'>): Promise<void> {
    const action = buildTestNotification(printer, settings);
    await this.hass.callService('notify', action.action.slice('notify.'.length), {
      ...action.data, ...(action.target ? { entity_id: action.target.entity_id } : {}),
    });
  }

  private async request(printerId: string, method: 'GET' | 'POST', config?: AutomationConfig): Promise<unknown> {
    const response = await this.hass.fetchWithAuth(`/api/config/automation/config/${encodeURIComponent(automationId(printerId))}`,
      method === 'GET' ? undefined : { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
    let body: unknown;
    try { body = await response.json(); }
    catch (error) { throw new Error(`Notification configuration: HTTP ${response.status}; invalid JSON response. ${asError(error).message}`); }
    if (method === 'GET' && response.status === 404 && isRecord(body) && body.message === 'Resource not found') return null;
    if (!response.ok) {
      const detail = isRecord(body) && typeof body.message === 'string' ? body.message : response.statusText;
      throw new Error(`Notification configuration: HTTP ${response.status}. ${detail}`);
    }
    return body;
  }
}
