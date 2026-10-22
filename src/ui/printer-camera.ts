import { LitElement, html, nothing } from 'lit';
import type { PropertyValues } from 'lit';
import { externalCameras, resolveCameraSource } from '../domain/cameras';
import type { CameraPreference, CameraSource } from '../domain/cameras';
import type { Printer } from '../domain/printers';
import { asError } from '../ha/catalog';
import { CameraSourceClient } from '../ha/cameras';
import type { HomeAssistant, RegistrySnapshot } from '../ha/types';
import { text } from './i18n';
import type { Language, Message } from './i18n';
import { icon } from './icons';
import { syncSelectValues } from './select-values';
import './media';

export class BambuPrinterCamera extends LitElement {
  static properties = {
    hass: { attribute: false }, printer: { attribute: false }, registry: { attribute: false }, language: { attribute: false }, variant: {},
    _preference: { state: true }, _loading: { state: true }, _saving: { state: true }, _error: { state: true }, _open: { state: true }, _choice: { state: true },
  };
  hass?: HomeAssistant;
  printer?: Printer;
  registry?: RegistrySnapshot;
  language: Language = 'en';
  variant: 'tile' | 'detail' = 'tile';
  private _preference?: CameraPreference;
  private _loading = false;
  private _saving = false;
  private _error = '';
  private _open = false;
  private _choice = '';
  private context?: { connection: object; printerId: string };
  private generation = 0;

  protected createRenderRoot(): HTMLElement { return this; }
  connectedCallback(): void { super.connectedCallback(); this.requestUpdate(); }
  disconnectedCallback(): void { super.disconnectedCallback(); this.generation++; this.context = undefined; this._open = false; }

  protected willUpdate(_changes: PropertyValues): void {
    if (!this.hass || !this.printer || !this.registry) return;
    if (this.context?.connection === this.hass.connection && this.context.printerId === this.printer.id) return;
    this.context = { connection: this.hass.connection, printerId: this.printer.id };
    this._preference = undefined;
    this._choice = '';
    this._open = false;
    this._saving = false;
    void this.load(++this.generation);
  }

  protected updated(): void {
    syncSelectValues(this);
    const dialog = this.querySelector<HTMLDialogElement>('dialog');
    if (dialog && !dialog.open) dialog.showModal();
  }

  private t(key: Message): string { return text(this.language, key); }
  private get options(): CameraSource[] { return this.hass && this.registry ? externalCameras(this.hass.states, this.registry) : []; }
  private get source(): CameraSource | undefined {
    return this.hass && this.printer && this.registry && this._preference
      ? resolveCameraSource(this.printer, this._preference, this.hass.states, this.registry) : undefined;
  }

  private async load(generation = this.generation): Promise<void> {
    const hass = this.hass!;
    const printerId = this.printer!.id;
    this._loading = true;
    this._error = '';
    try {
      const preference = await new CameraSourceClient(hass).load(printerId);
      if (generation !== this.generation) return;
      this._preference = preference;
      this._choice = preference.entityId || '';
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._loading = false;
    }
  }

  private openPicker(): void {
    this._choice = this._preference?.entityId || '';
    if (this._preference) this._error = '';
    this._open = true;
  }

  private closePicker(): void { if (!this._saving) this._open = false; }

  private async save(): Promise<void> {
    if (this._saving || !this._preference) return;
    const generation = this.generation;
    const printerId = this.printer!.id;
    const preference: CameraPreference = { version: 1, entityId: this._choice || null };
    this._saving = true;
    this._error = '';
    try {
      if (preference.entityId && !this.options.some((source) => source.entityId === preference.entityId)) throw new Error(this.t('cameraSelectionMissing'));
      await new CameraSourceClient(this.hass!).save(printerId, preference);
      if (generation !== this.generation) return;
      this._preference = preference;
      this._open = false;
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._saving = false;
    }
  }

  private entry() {
    return html`<button class="button small camera-source-entry" aria-label=${`${this.t('externalCamera')} · ${this.printer?.name || ''}`} ?disabled=${this._loading} @click=${() => this.openPicker()}>${icon('camera')}${this.t(this.source?.external ? 'cameraChange' : 'externalCamera')}</button>`;
  }

  private picture(source?: CameraSource) {
    if (this._loading || (!source && !this._error)) return html`<div class="camera-source-message" role="status">${this.t('loading')}</div>`;
    if (!source) return html`<div class="camera-source-message error" role="alert">${this.t('cameraLoadError')}: ${this._error}<button class="button small" @click=${() => void this.load()}>${this.t('retry')}</button></div>`;
    if (source.status !== 'ready') return html`<div class="camera-source-message" role="status">${icon('camera')}<span>${this.status(source)}</span><small>${source.name}</small></div>`;
    return html`<bambu-dashboard-camera .hass=${this.hass} .entity=${source.entityId!}></bambu-dashboard-camera>`;
  }

  private status(source: CameraSource): string {
    return source.status === 'missing' ? this.t(source.external ? 'cameraMissing' : 'cameraBuiltinMissing') : this.t(source.status === 'ready' ? 'ready' : source.status);
  }

  private picker() {
    if (!this._open) return nothing;
    const options = this.options;
    const missing = this._choice && !options.some((source) => source.entityId === this._choice);
    const missingSource = missing && this.hass && this.printer && this.registry
      ? resolveCameraSource(this.printer, { version: 1, entityId: this._choice }, this.hass.states, this.registry) : undefined;
    return html`<dialog class="dialog camera-picker" aria-label=${this.t('externalCamera')} @cancel=${(event: Event) => { event.preventDefault(); this.closePicker(); }} @click=${(event: Event) => { if (event.target === event.currentTarget) this.closePicker(); }}><div>
      <div class="panel-head"><h2>${icon('camera')} ${this.t('externalCamera')}</h2><button class="icon-button" aria-label=${this.t('close')} ?disabled=${this._saving} @click=${() => this.closePicker()}>${icon('close')}</button></div>
      <div class="dialog-body"><div class="dialog-target"><div><span>${this.t('printers')}</span><b>${this.printer?.name}</b></div></div>
        <p class="description">${this.t('cameraPickerHelp')}</p>
        ${this._error ? html`<div class="banner error" role="alert"><div class="copy">${this._error}</div>${!this._preference ? html`<button class="button small" ?disabled=${this._loading} @click=${() => void this.load()}>${this.t('retry')}</button>` : nothing}</div>` : nothing}
        <label class="field"><span>${this.t('cameraSource')}</span><select aria-label=${this.t('cameraSource')} data-value=${this._choice} ?disabled=${this._loading || this._saving || !this._preference} @change=${(event: Event) => { this._choice = (event.target as HTMLSelectElement).value; this._error = ''; }}>
          <option value="">${this.t('builtinCamera')}</option>
          ${missing ? html`<option value=${this._choice} disabled>${this._choice} · ${missingSource ? this.status(missingSource) : this.t('cameraMissing')}</option>` : nothing}
          ${options.map((source) => html`<option value=${source.entityId!}>${source.name} · ${source.entityId}${source.status === 'ready' ? '' : ` · ${this.status(source)}`}</option>`)}
        </select></label>
        ${!options.length ? html`<div class="camera-setup-empty"><b>${this.t('cameraNone')}</b><p>${this.t('cameraSetupHelp')}</p><a href="/config/integrations/dashboard" target="_blank" rel="noopener">${this.t('cameraSetupLink')} ↗</a></div>` : nothing}
        <p class="helper">${this.t('cameraAccountHelp')}</p>
      </div><div class="dialog-footer"><button class="button" ?disabled=${this._saving} @click=${() => this.closePicker()}>${this.t('cancel')}</button><button class="button primary" ?disabled=${this._loading || this._saving || !this._preference} @click=${() => void this.save()}>${this.t(this._saving ? 'saving' : 'cameraSave')}</button></div>
    </div></dialog>`;
  }

  protected render() {
    const source = this.source;
    const label = this.t(source ? (source.external ? 'externalCamera' : 'builtinCamera') : (this._error ? 'cameraLoadError' : 'loading'));
    const kind = source ? (source.external ? 'external' : 'builtin') : 'pending';
    if (this.variant === 'detail') return html`<section class="panel camera-panel"><div class="panel-head"><h2>${icon('camera')} ${this.t('camera')}</h2>${this.entry()}</div><div class="camera-large" data-camera-kind=${kind}>${this.picture(source)}</div><div class="camera-source-caption"><b>${label}</b><span>${source?.name || ''}</span><small>${source?.status === 'ready' ? this.t(source.streaming ? 'live' : 'snapshot') : source ? this.status(source) : ''}</small></div></section>${this.picker()}`;
    return html`<div class="preview camera-source-tile" aria-label=${this.t('camera')} data-camera-kind=${kind}>${this.picture(source)}${this.entry()}<span class="preview-caption" title=${source?.name || ''}>${label}${source?.external ? ` · ${source.name}` : ''}</span></div>${this.picker()}`;
  }
}

customElements.define('bambu-printer-camera', BambuPrinterCamera);
