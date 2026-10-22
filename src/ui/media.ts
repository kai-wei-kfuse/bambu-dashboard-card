import { LitElement, css, html, nothing } from 'lit';
import type { PropertyValues } from 'lit';
import type { HomeAssistant, NativeCard } from '../ha/types';
import { asError } from '../ha/catalog';
import { fileApiPath } from '../domain/projects';

export class BambuCamera extends LitElement {
  static properties = { hass: { attribute: false }, entity: {}, _error: { state: true }, _visible: { state: true } };
  static styles = css`:host{display:block;height:100%;min-height:180px;overflow:hidden} .message{display:grid;place-content:center;height:100%;padding:24px;text-align:center;color:var(--secondary-text-color);font-size:13px} .error{color:var(--error-color,#d25454)} hui-picture-entity-card{height:100%;--ha-card-border-width:0;--ha-card-border-radius:0}`;
  hass?: HomeAssistant;
  entity = '';
  private _error = '';
  private _visible = false;
  private observer?: IntersectionObserver;
  private card?: NativeCard;
  private generation = 0;

  connectedCallback(): void {
    super.connectedCallback();
    this.observer = new IntersectionObserver(([entry]) => {
      this._visible = entry.isIntersecting;
      if (!entry.isIntersecting) this.card = undefined;
    });
    this.observer.observe(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.generation++;
    this.observer?.disconnect();
    this.card = undefined;
    this._visible = false;
  }

  protected updated(changes: PropertyValues): void {
    if (changes.has('entity')) {
      this.card = undefined;
      this._error = '';
    }
    if (!this._visible) return;
    if (this.card) this.card.hass = this.hass;
    else if (this.entity && this.hass && !this._error) void this.load();
  }

  private async load(): Promise<void> {
    const generation = ++this.generation;
    try {
      if (!window.loadCardHelpers) throw new Error('Home Assistant card helpers are unavailable.');
      const helpers = await window.loadCardHelpers();
      if (generation !== this.generation || !this._visible) return;
      const supportsStream = (Number(this.hass?.states[this.entity]?.attributes.supported_features) & 2) !== 0;
      this.card = helpers.createCardElement({ type: 'picture-entity', entity: this.entity, camera_view: supportsStream ? 'live' : 'auto', show_name: false, show_state: false });
      this.card.hass = this.hass;
      this.requestUpdate();
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    }
  }

  protected render() {
    if (this._error) return html`<div class="message error">${this._error}</div>`;
    if (!this._visible) return nothing;
    return this.card || html`<div class="message">Camera · …</div>`;
  }
}

export class BambuFileImage extends LitElement {
  static properties = { hass: { attribute: false }, path: {}, entity: {}, version: {}, _url: { state: true }, _error: { state: true } };
  static styles = css`:host{display:block;width:100%;height:100%} img{display:block;width:100%;height:100%;object-fit:contain} .error{font-size:11px;padding:10px;color:var(--error-color,#d25454)}`;
  hass?: HomeAssistant;
  path = '';
  entity = '';
  version = '';
  private _url = '';
  private _error = '';
  private request?: AbortController;

  connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) void this.load();
  }

  protected updated(changes: PropertyValues): void {
    const previousHass = changes.get('hass') as HomeAssistant | undefined;
    const connectionChanged = changes.has('hass') && previousHass?.connection !== this.hass?.connection;
    if (changes.has('path') || changes.has('entity') || changes.has('version') || connectionChanged) void this.load();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.request?.abort();
    if (this._url) URL.revokeObjectURL(this._url);
    this._url = '';
  }

  private async load(): Promise<void> {
    this.request?.abort();
    if (this._url) URL.revokeObjectURL(this._url);
    this._url = '';
    this._error = '';
    if ((!this.path && !this.entity) || !this.hass) return;
    const request = this.request = new AbortController();
    try {
      if (this.entity && !/^image\.[a-z0-9_]+$/.test(this.entity)) throw new Error('Expected an HA image entity.');
      const basePath = this.entity ? `/api/image_proxy/${encodeURIComponent(this.entity)}` : fileApiPath(this.path);
      const requestPath = this.version ? `${basePath}?v=${encodeURIComponent(this.version)}` : basePath;
      const response = await this.hass.fetchWithAuth(requestPath, { signal: request.signal });
      if (!response.ok) throw new Error(`Image: HTTP ${response.status}`);
      const blob = await response.blob();
      if (!request.signal.aborted) this._url = URL.createObjectURL(blob);
    } catch (error) {
      if (!request.signal.aborted) this._error = asError(error).message;
    }
  }

  protected render() {
    return this._url ? html`<img src=${this._url} alt="Project preview"/>` : this._error ? html`<span class="error">${this._error}</span>` : nothing;
  }
}

customElements.define('bambu-dashboard-camera', BambuCamera);
customElements.define('bambu-dashboard-file-image', BambuFileImage);
