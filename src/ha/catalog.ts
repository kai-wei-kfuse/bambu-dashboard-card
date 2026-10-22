import type { HomeAssistant, RegistrySnapshot, Unsubscribe } from './types';

export interface CatalogState {
  snapshot?: RegistrySnapshot;
  error?: Error;
  loading: boolean;
}

type Listener = (state: CatalogState) => void;

/** Registry metadata is shared; live printer state always comes from HA. */
export class EntityCatalog {
  private listeners = new Set<Listener>();
  private subscriptions: Unsubscribe[] = [];
  private generation = 0;
  private requestSequence = 0;
  private state: CatalogState = { loading: true };
  private hass: HomeAssistant;

  constructor(hass: HomeAssistant) {
    this.hass = hass;
  }

  updateHass(hass: HomeAssistant): void {
    this.hass = hass;
  }

  subscribe(listener: Listener): Unsubscribe {
    const shouldStart = this.listeners.size === 0;
    this.listeners.add(listener);
    listener(this.state);
    if (shouldStart) void this.start();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) {
        this.generation++;
        this.subscriptions.forEach((unsubscribe) => unsubscribe());
        this.subscriptions = [];
      }
    };
  }

  private emit(state: CatalogState): void {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
  }

  private async start(): Promise<void> {
    const generation = ++this.generation;
    try {
      for (const eventType of ['device_registry_updated', 'entity_registry_updated']) {
        const unsubscribe = await this.hass.connection.subscribeEvents(() => void this.refresh(), eventType);
        if (generation !== this.generation) {
          unsubscribe();
          return;
        }
        this.subscriptions.push(unsubscribe);
      }
      await this.refresh();
    } catch (error) {
      if (generation === this.generation) {
        this.emit({ ...this.state, loading: false, error: asError(error) });
      }
    }
  }

  async refresh(): Promise<void> {
    const generation = this.generation;
    const request = ++this.requestSequence;
    this.emit({ ...this.state, loading: true, error: undefined });
    try {
      const [devices, entities] = await Promise.all([
        this.hass.callWS<RegistrySnapshot['devices']>({ type: 'config/device_registry/list' }),
        this.hass.callWS<RegistrySnapshot['entities']>({ type: 'config/entity_registry/list' }),
      ]);
      if (!Array.isArray(devices) || !Array.isArray(entities)) {
        throw new Error('Home Assistant returned an invalid device/entity registry.');
      }
      if (generation === this.generation && request === this.requestSequence) this.emit({ snapshot: { devices, entities }, loading: false });
    } catch (error) {
      if (generation === this.generation && request === this.requestSequence) this.emit({ ...this.state, loading: false, error: asError(error) });
    }
  }
}

const catalogs = new WeakMap<object, EntityCatalog>();

export function catalogFor(hass: HomeAssistant): EntityCatalog {
  let catalog = catalogs.get(hass.connection);
  if (!catalog) {
    catalog = new EntityCatalog(hass);
    catalogs.set(hass.connection, catalog);
  }
  catalog.updateHass(hass);
  return catalog;
}

export function asError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === 'object' && error !== null && 'message' in error) return new Error(String(error.message));
  return new Error(String(error));
}
