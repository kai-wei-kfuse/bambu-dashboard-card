import type { LayoutMove } from '../domain/layout';

interface ReorderCallbacks {
  start(): void;
  move(move: LayoutMove): void;
  end(cancelled: boolean): void;
}

interface DragSession {
  pointerId: number;
  source: HTMLElement;
  card: HTMLElement;
  offsetX: number;
  offsetY: number;
  minHeight: string;
  x: number;
  y: number;
  lastMove?: LayoutMove;
  abort: AbortController;
  scroll: HTMLElement;
}

/** Keep the live card in its DOM, with its outer grid item serving as the destination. */
export class CardReorder {
  enabled = false;
  private drag?: DragSession;
  private scrollFrame?: number;
  private animationFrame?: number;
  private animations = new Map<HTMLElement, Animation>();

  constructor(private host: HTMLElement, private callbacks: ReorderCallbacks) {
    host.addEventListener('pointerdown', this.start);
  }

  disconnect(): void {
    this.cancel();
    this.stopAnimations();
    this.host.removeEventListener('pointerdown', this.start);
  }

  cancel(): void { this.settle(true); }

  private items(): HTMLElement[] {
    return Array.from(this.host.children).filter((item): item is HTMLElement => item instanceof HTMLElement && !!item.dataset.layoutId);
  }

  private positions(): Map<HTMLElement, DOMRect> {
    return new Map(this.items().map((item) => {
      const card = item.querySelector<HTMLElement>(':scope > .layout-card')!;
      return [card, card.getBoundingClientRect()];
    }));
  }

  private start = (event: PointerEvent): void => {
    if (!this.enabled || event.button !== 0 || event.isPrimary === false || !(event.target instanceof Element)) return;
    const handle = event.target.closest<HTMLElement>('[data-layout-handle]');
    const source = handle?.closest<HTMLElement>('[data-layout-id]');
    if (!handle || !source || source.parentElement !== this.host) return;
    event.preventDefault();
    this.cancel();
    this.stopAnimations();
    handle.focus();
    const card = source.querySelector<HTMLElement>(':scope > .layout-card')!;
    const rect = card.getBoundingClientRect();
    const abort = new AbortController();
    this.drag = {
      pointerId: event.pointerId, source, card, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top,
      minHeight: source.style.minHeight, x: event.clientX, y: event.clientY, abort, scroll: this.scrollContainer(),
    };
    this.callbacks.start();
    source.style.minHeight = `${rect.height}px`;
    source.setAttribute('data-layout-dragging', '');
    card.style.width = `${rect.width}px`;
    card.style.left = `${rect.left}px`;
    card.style.top = `${rect.top}px`;
    // The top layer escapes HA clipping/containing blocks without cloning or reparenting live media.
    card.setAttribute('popover', 'manual');
    card.showPopover();
    window.addEventListener('pointermove', this.pointerMove, { signal: abort.signal, passive: false });
    window.addEventListener('pointerup', this.finish, { signal: abort.signal });
    window.addEventListener('pointercancel', this.abortPointer, { signal: abort.signal });
    window.addEventListener('blur', this.cancelBound, { signal: abort.signal });
    window.addEventListener('resize', this.cancelBound, { signal: abort.signal });
    window.addEventListener('keydown', this.keyDown, { signal: abort.signal });
  };

  private pointerMove = (event: PointerEvent): void => {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    event.preventDefault();
    this.drag.x = event.clientX;
    this.drag.y = event.clientY;
    this.updateTarget();
    if (this.scrollFrame === undefined && this.drag) this.scrollFrame = requestAnimationFrame(this.scrollStep);
  };

  private contains(rect: DOMRect, drag: DragSession): boolean {
    return drag.x >= rect.left && drag.x <= rect.right && drag.y >= rect.top && drag.y <= rect.bottom;
  }

  private updateTarget(): void {
    const drag = this.drag;
    if (!drag) return;
    if (!drag.source.isConnected) { this.cancel(); return; }
    drag.card.style.left = `${drag.x - drag.offsetX}px`;
    drag.card.style.top = `${drag.y - drag.offsetY}px`;
    if (!this.contains(this.host.getBoundingClientRect(), drag) || this.contains(drag.source.getBoundingClientRect(), drag)) return;
    let target: HTMLElement | undefined;
    let after = false;
    let distance = Infinity;
    for (const candidate of this.items()) {
      if (candidate === drag.source) continue;
      // Only inner cards animate; these grid boxes always describe the actual destination layout.
      const rect = candidate.getBoundingClientRect();
      const dx = Math.max(rect.left - drag.x, 0, drag.x - rect.right);
      const dy = Math.max(rect.top - drag.y, 0, drag.y - rect.bottom);
      const next = dx * dx + dy * dy;
      if (next >= distance) continue;
      distance = next;
      target = candidate;
      const horizontal = (drag.x - rect.left) / rect.width - .5;
      const vertical = (drag.y - rect.top) / rect.height - .5;
      after = Math.abs(horizontal) > Math.abs(vertical) ? horizontal > 0 : vertical > 0;
    }
    if (!target || (drag.lastMove?.target === target.dataset.layoutId && drag.lastMove?.after === after)) return;
    const before = this.positions();
    const move = { source: drag.source.dataset.layoutId!, target: target.dataset.layoutId!, after };
    drag.lastMove = move;
    this.callbacks.move(move);
    this.animateFrom(before);
  }

  private finish = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    this.updateTarget();
    if (this.drag === drag) this.settle(!this.contains(this.host.getBoundingClientRect(), drag));
  };

  private settle(cancelled: boolean): void {
    const drag = this.drag;
    if (!drag) return;
    const before = this.positions();
    this.drag = undefined;
    drag.abort.abort();
    drag.card.hidePopover();
    drag.card.removeAttribute('popover');
    for (const property of ['width', 'left', 'top']) drag.card.style.removeProperty(property);
    drag.source.style.minHeight = drag.minHeight;
    drag.source.removeAttribute('data-layout-dragging');
    if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = undefined;
    this.callbacks.end(cancelled);
    this.animateFrom(before);
  }

  private animateFrom(before: Map<HTMLElement, DOMRect>): void {
    if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
    if (!this.host.isConnected) return;
    this.animationFrame = requestAnimationFrame(() => {
      this.animationFrame = undefined;
      this.stopAnimations();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      for (const [card, previous] of before) {
        if (!card.isConnected || card === this.drag?.card) continue;
        const rect = card.getBoundingClientRect();
        const x = previous.left - rect.left;
        const y = previous.top - rect.top;
        if (!x && !y) continue;
        const animation = card.animate([{ transform: `translate(${x}px, ${y}px)` }, { transform: 'none' }], { duration: 180, easing: 'ease-out' });
        this.animations.set(card, animation);
        animation.onfinish = () => { if (this.animations.get(card) === animation) this.animations.delete(card); };
      }
    });
  }

  private stopAnimations(): void {
    if (this.animationFrame !== undefined) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = undefined;
    for (const animation of this.animations.values()) animation.cancel();
    this.animations.clear();
  }

  private abortPointer = (event: PointerEvent): void => { if (event.pointerId === this.drag?.pointerId) this.cancel(); };
  private cancelBound = (): void => this.cancel();
  private keyDown = (event: KeyboardEvent): void => { if (event.key === 'Escape') { event.preventDefault(); this.cancel(); } };

  private scrollContainer(): HTMLElement {
    let element: Element | null = this.host.parentElement;
    while (element) {
      if (element instanceof HTMLElement && /auto|scroll/.test(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight) return element;
      const root = element.getRootNode();
      element = element.parentElement || (root instanceof ShadowRoot ? root.host : null);
    }
    return (document.scrollingElement || document.documentElement) as HTMLElement;
  }

  private scrollStep = (): void => {
    this.scrollFrame = undefined;
    const drag = this.drag;
    if (!drag) return;
    const bounds = drag.scroll.getBoundingClientRect();
    const top = Math.max(0, bounds.top);
    const bottom = Math.min(window.innerHeight, bounds.bottom);
    // A viewport-edge scroll band lets touch drags reach cards that start offscreen.
    const edge = 64;
    const delta = drag.y < top + edge ? (drag.y - top - edge) / 5 : drag.y > bottom - edge ? (drag.y - bottom + edge) / 5 : 0;
    if (!delta) return;
    const previous = drag.scroll.scrollTop;
    drag.scroll.scrollTop += delta;
    this.updateTarget();
    if (this.drag && drag.scroll.scrollTop !== previous) this.scrollFrame = requestAnimationFrame(this.scrollStep);
  };
}
