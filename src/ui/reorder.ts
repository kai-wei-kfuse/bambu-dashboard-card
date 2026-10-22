import type { LayoutMove } from '../domain/layout';

interface DragSession {
  pointerId: number;
  source: HTMLElement;
  target?: HTMLElement;
  after: boolean;
  x: number;
  y: number;
  ghost: HTMLElement;
  abort: AbortController;
  scroll: HTMLElement;
}

/** Pointer-only layout gestures: never inspect or activate a card's device controls. */
export class CardReorder {
  enabled = false;
  private drag?: DragSession;
  private scrollFrame?: number;

  constructor(private host: HTMLElement, private move: (move: LayoutMove) => void) {
    host.addEventListener('pointerdown', this.start);
  }

  disconnect(): void {
    this.cancel();
    this.host.removeEventListener('pointerdown', this.start);
  }

  cancel(): void {
    this.drag?.abort.abort();
    this.drag?.source.removeAttribute('data-layout-dragging');
    this.drag?.target?.removeAttribute('data-layout-drop');
    this.drag?.ghost.remove();
    this.drag = undefined;
    if (this.scrollFrame !== undefined) cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = undefined;
  }

  private start = (event: PointerEvent): void => {
    if (!this.enabled || event.button !== 0 || event.isPrimary === false || !(event.target instanceof Element)) return;
    const handle = event.target.closest<HTMLElement>('[data-layout-handle]');
    const source = handle?.closest<HTMLElement>('[data-layout-id]');
    if (!handle || !source || source.parentElement !== this.host) return;
    event.preventDefault();
    this.cancel();
    handle.focus();
    const ghost = document.createElement('div');
    ghost.className = 'layout-drag-ghost';
    ghost.textContent = source.dataset.layoutLabel!;
    ghost.setAttribute('aria-hidden', 'true');
    this.host.parentElement!.append(ghost);
    const abort = new AbortController();
    this.drag = { pointerId: event.pointerId, source, after: false, x: event.clientX, y: event.clientY, ghost, abort, scroll: this.scrollContainer() };
    source.setAttribute('data-layout-dragging', '');
    window.addEventListener('pointermove', this.pointerMove, { signal: abort.signal, passive: false });
    window.addEventListener('pointerup', this.finish, { signal: abort.signal });
    window.addEventListener('pointercancel', this.abortPointer, { signal: abort.signal });
    window.addEventListener('blur', this.cancelBound, { signal: abort.signal });
    window.addEventListener('keydown', this.keyDown, { signal: abort.signal });
    this.updateTarget();
  };

  private pointerMove = (event: PointerEvent): void => {
    if (!this.drag || event.pointerId !== this.drag.pointerId) return;
    event.preventDefault();
    this.drag.x = event.clientX;
    this.drag.y = event.clientY;
    this.updateTarget();
    if (this.scrollFrame === undefined) this.scrollFrame = requestAnimationFrame(this.scrollStep);
  };

  private updateTarget(): void {
    const drag = this.drag;
    if (!drag) return;
    if (!drag.source.isConnected) { this.cancel(); return; }
    drag.ghost.style.transform = `translate(${drag.x + 16}px, ${drag.y + 16}px)`;
    drag.target?.removeAttribute('data-layout-drop');
    drag.target = undefined;
    const host = this.host.getBoundingClientRect();
    const source = drag.source.getBoundingClientRect();
    const contains = (rect: DOMRect) => drag.x >= rect.left && drag.x <= rect.right && drag.y >= rect.top && drag.y <= rect.bottom;
    if (!contains(host) || contains(source)) return;
    let distance = Infinity;
    for (const candidate of this.host.children) {
      if (!(candidate instanceof HTMLElement) || candidate === drag.source || !candidate.dataset.layoutId) continue;
      const rect = candidate.getBoundingClientRect();
      const dx = Math.max(rect.left - drag.x, 0, drag.x - rect.right);
      const dy = Math.max(rect.top - drag.y, 0, drag.y - rect.bottom);
      const next = dx * dx + dy * dy;
      if (next >= distance) continue;
      distance = next;
      drag.target = candidate;
      const horizontal = (drag.x - rect.left) / rect.width - .5;
      const vertical = (drag.y - rect.top) / rect.height - .5;
      drag.after = Math.abs(horizontal) > Math.abs(vertical) ? horizontal > 0 : vertical > 0;
    }
    drag.target?.setAttribute('data-layout-drop', drag.after ? 'after' : 'before');
  }

  private finish = (event: PointerEvent): void => {
    const drag = this.drag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag.x = event.clientX;
    drag.y = event.clientY;
    this.updateTarget();
    if (this.drag !== drag) return;
    const change = drag.target?.isConnected ? { source: drag.source.dataset.layoutId!, target: drag.target.dataset.layoutId!, after: drag.after } : undefined;
    this.cancel();
    if (change) this.move(change);
  };

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
    if (drag.scroll.scrollTop !== previous) this.scrollFrame = requestAnimationFrame(this.scrollStep);
  };
}
