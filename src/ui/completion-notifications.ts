import { LitElement, css, html, nothing } from 'lit';
import type { PropertyValues } from 'lit';
import { destinationKey, discoverNotifyTargets, runtimeAutomation, sameConfig } from '../domain/notifications';
import type { NotificationStyle, SavedNotification, ServiceCatalog } from '../domain/notifications';
import type { Printer } from '../domain/printers';
import { asError } from '../ha/catalog';
import { NotificationClient } from '../ha/notifications';
import type { HomeAssistant, RegistrySnapshot, Unsubscribe } from '../ha/types';
import { text } from './i18n';
import type { Language, Message } from './i18n';
import { syncSelectValues } from './select-values';

export class CompletionNotifications extends LitElement {
  static properties = {
    hass: { attribute: false }, printer: { attribute: false }, registry: { attribute: false }, language: { attribute: false },
    _saved: { state: true }, _services: { state: true }, _enabled: { state: true }, _recipient: { state: true },
    _style: { state: true }, _loading: { state: true }, _saving: { state: true }, _error: { state: true },
    _runtimeConfig: { state: true }, _runtimeError: { state: true }, _dirty: { state: true },
  };
  static styles = css`
    :host { display: block; margin-top: 18px; }
    * { box-sizing: border-box; }
    section { background: var(--bd-panel); border: 1px solid var(--bd-line); border-radius: 13px; overflow: hidden; }
    header { display: flex; gap: 12px; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--bd-line); }
    h2 { font-size: 13px; font-weight: 650; margin: 0; }
    .body { padding: 18px 20px; }
    p { margin: 0 0 14px; color: var(--bd-muted); font-size: 12px; line-height: 1.6; }
    .fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
    label { display: flex; flex-direction: column; gap: 7px; font-size: 11px; color: var(--bd-muted); min-width: 0; }
    .check { flex-direction: row; align-items: center; color: var(--bd-text); font-size: 13px; }
    input { accent-color: var(--bd-accent); width: 17px; height: 17px; }
    select { width: 100%; min-width: 0; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--bd-line); background: var(--bd-bg); color: var(--bd-text); font: inherit; font-size: 12px; }
    button { border: 1px solid var(--bd-line); background: var(--bd-raised); color: var(--bd-text); padding: 8px 13px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 12px; }
    button.primary { background: var(--bd-accent); color: #08291f; border-color: var(--bd-accent); font-weight: 650; }
    button:disabled, select:disabled, input:disabled { opacity: .5; cursor: not-allowed; }
    button:focus-visible, select:focus-visible, input:focus-visible { outline: 2px solid var(--bd-accent); outline-offset: 3px; }
    .footer { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
    .status { font-size: 12px; color: var(--bd-muted); }
    .status.active { color: var(--bd-accent); }
    .error { color: var(--bd-danger); overflow-wrap: anywhere; margin-bottom: 14px; font-size: 12px; }
    .helper { font-size: 11px; margin: 12px 0 0; }
    .automation { color: var(--bd-accent); border: 0; background: none; padding: 0; margin-top: 12px; }
    @media (max-width:700px) { .fields { grid-template-columns: 1fr; } }
  `;

  hass?: HomeAssistant;
  printer?: Printer;
  registry?: RegistrySnapshot;
  language: Language = 'en';
  private _saved?: SavedNotification | null;
  private _services: ServiceCatalog = {};
  private _enabled = false;
  private _recipient = '';
  private _style: NotificationStyle = 'android_alarm';
  private _loading = false;
  private _saving = false;
  private _error = '';
  private _runtimeError = '';
  private _runtimeConfig?: unknown;
  private _dirty = false;
  private context?: { connection: object; printerId: string; admin?: boolean };
  private generation = 0;
  private runtimeSequence = 0;
  private runtimeId?: string;
  private unsubscribe?: Unsubscribe;

  connectedCallback(): void {
    super.connectedCallback();
    this.requestUpdate();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.generation++;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.context = undefined;
  }

  protected willUpdate(changes: PropertyValues): void {
    if (!this.hass || !this.printer || !this.registry) return;
    const { connection, user } = this.hass;
    if (this.context?.connection !== connection || this.context?.printerId !== this.printer.id || this.context?.admin !== user?.is_admin) {
      this.unsubscribe?.();
      this.unsubscribe = undefined;
      this.context = { connection, printerId: this.printer.id, admin: user?.is_admin };
      const generation = ++this.generation;
      this._saved = undefined;
      this._saving = false;
      this._enabled = false;
      this._recipient = '';
      this._style = 'android_alarm';
      this._dirty = false;
      this._runtimeConfig = undefined;
      this._runtimeError = '';
      this.runtimeId = undefined;
      if (user?.is_admin !== false) void this.initialize(generation);
    } else if (changes.has('hass') && this._saved) {
      const id = runtimeAutomation(this.hass.states, this.printer.id)?.entity_id;
      if (id !== this.runtimeId) void this.verifyRuntime(this.generation);
    }
  }

  protected updated(): void { syncSelectValues(this.renderRoot); }

  private t(key: Message): string { return text(this.language, key); }
  private get targets() {
    return this.hass && this.registry ? discoverNotifyTargets(this.registry, this.hass.states, this._services)
      .filter((target) => this._style === 'standard' || target.kind === 'service') : [];
  }

  private async initialize(generation: number): Promise<void> {
    this._loading = true;
    this._error = '';
    const hass = this.hass!;
    try {
      const unsubscribe = await hass.connection.subscribeEvents(() => { void this.verifyRuntime(generation); }, 'automation_reloaded');
      if (generation !== this.generation) { unsubscribe(); return; }
      this.unsubscribe = unsubscribe;
      await this.load(generation);
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._loading = false;
    }
  }

  private async load(generation = this.generation): Promise<void> {
    const hass = this.hass!;
    const printer = this.printer!;
    this._loading = true;
    this._error = '';
    try {
      const client = new NotificationClient(hass);
      const [saved, services] = await Promise.all([client.load(printer), client.services()]);
      if (generation !== this.generation) return;
      this._saved = saved;
      this._services = services;
      this._enabled = saved?.settings.enabled ?? false;
      this._recipient = saved ? destinationKey(saved.settings.target) : '';
      this._style = saved?.settings.style ?? 'android_alarm';
      this._dirty = false;
      await this.verifyRuntime(generation);
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._loading = false;
    }
  }

  private async verifyRuntime(generation: number): Promise<void> {
    if (generation !== this.generation) return;
    const sequence = ++this.runtimeSequence;
    const entity = this.hass && this.printer ? runtimeAutomation(this.hass.states, this.printer.id) : undefined;
    this.runtimeId = entity?.entity_id;
    this._runtimeConfig = undefined;
    this._runtimeError = '';
    if (!entity || !this._saved) return;
    try {
      const config = await new NotificationClient(this.hass!).loadedConfig(entity.entity_id);
      if (generation === this.generation && sequence === this.runtimeSequence) this._runtimeConfig = config;
    } catch (error) {
      if (generation === this.generation && sequence === this.runtimeSequence) this._runtimeError = asError(error).message;
    }
  }

  private async save(): Promise<void> {
    const generation = this.generation;
    const printer = this.printer!;
    const hass = this.hass!;
    this._saving = true;
    this._error = '';
    try {
      const target = this.targets.find((candidate) => destinationKey(candidate) === this._recipient);
      if (!target && (this._enabled || !this._saved || destinationKey(this._saved.settings.target) !== this._recipient)) throw new Error(this.t('chooseRecipient'));
      if (this._enabled && !target?.available) throw new Error(this.t('notifyTargetUnavailable'));
      const settings = { enabled: this._enabled, target: target ? { kind: target.kind, id: target.id } : this._saved!.settings.target, language: this.language, style: this._style };
      const saved = await new NotificationClient(hass).save(printer, settings, this._saved?.config ?? null);
      if (generation !== this.generation) return;
      this._saved = saved;
      this._dirty = false;
      this._runtimeConfig = undefined;
      await this.verifyRuntime(generation);
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._saving = false;
    }
  }

  private runtimeStatus(): Message {
    if (this._saved === undefined) return 'notifyNotLoaded';
    if (this._saved === null) return 'notifyNotConfigured';
    if (!sameConfig(this._runtimeConfig, this._saved.config)) return 'notifyPending';
    const entity = runtimeAutomation(this.hass!.states, this.printer!.id);
    if (!entity || !['on', 'off'].includes(entity.state)) return 'notifyRuntimeUnavailable';
    if ((entity.state === 'on') !== this._saved.settings.enabled) return 'notifyStateMismatch';
    return this._saved.settings.enabled ? 'notifyActive' : 'notifyInactive';
  }

  protected render() {
    if (!this.hass || !this.printer || !this.registry) return nothing;
    const admin = this.hass.user?.is_admin !== false;
    const busy = this._loading || this._saving;
    const target = this.targets.find((candidate) => destinationKey(candidate) === this._recipient);
    const runtime = runtimeAutomation(this.hass.states, this.printer.id);
    const status = this.runtimeStatus();
    return html`<section aria-label=${this.t('completionNotifications')}>
      <header><h2>${this.t('completionNotifications')}</h2><button ?disabled=${busy || !admin} @click=${() => void (this.unsubscribe ? this.load() : this.initialize(this.generation))}>${this.t('refresh')}</button></header>
      <div class="body"><p>${this.t('notifyHelp')}</p>
        ${!admin ? html`<p role="status">${this.t('notifyAdmin')}</p>` : html`
          ${this._error ? html`<div class="error" role="alert">${this.t('notifyError')}: ${this._error}</div>` : nothing}
          ${this._loading ? html`<p role="status">${this.t('loading')}</p>` : nothing}
          <label class="check"><input type="checkbox" .checked=${this._enabled} ?disabled=${busy || this._saved === undefined} @change=${(event: Event) => { this._enabled = (event.target as HTMLInputElement).checked; this._dirty = true; }}>${this.t('notifyEnable')}</label>
          <div class="fields">
            <label>${this.t('notifyStyle')}<select aria-label=${this.t('notifyStyle')} data-value=${this._style} ?disabled=${busy || this._saved === undefined} @change=${(event: Event) => { this._style = (event.target as HTMLSelectElement).value as NotificationStyle; this._recipient = ''; this._dirty = true; }}><option value="android_alarm">${this.t('notifyAlarm')}</option><option value="standard">${this.t('notifyStandard')}</option></select></label>
            <label>${this.t('notifyRecipient')}<select aria-label=${this.t('notifyRecipient')} data-value=${this._recipient} ?disabled=${busy || this._saved === undefined} @change=${(event: Event) => { this._recipient = (event.target as HTMLSelectElement).value; this._dirty = true; }}>
              <option value="">${this.t('chooseRecipient')}</option>${this._recipient && !target ? html`<option value=${this._recipient} disabled>${this._recipient} · ${this.t('unavailable')}</option>` : nothing}
              ${this.targets.map((candidate) => html`<option value=${destinationKey(candidate)} title=${candidate.id} ?disabled=${!candidate.available}>${candidate.label} · ${this.t(candidate.kind === 'service' ? 'notifyMobileApp' : 'notifyEntity')}${candidate.available ? '' : ` · ${this.t('unavailable')}`}</option>`)}
            </select></label>
          </div>
          ${!this.targets.length && this._saved !== undefined ? html`<p>${this.t(this._style === 'android_alarm' ? 'notifyNoAlarmTarget' : 'notifyNoTargets')}</p>` : nothing}
          <div class="footer"><button class="primary" ?disabled=${busy || this._saved === undefined || (!this._recipient) || (this._enabled && !target?.available)} @click=${() => void this.save()}>${this._saving ? this.t('saving') : this.t('saveNotification')}</button><span role="status" class="status ${status === 'notifyActive' ? 'active' : ''}">${this._dirty ? this.t('notifyUnsaved') : this.t(status)}</span></div>
          ${this._runtimeError ? html`<div class="error" role="alert">${this.t('notifyRuntimeError')}: ${this._runtimeError}</div>` : nothing}
          ${this._style === 'android_alarm' ? html`<p class="helper">${this.t('notifyAlarmHelp')}</p>` : nothing}
          <p class="helper">${this.t('notifyReliability')}</p>
          ${runtime ? html`<button class="automation" @click=${() => this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: runtime.entity_id }, bubbles: true, composed: true }))}>${this.t('notifyViewAutomation')} · ${runtime.state}</button>` : nothing}
        `}
      </div></section>`;
  }
}

customElements.define('bambu-completion-notifications', CompletionNotifications);
