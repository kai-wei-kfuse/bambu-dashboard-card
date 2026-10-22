import { LitElement, css, html, nothing } from 'lit';
import type { PropertyValues } from 'lit';
import { catalogFor } from './ha/catalog';
import type { CatalogState } from './ha/catalog';
import { discoverPrinters } from './domain/printers';
import type { CardConfig, HomeAssistant, Unsubscribe } from './ha/types';
import { text } from './ui/i18n';
import { syncSelectValues } from './ui/select-values';

export class BambuDashboardEditor extends LitElement {
  static properties = { hass: { attribute: false }, _config: { state: true }, _catalog: { state: true } };
  static styles = css`
    :host{display:block;color:var(--primary-text-color);padding:12px 0;font:14px system-ui}
    label{display:block;margin:16px 0} input[type=text],select{box-sizing:border-box;width:100%;padding:11px;margin-top:7px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color);color:inherit;font:inherit}
    .check{display:flex;gap:10px;align-items:center} input[type=checkbox]{width:17px;height:17px;accent-color:var(--primary-color)} small{color:var(--secondary-text-color)} .error{color:var(--error-color)}
    .row{display:flex;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid var(--divider-color)}.row label{flex:1;margin:0}.row button{background:none;color:inherit;border:1px solid var(--divider-color);border-radius:5px;cursor:pointer;padding:4px 7px}
  `;
  hass?: HomeAssistant;
  private _config: CardConfig = { type: 'custom:bambu-dashboard-card', discovery: 'auto' };
  private _catalog: CatalogState = { loading: true };
  private unsubscribe?: Unsubscribe;
  private connection?: object;

  setConfig(config: CardConfig): void { this._config = { ...config }; }
  protected updated(changes: PropertyValues): void {
    syncSelectValues(this.renderRoot);
    if (!changes.has('hass') || !this.hass || this.connection === this.hass.connection) return;
    this.unsubscribe?.();
    this.connection = this.hass.connection;
    this.unsubscribe = catalogFor(this.hass).subscribe((state) => { this._catalog = state; });
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribe?.();
    this.connection = undefined;
  }
  private change(patch: Partial<CardConfig>): void {
    this._config = { ...this._config, ...patch };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
  }
  private move(id: string, direction: number): void {
    const devices = [...(this._config.devices || [])];
    const from = devices.indexOf(id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= devices.length) return;
    [devices[from], devices[to]] = [devices[to], devices[from]];
    this.change({ devices });
  }
  protected render() {
    const language = this.hass?.language.startsWith('zh') ? 'zh' : 'en';
    const t = (key: Parameters<typeof text>[1]) => text(language, key);
    const devices = this._config.devices || [];
    const printers = this._catalog.snapshot && this.hass ? discoverPrinters(this._catalog.snapshot, this.hass, { ...this._config, discovery: 'auto' }) : [];
    return html`<label>${t('title')}<input type="text" .value=${this._config.title || ''} @input=${(event: Event) => this.change({ title: (event.target as HTMLInputElement).value })}/></label>
      <label>${t('language')}<select data-value=${this._config.language || 'auto'} @change=${(event: Event) => this.change({ language: (event.target as HTMLSelectElement).value as CardConfig['language'] })}><option value="auto">${t('automatic')}</option><option value="en">English</option><option value="zh">简体中文</option></select></label>
      <label class="check"><input type="checkbox" .checked=${this._config.discovery === 'selected'} @change=${(event: Event) => this.change({ discovery: (event.target as HTMLInputElement).checked ? 'selected' : 'auto', devices: this._config.devices || [] })}/>${t('selectedDevices')}</label>
      ${this._config.discovery === 'selected' ? html`${printers.map((printer) => html`<div class="row"><label class="check"><input type="checkbox" .checked=${devices.includes(printer.id)} @change=${(event: Event) => this.change({ devices: (event.target as HTMLInputElement).checked ? [...devices, printer.id] : devices.filter((id) => id !== printer.id) })}/>${printer.name} <small>${printer.model}</small></label>${devices.includes(printer.id) ? html`<button aria-label="Move up" @click=${() => this.move(printer.id, -1)}>↑</button><button aria-label="Move down" @click=${() => this.move(printer.id, 1)}>↓</button>` : nothing}</div>`)}` : html`<small>${t('allPrinters')} · ${printers.length}</small>`}
      ${this._catalog.error ? html`<p class="error">${this._catalog.error.message}</p>` : nothing}`;
  }
}

customElements.define('bambu-dashboard-card-editor', BambuDashboardEditor);
