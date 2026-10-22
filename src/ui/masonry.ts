import { CardReorder } from './reorder';

/** Pack dynamic HA cards without moving their DOM nodes or stretching their content. */
export class BambuMasonry extends HTMLElement {
  private resize?: ResizeObserver;
  private mutation?: MutationObserver;
  private items = new Set<HTMLElement>();
  private frame?: number;
  private reorder?: CardReorder;
  private _editing = false;

  set editing(value: boolean) {
    this._editing = value;
    if (this.reorder) this.reorder.enabled = value;
    if (!value) this.reorder?.cancel();
  }
  get editing(): boolean { return this._editing; }

  connectedCallback(): void {
    this.reorder = new CardReorder(this, (move) => this.dispatchEvent(new CustomEvent('layout-move', { detail: move, bubbles: true, composed: true })));
    this.reorder.enabled = this._editing;
    this.resize = new ResizeObserver(() => this.schedule());
    this.mutation = new MutationObserver(() => this.syncChildren());
    this.mutation.observe(this, { childList: true });
    this.syncChildren();
  }

  disconnectedCallback(): void {
    this.reorder?.disconnect();
    this.resize?.disconnect();
    this.mutation?.disconnect();
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    this.items.clear();
  }

  private syncChildren(): void {
    const next = new Set(Array.from(this.children).filter((child): child is HTMLElement => child instanceof HTMLElement));
    if ([...this.items].some((item) => !next.has(item))) this.reorder?.cancel();
    for (const item of this.items) if (!next.has(item)) this.resize!.unobserve(item);
    for (const item of next) if (!this.items.has(item)) this.resize!.observe(item);
    this.items = next;
    this.schedule();
  }

  private schedule(): void {
    if (!this.isConnected || this.frame !== undefined) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;
      const style = getComputedStyle(this);
      const row = Number.parseFloat(style.gridAutoRows);
      const gap = Number.parseFloat(style.rowGap);
      for (const item of this.items) {
        const span = Math.ceil((item.getBoundingClientRect().height + gap) / (row + gap));
        const value = `span ${span}`;
        if (item.style.gridRowEnd !== value) item.style.gridRowEnd = value;
      }
    });
  }
}

customElements.define('bambu-detail-masonry', BambuMasonry);
