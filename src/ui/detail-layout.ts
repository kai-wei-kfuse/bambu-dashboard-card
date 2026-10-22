import { LitElement, html, nothing } from 'lit';
import type { PropertyValues, TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { styleMap } from 'lit/directives/style-map.js';
import { cardPresentation, defaultLayout, moveLayoutCard, resolveLayoutOrder, updateCardPresentation } from '../domain/layout';
import type { CardPresentation, LayoutMove, LayoutPreference } from '../domain/layout';
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
    _dragging: { state: true }, _expanded: { state: true }, _revealed: { state: true },
  };
  hass?: HomeAssistant;
  printerId = '';
  language: Language = 'en';
  cards: DetailCard[] = [];
  private _saved?: LayoutPreference;
  private _draft = defaultLayout();
  private _editing = false;
  private _loading = false;
  private _saving = false;
  private _error = '';
  private _notice = '';
  private generation = 0;
  private _dragging = false;
  private _expanded = new Set<string>();
  private _revealed = new Set<string>();
  private gesture?: { generation: number; preference: LayoutPreference; notice: string; error: string };
  private context?: { connection: object; printerId: string };

  // Light DOM lets the workspace's single stylesheet style both the cards and layout controls.
  protected createRenderRoot(): HTMLElement { return this; }
  connectedCallback(): void { super.connectedCallback(); this.requestUpdate(); }
  disconnectedCallback(): void { super.disconnectedCallback(); this.generation++; this.context = undefined; }

  protected willUpdate(_changes: PropertyValues): void {
    if (!this.isConnected || !this.hass || !this.printerId) return;
    if (this.context?.connection === this.hass.connection && this.context.printerId === this.printerId) return;
    this.context = { connection: this.hass.connection, printerId: this.printerId };
    this._saved = undefined;
    this._draft = defaultLayout();
    this._editing = false;
    this._saving = false;
    this._notice = '';
    this.gesture = undefined;
    this._dragging = false;
    this._expanded = new Set();
    this._revealed = new Set();
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
      if (generation === this.generation) this._saved = preference;
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._loading = false;
    }
  }

  private edit(): void {
    this._draft = this._saved!;
    this._editing = true;
    this._error = '';
    this._notice = '';
  }

  private cancel(): void { this.gesture = undefined; this._dragging = false; this._editing = false; this._error = ''; this._notice = ''; }

  private startGesture(): void {
    this._dragging = true;
    this.gesture = { generation: this.generation, preference: this._draft, notice: this._notice, error: this._error };
  }

  private endGesture(cancelled: boolean): void {
    const gesture = this.gesture;
    this.gesture = undefined;
    this._dragging = false;
    if (!cancelled || !gesture || gesture.generation !== this.generation || !this._editing) return;
    this._draft = gesture.preference;
    this._notice = gesture.notice;
    this._error = gesture.error;
  }

  private move(move: LayoutMove): void {
    if (!this._editing || this._saving) return;
    try {
      this._draft = { ...this._draft, order: moveLayoutCard(this.ids, this._draft.order, move) };
      this._error = '';
      this._notice = this.t('layoutUnsaved');
    } catch (error) { this._error = asError(error).message; }
  }

  private step(id: string, offset: number): void {
    const order = resolveLayoutOrder(this.ids, this._draft.order);
    const index = order.indexOf(id);
    const target = order[index + offset];
    if (target !== undefined) this.move({ source: id, target, after: offset > 0 });
  }

  private async save(): Promise<void> {
    if (this._saving) return;
    const generation = this.generation;
    const preference = this._draft;
    this._saving = true;
    this._error = '';
    try {
      await new LayoutClient(this.hass!).save(this.printerId, preference);
      if (generation !== this.generation) return;
      this._saved = preference;
      this._expanded = new Set();
      this._revealed = new Set();
      this._editing = false;
      this._notice = this.t('layoutSaved');
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._saving = false;
    }
  }

  private presentation(id: string, patch: Partial<CardPresentation>): void {
    if (!this._editing || this._saving || this._dragging) return;
    this._draft = updateCardPresentation(this._draft, id, patch);
    this._notice = this.t('layoutUnsaved');
  }

  /** Diagnostic navigation reveals content without changing the user's saved presentation. */
  async revealCard(id: string): Promise<void> {
    if (!this.cards.some((card) => card.id === id)) throw new Error('The requested detail card is unavailable.');
    const generation = this.generation;
    this._revealed = new Set(this._revealed).add(id);
    await this.updateComplete;
    if (!this.isConnected || generation !== this.generation) return;
    const item = [...this.querySelectorAll<HTMLElement>('[data-layout-id]')].find((node) => node.dataset.layoutId === id)!;
    item.focus({ preventScroll: true });
    item.scrollIntoView({ block: 'center', behavior: 'auto' });
  }

  private toggleExpanded(id: string): void {
    const expanded = new Set(this._expanded);
    if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
    this._expanded = expanded;
  }

  protected render() {
    const preference = this._editing ? this._draft : this._saved || defaultLayout();
    const order = resolveLayoutOrder(this.ids, preference.order);
    const ranks = new Map(order.map((id, index) => [id, index]));
    const editing = this._editing && !this._saving;
    const locked = this._saving || this._dragging;
    const cards = this.cards.filter((card) => this._editing || !cardPresentation(preference, card.id).hidden || this._revealed.has(card.id));
    return html`<div class="layout-toolbar"><div class="layout-caption"><span>${this.t(this._editing ? 'layoutEditing' : 'detailLayout')}</span><small role="status">${this._loading ? this.t('loading') : this._notice || this.t('layoutAccount')}</small></div><div class="layout-actions">
      ${this._editing ? html`<button class="button small" ?disabled=${locked} @click=${() => { this._draft = defaultLayout(); this._notice = this.t('layoutUnsaved'); }}>${this.t('layoutReset')}</button><button class="button small" ?disabled=${this._saving} @click=${() => this.cancel()}>${this.t('cancel')}</button><button class="button primary small" ?disabled=${locked} @click=${() => void this.save()}>${this.t(this._saving ? 'saving' : 'layoutSave')}</button>` : html`<button class="button small" ?disabled=${this._loading || this._saved === undefined} @click=${() => this.edit()}>${icon('move')}${this.t('layoutEdit')}</button>`}
    </div></div>
    ${this._editing ? html`<p class="layout-help">${this.t('layoutDragHelp')}</p>` : nothing}
    ${this._error ? html`<div class="banner error" role="alert"><div class="copy">${this.t('layoutError')}: ${this._error}</div>${this._saved === undefined ? html`<button class="button small" ?disabled=${this._loading} @click=${() => void this.load()}>${this.t('retry')}</button>` : nothing}</div>` : nothing}
    <bambu-detail-masonry class="detail-grid ${this._editing ? 'layout-editing' : ''}" .editing=${editing} @layout-drag-start=${() => this.startGesture()} @layout-drag-end=${() => this.endGesture(false)} @layout-drag-cancel=${() => this.endGesture(true)} @layout-move=${(event: CustomEvent<LayoutMove>) => this.move(event.detail)}>
      ${repeat(cards, (card) => card.id, (card) => {
        const settings = cardPresentation(preference, card.id);
        const revealed = !this._editing && this._revealed.has(card.id);
        const collapsed = settings.collapsed && (this._editing || !this._expanded.has(card.id)) && !revealed;
        const concealed = this._editing && settings.hidden;
        return html`<div class="layout-item ${settings.width === 'wide' ? 'layout-wide' : ''} ${revealed ? 'layout-revealed' : ''}" tabindex="-1" data-layout-id=${card.id} data-layout-label=${card.label} style=${styleMap({ order: ranks.get(card.id) })}>
        <div class="layout-card">
        ${this._editing ? html`<div class="layout-handlebar"><button class="layout-grip" data-layout-handle aria-label=${`${this.t('layoutDrag')} ${card.label}`} ?disabled=${this._saving}>${icon('grip')}<span>${card.label}</span></button><button class="layout-step" aria-label=${`${this.t('layoutEarlier')} ${card.label}`} ?disabled=${locked || ranks.get(card.id) === 0} @click=${() => this.step(card.id, -1)}>↑</button><button class="layout-step" aria-label=${`${this.t('layoutLater')} ${card.label}`} ?disabled=${locked || ranks.get(card.id) === order.length - 1} @click=${() => this.step(card.id, 1)}>↓</button></div><div class="layout-options"><label><input type="checkbox" aria-label=${`${this.t('layoutVisible')} ${card.label}`} .checked=${!settings.hidden} ?disabled=${locked} @change=${(event: Event) => this.presentation(card.id, { hidden: !(event.target as HTMLInputElement).checked })}>${this.t('layoutVisible')}</label><label><input type="checkbox" aria-label=${`${this.t('layoutCollapsed')} ${card.label}`} .checked=${settings.collapsed} ?disabled=${locked} @change=${(event: Event) => this.presentation(card.id, { collapsed: (event.target as HTMLInputElement).checked })}>${this.t('layoutCollapsed')}</label><select aria-label=${`${this.t('layoutWidth')} ${card.label}`} data-value=${settings.width} ?disabled=${locked} @change=${(event: Event) => this.presentation(card.id, { width: (event.target as HTMLSelectElement).value as CardPresentation['width'] })}><option value="normal">${this.t('layoutNormal')}</option><option value="wide">${this.t('layoutWide')}</option></select></div>` : nothing}
        ${!this._editing && settings.collapsed && !revealed ? html`<button class="layout-fold-toggle" aria-expanded=${!collapsed} @click=${() => this.toggleExpanded(card.id)}><b>${card.label}</b><span>${this.t(collapsed ? 'layoutExpand' : 'layoutCollapse')} ${collapsed ? '▾' : '▴'}</span></button>` : nothing}
        <div class="layout-card-content" ?inert=${this._editing}>${concealed || collapsed ? (this._editing ? html`<div class="layout-summary">${this.t(concealed ? 'layoutHiddenHelp' : 'layoutCollapsedHelp')}</div>` : nothing) : card.content}</div>
        </div>
      </div>`; })}
    </bambu-detail-masonry>${!cards.length ? html`<p class="layout-summary">${this.t('layoutAllHidden')}</p>` : nothing}`;
  }
}

customElements.define('bambu-detail-layout', BambuDetailLayout);
