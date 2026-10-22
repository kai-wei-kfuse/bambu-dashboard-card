import { LitElement, html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { moveLayoutCard, resolveLayoutOrder } from '../domain/layout';
import type { LayoutMove } from '../domain/layout';
import { asError } from '../ha/catalog';
import { LayoutClient } from '../ha/layout';
import type { HomeAssistant } from '../ha/types';
import { text } from './i18n';
import type { Language, Message } from './i18n';
import { icon } from './icons';
import { syncSelectValues } from './select-values';
import './masonry';

export interface DetailCard { id: string; label: string; content: TemplateResult }

export class BambuDetailLayout extends LitElement {
  static properties = {
    hass: { attribute: false }, printerId: { attribute: false }, language: { attribute: false }, cards: { attribute: false },
    _saved: { state: true }, _draft: { state: true }, _editing: { state: true }, _loading: { state: true },
    _saving: { state: true }, _error: { state: true }, _notice: { state: true },
  };
  hass?: HomeAssistant;
  printerId = '';
  language: Language = 'en';
  cards: DetailCard[] = [];
  private _saved?: string[];
  private _draft: string[] = [];
  private _editing = false;
  private _loading = false;
  private _saving = false;
  private _error = '';
  private _notice = '';
  private generation = 0;
  private gesture?: { generation: number; order: string[]; notice: string; error: string };
  private context?: { connection: object; printerId: string };

  // Light DOM lets the workspace's single stylesheet style both the cards and layout controls.
  protected createRenderRoot(): HTMLElement { return this; }
  connectedCallback(): void { super.connectedCallback(); this.requestUpdate(); }
  disconnectedCallback(): void { super.disconnectedCallback(); this.generation++; this.context = undefined; }

  protected willUpdate(_changes: PropertyValues): void {
    if (!this.hass || !this.printerId) return;
    if (this.context?.connection === this.hass.connection && this.context.printerId === this.printerId) return;
    this.context = { connection: this.hass.connection, printerId: this.printerId };
    this._saved = undefined;
    this._draft = [];
    this._editing = false;
    this._saving = false;
    this._notice = '';
    this.gesture = undefined;
    void this.load(++this.generation);
  }

  protected updated(): void { syncSelectValues(this); }
  private t(key: Message): string { return text(this.language, key); }
  private get ids(): string[] { return this.cards.map((card) => card.id); }

  private async load(generation = this.generation): Promise<void> {
    this._loading = true;
    this._error = '';
    const hass = this.hass!;
    const printerId = this.printerId;
    try {
      const preference = await new LayoutClient(hass).load(printerId);
      if (generation === this.generation) this._saved = preference.order;
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._loading = false;
    }
  }

  private edit(): void {
    this._draft = [...this._saved!];
    this._editing = true;
    this._error = '';
    this._notice = '';
  }

  private cancel(): void { this.gesture = undefined; this._editing = false; this._error = ''; this._notice = ''; }

  private startGesture(): void {
    this.gesture = { generation: this.generation, order: [...this._draft], notice: this._notice, error: this._error };
  }

  private endGesture(cancelled: boolean): void {
    const gesture = this.gesture;
    this.gesture = undefined;
    if (!cancelled || !gesture || gesture.generation !== this.generation || !this._editing) return;
    this._draft = gesture.order;
    this._notice = gesture.notice;
    this._error = gesture.error;
  }

  private move(move: LayoutMove): void {
    if (!this._editing || this._saving) return;
    try {
      this._draft = moveLayoutCard(this.ids, this._draft, move);
      this._error = '';
      this._notice = this.t('layoutUnsaved');
    } catch (error) { this._error = asError(error).message; }
  }

  private step(id: string, offset: number): void {
    const order = resolveLayoutOrder(this.ids, this._draft);
    const index = order.indexOf(id);
    const target = order[index + offset];
    if (target !== undefined) this.move({ source: id, target, after: offset > 0 });
  }

  private async save(): Promise<void> {
    if (this._saving) return;
    const generation = this.generation;
    const order = [...this._draft];
    this._saving = true;
    this._error = '';
    try {
      await new LayoutClient(this.hass!).save(this.printerId, { version: 1, order });
      if (generation !== this.generation) return;
      this._saved = order;
      this._editing = false;
      this._notice = this.t('layoutSaved');
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._saving = false;
    }
  }

  protected render() {
    const order = resolveLayoutOrder(this.ids, this._editing ? this._draft : this._saved || []);
    const ranks = new Map(order.map((id, index) => [id, index]));
    const editing = this._editing && !this._saving;
    return html`<div class="layout-toolbar"><div class="layout-caption"><span>${this.t(this._editing ? 'layoutEditing' : 'detailLayout')}</span><small role="status">${this._loading ? this.t('loading') : this._notice || this.t('layoutAccount')}</small></div><div class="layout-actions">
      ${this._editing ? html`<button class="button small" ?disabled=${this._saving} @click=${() => { this._draft = []; this._notice = this.t('layoutUnsaved'); }}>${this.t('layoutReset')}</button><button class="button small" ?disabled=${this._saving} @click=${() => this.cancel()}>${this.t('cancel')}</button><button class="button primary small" ?disabled=${this._saving} @click=${() => void this.save()}>${this.t(this._saving ? 'saving' : 'layoutSave')}</button>` : html`<button class="button small" ?disabled=${this._loading || this._saved === undefined} @click=${() => this.edit()}>${icon('move')}${this.t('layoutEdit')}</button>`}
    </div></div>
    ${this._editing ? html`<p class="layout-help">${this.t('layoutDragHelp')}</p>` : nothing}
    ${this._error ? html`<div class="banner error" role="alert"><div class="copy">${this.t('layoutError')}: ${this._error}</div>${this._saved === undefined ? html`<button class="button small" ?disabled=${this._loading} @click=${() => void this.load()}>${this.t('retry')}</button>` : nothing}</div>` : nothing}
    <bambu-detail-masonry class="detail-grid ${this._editing ? 'layout-editing' : ''}" .editing=${editing} @layout-drag-start=${() => this.startGesture()} @layout-drag-end=${() => this.endGesture(false)} @layout-drag-cancel=${() => this.endGesture(true)} @layout-move=${(event: CustomEvent<LayoutMove>) => this.move(event.detail)}>
      ${repeat(this.cards, (card) => card.id, (card) => html`<div class="layout-item" data-layout-id=${card.id} data-layout-label=${card.label} style=${styleMap({ order: ranks.get(card.id) })}>
        <div class="layout-card">
        ${this._editing ? html`<div class="layout-handlebar"><button class="layout-grip" data-layout-handle aria-label=${`${this.t('layoutDrag')} ${card.label}`} ?disabled=${this._saving}>${icon('grip')}<span>${card.label}</span></button><button class="layout-step" aria-label=${`${this.t('layoutEarlier')} ${card.label}`} ?disabled=${this._saving || ranks.get(card.id) === 0} @click=${() => this.step(card.id, -1)}>↑</button><button class="layout-step" aria-label=${`${this.t('layoutLater')} ${card.label}`} ?disabled=${this._saving || ranks.get(card.id) === order.length - 1} @click=${() => this.step(card.id, 1)}>↓</button></div>` : nothing}
        <div class="layout-card-content" ?inert=${this._editing}>${card.content}</div>
        </div>
      </div>`)}
    </bambu-detail-masonry>`;
  }
}

customElements.define('bambu-detail-layout', BambuDetailLayout);
