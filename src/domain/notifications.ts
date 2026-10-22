import { findEntity } from './printers';
import type { Printer } from './printers';
import type { HassEntity, RegistrySnapshot } from '../ha/types';
import type { Language } from '../ui/i18n';

export type NotifyDestination = { kind: 'entity' | 'service'; id: string };
export type NotificationStyle = 'standard' | 'android_alarm' | 'android_tts';
export interface NotifyTarget extends NotifyDestination { label: string; available: boolean }
export interface NotificationSettings { enabled: boolean; target: NotifyDestination; language: Language; style: NotificationStyle }
export type AutomationConfig = Record<string, unknown>;
export interface SavedNotification { config: AutomationConfig; settings: NotificationSettings }
export type ServiceCatalog = Record<string, Record<string, { name?: string }>>;
export interface NotificationAction {
  action: string;
  target?: { entity_id: string };
  data: { title: string; message: string; data?: { ttl: number; priority: string; channel?: string; media_stream?: string; tts_text?: string } };
}

const OWNER = 'Managed by Bambu Dashboard Card: completion-notification/v1/';

function identifier(value: string): string {
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) throw new Error('Invalid registered device identifier.');
  return value;
}

function sensorId(value: string): string {
  if (!/^sensor\.[a-z0-9_]+$/.test(value)) throw new Error('Invalid registered sensor entity ID.');
  return value;
}

export function automationId(printerId: string): string {
  return `bambu_dashboard_finish_${identifier(printerId)}`;
}

export function destinationKey(target: NotifyDestination): string { return `${target.kind}:${target.id}`; }

export function discoverNotifyTargets(registry: RegistrySnapshot, states: Record<string, HassEntity>, services: ServiceCatalog): NotifyTarget[] {
  const targets: NotifyTarget[] = registry.entities.filter((entry) => entry.entity_id.startsWith('notify.') && !entry.disabled_by).map((entry) => {
    const state = states[entry.entity_id];
    const device = registry.devices.find((candidate) => candidate.id === entry.device_id);
    return {
      kind: 'entity', id: entry.entity_id,
      label: entry.name || String(state?.attributes.friendly_name || device?.name_by_user || device?.name || entry.original_name || entry.entity_id),
      // A notify entity can be unknown until its first message; only missing/unavailable is unusable.
      available: Boolean(state && state.state !== 'unavailable' && services.notify?.send_message),
    };
  });
  for (const service of Object.keys(services.notify || {})) {
    if (/^mobile_app_[a-z0-9_]+$/.test(service)) targets.push({ kind: 'service', id: `notify.${service}`, label: service.slice('mobile_app_'.length).replaceAll('_', ' '), available: true });
  }
  return targets.sort((left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id));
}

function notificationAction(settings: Pick<NotificationSettings, 'target' | 'style'>, content: { title: string; message: string }): NotificationAction {
  const target = settings.target;
  if (target.kind === 'entity' ? !/^notify\.[a-z0-9_]+$/.test(target.id) : target.kind !== 'service' || !/^notify\.mobile_app_[a-z0-9_]+$/.test(target.id)) {
    throw new Error('Select a specific notification entity or mobile-app destination.');
  }
  if (settings.style !== 'standard' && target.kind !== 'service') throw new Error('Android alarm alerts require a specific mobile_app service; notify.send_message does not accept channel data.');
  // Companion's documented alarm payload uses immediate delivery; ttl=0 can drop an offline cloud push instead of sounding late.
  const data = settings.style === 'android_tts'
    ? { title: content.title, message: 'TTS', data: { ttl: 0, priority: 'high', media_stream: 'alarm_stream', tts_text: content.message } }
    : { ...content, ...(settings.style === 'android_alarm' ? { data: { ttl: 0, priority: 'high', channel: 'alarm_stream' } } : {}) };
  return target.kind === 'entity' ? { action: 'notify.send_message', target: { entity_id: target.id }, data } : { action: target.id, data };
}

export function buildTestNotification(printer: Printer, settings: Omit<NotificationSettings, 'enabled'>): NotificationAction {
  return notificationAction(settings, {
    title: settings.language === 'zh' ? '打印提醒测试' : 'Print reminder test',
    // Direct service calls do not render Jinja; test text must already be plain text.
    message: settings.language === 'zh' ? `${printer.name}：这是一条测试提醒，请确认手机是否响铃。` : `Test reminder for ${printer.name}. Please check whether your phone sounds.`,
  });
}

export function buildNotificationAutomation(printer: Printer, settings: NotificationSettings): AutomationConfig {
  const status = findEntity(printer.entities, 'print_status');
  if (!status || status.entry.device_id !== printer.id) throw new Error('The printer has no registered print-status sensor.');
  const id = identifier(printer.id);
  const task = findEntity(printer.entities, 'subtask_name');
  if (task && task.entry.device_id !== printer.id) throw new Error('The project sensor does not belong to this printer.');
  const name = `{{ device_attr('${id}', 'name_by_user') or device_attr('${id}', 'name') or 'Bambu Lab' }}`;
  const project = task ? `{{ states('${sensorId(task.entry.entity_id)}') }}` : '';
  const action = notificationAction(settings, {
    title: settings.language === 'zh' ? '3D 打印已完成' : '3D print completed',
    message: settings.language === 'zh' ? `${name} 已完成打印。${project}` : `${name} finished printing. ${project}`,
  });
  return {
    id: automationId(id), alias: `Bambu Dashboard · Print complete · ${printer.name}`,
    description: `${OWNER}${id}`, initial_state: settings.enabled,
    triggers: [{ trigger: 'state', entity_id: sensorId(status.entry.entity_id), from: ['running', 'pause'], to: 'finish' }],
    conditions: [],
    actions: [action],
    mode: 'queued',
  };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Compare raw HA configurations without depending on JSON object key order. */
export function sameConfig(left: unknown, right: unknown): boolean {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) return left.length === right.length && left.every((value, index) => sameConfig(value, right[index]));
  if (!isRecord(left) || !isRecord(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every((key) => Object.hasOwn(right, key) && sameConfig(left[key], right[key]));
}

export function parseNotificationAutomation(printer: Printer, value: unknown): SavedNotification {
  if (!isRecord(value) || value.id !== automationId(printer.id) || value.description !== `${OWNER}${printer.id}`) {
    throw new Error('This automation ID is owned by another configuration. It will not be overwritten.');
  }
  const actions = value.actions;
  const action = Array.isArray(actions) && actions.length === 1 && isRecord(actions[0]) ? actions[0] : undefined;
  const entityId = action && isRecord(action.target) ? action.target.entity_id : undefined;
  const target: NotifyDestination = action?.action === 'notify.send_message' && typeof entityId === 'string'
    ? { kind: 'entity', id: entityId } : { kind: 'service', id: String(action?.action) };
  const title = action && isRecord(action.data) ? action.data.title : undefined;
  const data = action && isRecord(action.data) ? action.data : undefined;
  const style: NotificationStyle = data?.message === 'TTS' && isRecord(data.data) && data.data.media_stream === 'alarm_stream'
    ? 'android_tts' : data?.data !== undefined ? 'android_alarm' : 'standard';
  const language = title === '3D 打印已完成' ? 'zh' : title === '3D print completed' ? 'en' : undefined;
  if (typeof value.initial_state !== 'boolean' || !language || typeof value.alias !== 'string') {
    throw new Error('The managed notification automation was customized or has an unsupported version. Duplicate it before editing.');
  }
  const settings: NotificationSettings = { enabled: value.initial_state, target, language, style };
  const expected = { ...buildNotificationAutomation(printer, settings), alias: value.alias };
  if (!sameConfig(value, expected)) throw new Error('The managed notification automation was customized or its sensor IDs changed. Review it in HA before saving.');
  return { config: value, settings };
}

export function runtimeAutomation(states: Record<string, HassEntity>, printerId: string): HassEntity | undefined {
  const id = automationId(printerId);
  return Object.values(states).find((entity) => entity.entity_id.startsWith('automation.') && entity.attributes.id === id);
}
