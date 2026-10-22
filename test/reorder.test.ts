import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CardReorder } from '../src/ui/reorder';

const active: CardReorder[] = [];
let frames: Map<number, FrameRequestCallback>;
beforeEach(() => {
  frames = new Map();
  let frameId = 0;
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => { frames.set(++frameId, callback); return frameId; });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});
afterEach(() => { for (const controller of active.splice(0)) controller.disconnect(); document.body.replaceChildren(); vi.unstubAllGlobals(); });

function setup() {
  const parent = document.createElement('div');
  const host = document.createElement('div');
  parent.append(host);
  document.body.append(parent);
  vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 600, 700));
  const item = (id: string, x: number) => {
    const box = document.createElement('div');
    box.dataset.layoutId = id;
    box.dataset.layoutLabel = id;
    const handle = document.createElement('button');
    handle.dataset.layoutHandle = '';
    const card = document.createElement('div');
    card.className = 'layout-card';
    const input = document.createElement('input');
    input.value = 'Unsaved live form';
    card.append(handle, input);
    card.showPopover = vi.fn();
    card.hidePopover = vi.fn();
    card.animate = vi.fn().mockReturnValue({ cancel: vi.fn() });
    box.append(card);
    host.append(box);
    vi.spyOn(box, 'getBoundingClientRect').mockReturnValue(new DOMRect(x, 0, 200, 300));
    vi.spyOn(card, 'getBoundingClientRect').mockReturnValue(new DOMRect(x, 0, 200, 300));
    return { box, card, handle, input };
  };
  const source = item('camera', 0);
  const target = item('job', 220);
  const move = vi.fn();
  const start = vi.fn();
  const end = vi.fn();
  const controller = new CardReorder(host, { start, move, end });
  controller.enabled = true;
  active.push(controller);
  return { source, target, start, move, end, controller, parent };
}

function pointer(target: EventTarget, type: string, x: number, y: number, pointerType = 'mouse') {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y, pointerType }));
}

describe('card drag gestures', () => {
  it.each(['mouse', 'touch'])('moves the full live card and previews order before %s release', (type) => {
    const { source, target, start, move, end, parent } = setup();
    source.box.style.minHeight = '12px';
    pointer(source.handle, 'pointerdown', 20, 20, type);
    expect(start).toHaveBeenCalledOnce();
    expect(source.card.showPopover).toHaveBeenCalledOnce();
    expect(source.card.style.width).toBe('200px');
    expect(source.box.style.minHeight).toBe('300px');
    pointer(window, 'pointermove', 250, 25, type);
    expect(move).toHaveBeenCalledExactlyOnceWith({ source: 'camera', target: 'job', after: false });
    expect(end).not.toHaveBeenCalled();
    expect(source.card.style.left).toBe('230px');
    expect(source.card.style.top).toBe('5px');
    expect(source.input.value).toBe('Unsaved live form');
    expect(source.input.parentElement).toBe(source.card);
    expect(source.card.parentElement).toBe(source.box);
    pointer(window, 'pointerup', 250, 25, type);
    expect(end).toHaveBeenCalledExactlyOnceWith(false);
    expect(move).toHaveBeenCalledOnce();
    expect(parent.querySelector('.layout-drag-ghost')).toBeNull();
    expect(source.box.nextElementSibling).toBe(target.box);
    expect(source.box.hasAttribute('data-layout-dragging')).toBe(false);
    expect(source.box.style.minHeight).toBe('12px');
    expect(source.card.hidePopover).toHaveBeenCalledOnce();
    expect(source.card.hasAttribute('popover')).toBe(false);
    expect(source.card.style.width).toBe('');
  });

  it('cancels on Escape or detach and never activates when disabled or started from content', () => {
    const { source, move, end, controller } = setup();
    pointer(source.box, 'pointerdown', 20, 20);
    expect(source.card.showPopover).not.toHaveBeenCalled();
    pointer(source.handle, 'pointerdown', 20, 20);
    pointer(window, 'pointermove', 250, 25);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    pointer(window, 'pointerup', 250, 25);
    expect(move).toHaveBeenCalledOnce();
    expect(end).toHaveBeenCalledExactlyOnceWith(true);
    controller.enabled = false;
    pointer(source.handle, 'pointerdown', 20, 20);
    expect(source.card.showPopover).toHaveBeenCalledOnce();
    controller.enabled = true;
    pointer(source.handle, 'pointerdown', 20, 20);
    controller.disconnect();
    expect(source.card.hasAttribute('popover')).toBe(false);
    pointer(window, 'pointerup', 250, 25);
    expect(move).toHaveBeenCalledOnce();
    expect(end.mock.calls).toEqual([[true], [true]]);
  });

  it('cancels a drop whose source was removed while dragging', () => {
    const { source, move, end } = setup();
    pointer(source.handle, 'pointerdown', 20, 20);
    pointer(window, 'pointermove', 250, 25);
    source.box.remove();
    pointer(window, 'pointerup', 250, 25);
    expect(move).toHaveBeenCalledOnce();
    expect(end).toHaveBeenCalledExactlyOnceWith(true);
  });

  it.each(['pointercancel', 'blur', 'resize', 'outside'])('rolls back the gesture on %s and removes floating styles', (reason) => {
    const { source, end } = setup();
    pointer(source.handle, 'pointerdown', 20, 20);
    pointer(window, 'pointermove', 250, 25);
    if (reason === 'outside') pointer(window, 'pointerup', 800, 25);
    else if (reason === 'pointercancel') pointer(window, reason, 250, 25);
    else window.dispatchEvent(new Event(reason));
    expect(end).toHaveBeenCalledExactlyOnceWith(true);
    expect(source.card.hasAttribute('popover')).toBe(false);
    expect(source.box.style.minHeight).toBe('');
  });

  it('animates inner cards after live reflow without changing the grid geometry used for hit testing', () => {
    const { source, target, move, controller } = setup();
    move.mockImplementation(() => {
      vi.mocked(target.card.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 200, 300));
      vi.mocked(target.box.getBoundingClientRect).mockReturnValue(new DOMRect(0, 0, 200, 300));
    });
    pointer(source.handle, 'pointerdown', 20, 20);
    pointer(window, 'pointermove', 250, 25);
    const pending = [...frames.values()];
    frames.clear();
    for (const frame of pending) frame(0);
    expect(target.card.animate).toHaveBeenCalledWith([{ transform: 'translate(220px, 0px)' }, { transform: 'none' }], expect.objectContaining({ duration: 180 }));
    const animation = vi.mocked(target.card.animate).mock.results[0].value;
    controller.disconnect();
    expect(animation.cancel).toHaveBeenCalled();
  });
});
