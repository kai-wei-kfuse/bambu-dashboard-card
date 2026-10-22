export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
  last_changed?: string;
  last_updated?: string;
}

export interface DeviceEntry {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  via_device_id?: string | null;
  identifiers?: [string, string][];
  serial_number?: string | null;
  disabled_by?: string | null;
}

export interface EntityEntry {
  entity_id: string;
  device_id?: string | null;
  platform?: string;
  translation_key?: string | null;
  unique_id?: string;
  name?: string | null;
  original_name?: string | null;
  disabled_by?: string | null;
  hidden_by?: string | null;
  entity_category?: string | null;
}

export interface HassEvent {
  event_type: string;
  data: Record<string, unknown>;
}

export type Unsubscribe = () => void;

export interface HassConnection {
  subscribeEvents(callback: (event: HassEvent) => void, eventType: string): Promise<Unsubscribe>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  language: string;
  connection: HassConnection;
  config?: { time_zone?: string };
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  callService(domain: string, service: string, data?: Record<string, unknown>): Promise<unknown>;
  callApi<T>(method: string, path: string, parameters?: unknown): Promise<T>;
  fetchWithAuth(path: string, options?: RequestInit): Promise<Response>;
}

export interface CardConfig {
  type: string;
  title?: string;
  discovery?: 'auto' | 'selected';
  devices?: string[];
  language?: 'auto' | 'en' | 'zh';
}

export interface RegistrySnapshot {
  devices: DeviceEntry[];
  entities: EntityEntry[];
}

export interface NativeCard extends HTMLElement {
  hass?: HomeAssistant;
  setConfig(config: Record<string, unknown>): void;
}

declare global {
  interface Window {
    loadCardHelpers?: () => Promise<{
      createCardElement(config: Record<string, unknown>): NativeCard;
    }>;
    customCards?: Record<string, unknown>[];
  }
}
