import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CardReorder } from '../src/ui/reorder';
import { moveLayoutCard } from '../src/domain/layout';

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
  host.style.cssText = 'column-gap:14px;row-gap:14px';
  parent.append(host);
  document.body.append(parent);
  vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 600, 700));
  const item = (id: string, x: number) => {
    const box = document.createElement('div');
    box.dataset.layoutId = id;
    box.dataset.layoutLabel = id;
    box.style.order = x ? '1' : '0';
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

function masonryScenario() {
  const scroll = document.createElement('div');
  scroll.style.overflowY = 'auto';
  Object.defineProperty(scroll, 'clientHeight', { value: 600 });
  Object.defineProperty(scroll, 'scrollHeight', { value: 1800 });
  vi.spyOn(scroll, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 1482, 600));
  const host = document.createElement('div');
  host.style.cssText = 'column-gap:14px;row-gap:14px';
  scroll.append(host);
  document.body.append(scroll);
  const ids = ['camera', 'job', 'controls', 'metrics', 'ams', 'spool', 'reminder'];
  const heights = [340, 575, 415, 390, 520, 305, 195];
  let order = [...ids];
  const boxes = ids.map((id) => {
    const item = document.createElement('div');
    item.dataset.layoutId = id;
    const card = document.createElement('div');
    card.className = 'layout-card';
    const handle = document.createElement('button');
    handle.dataset.layoutHandle = '';
    card.append(handle);
    card.showPopover = vi.fn();
    card.hidePopover = vi.fn();
    card.animate = vi.fn().mockReturnValue({ cancel: vi.fn() });
    item.append(card);
    host.append(item);
    return { item, card, handle };
  });
  const pack = () => {
    const columns = [0, 0, 0, 0];
    const rects = new Map<string, DOMRect>();
    for (const id of order) {
      const column = columns.indexOf(Math.min(...columns));
      const height = heights[ids.indexOf(id)];
      rects.set(id, new DOMRect(column * 374, columns[column] * 15 - scroll.scrollTop, 360, height));
      columns[column] += Math.ceil((height + 14) / 15);
    }
    return rects;
  };
  const sync = () => boxes.forEach(({ item }, index) => { item.style.order = String(order.indexOf(ids[index])); });
  sync();
  boxes.forEach(({ item, card }, index) => {
    vi.spyOn(item, 'getBoundingClientRect').mockImplementation(() => pack().get(ids[index])!);
    vi.spyOn(card, 'getBoundingClientRect').mockImplementation(() => pack().get(ids[index])!);
  });
  vi.spyOn(host, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, -scroll.scrollTop, 1482, 1200));
  const move = vi.fn().mockImplementation((change) => { order = moveLayoutCard(ids, order, change); sync(); });
  const controller = new CardReorder(host, { start: vi.fn(), move, end: vi.fn() });
  controller.enabled = true;
  active.push(controller);
  return { source: boxes[0], move, scroll, order: () => order };
}

describe('card drag gestures', () => {
  it('keeps gaps idle and does not let masonry reflow retarget a stationary or slightly jittering pointer', () => {
    const { source, move, order } = masonryScenario();
    pointer(source.handle, 'pointerdown', 144, 20);
    pointer(window, 'pointermove', 0, 342);
    expect(move).not.toHaveBeenCalled();
    pointer(window, 'pointermove', 8, 368);
    expect(move).toHaveBeenCalledExactlyOnceWith({ source: 'camera', target: 'ams', after: false });
    for (const [x, y] of [[8, 368], [9, 369], [7, 367], [8, 369], [7, 368]]) pointer(window, 'pointermove', x, y);
    expect(move).toHaveBeenCalledOnce();
    expect(order()).toEqual(['job', 'controls', 'metrics', 'camera', 'ams', 'spool', 'reminder']);
    pointer(window, 'pointermove', 8, 145);
    expect(move).toHaveBeenCalledTimes(2);
    expect(order()[0]).toBe('camera');
  });

  it('retains the accepted side around its center boundary but allows a deliberate reversal', () => {
    const { source, move, order } = masonryScenario();
    pointer(source.handle, 'pointerdown', 144, 20);
    pointer(window, 'pointermove', 700, 500);
    expect(move).toHaveBeenCalledExactlyOnceWith({ source: 'camera', target: 'job', after: true });
    for (const [x, y] of [[554, 287.5], [555, 288.5], [553, 286.5], [554, 288]]) pointer(window, 'pointermove', x, y);
    expect(move).toHaveBeenCalledOnce();
    pointer(window, 'pointermove', 554, 200);
    expect(move).toHaveBeenCalledTimes(2);
    expect(order()[0]).toBe('camera');
  });

  it('adjusts anchored hover coordinates for actual scrolling instead of freezing the destination', () => {
    const { source, move, scroll, order } = masonryScenario();
    pointer(source.handle, 'pointerdown', 144, 20);
    pointer(window, 'pointermove', 180, 368);
    expect(move).toHaveBeenCalledExactlyOnceWith({ source: 'camera', target: 'ams', after: false });
    scroll.scrollTop = 300;
    pointer(window, 'pointermove', 180, 368);
    expect(move).toHaveBeenCalledTimes(2);
    expect(move).toHaveBeenLastCalledWith({ source: 'camera', target: 'ams', after: true });
    expect(order()).toEqual(['job', 'controls', 'metrics', 'ams', 'camera', 'spool', 'reminder']);
  });

  it('does not emit a move or queue reflow animation when the proposed order is already current', () => {
    const { source, target, move } = setup();
    pointer(source.handle, 'pointerdown', 20, 20);
    pointer(window, 'pointermove', 300, 150);
    expect(move).not.toHaveBeenCalled();
    expect(source.card.animate).not.toHaveBeenCalled();
    expect(target.card.animate).not.toHaveBeenCalled();
    expect(frames.size).toBe(1); // Only the edge-scroll check, without a reflow frame.
  });

  it.each(['mouse', 'touch'])('moves the full live card and previews order before %s release', (type) => {
    const { source, target, start, move, end, parent } = setup();
    source.box.style.minHeight = '12px';
    pointer(source.handle, 'pointerdown', 20, 20, type);
    expect(start).toHaveBeenCalledOnce();
    expect(source.card.showPopover).toHaveBeenCalledOnce();
    expect(source.card.style.width).toBe('200px');
    expect(source.box.style.minHeight).toBe('300px');
    pointer(window, 'pointermove', 390, 250, type);
    expect(move).toHaveBeenCalledExactlyOnceWith({ source: 'camera', target: 'job', after: true });
    expect(end).not.toHaveBeenCalled();
    expect(source.card.style.left).toBe('370px');
    expect(source.card.style.top).toBe('230px');
    expect(source.input.value).toBe('Unsaved live form');
    expect(source.input.parentElement).toBe(source.card);
    expect(source.card.parentElement).toBe(source.box);
    pointer(window, 'pointerup', 390, 250, type);
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
    pointer(window, 'pointermove', 390, 250);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    pointer(window, 'pointerup', 390, 250);
    expect(move).toHaveBeenCalledOnce();
    expect(end).toHaveBeenCalledExactlyOnceWith(true);
    controller.enabled = false;
    pointer(source.handle, 'pointerdown', 20, 20);
    expect(source.card.showPopover).toHaveBeenCalledOnce();
    controller.enabled = true;
    pointer(source.handle, 'pointerdown', 20, 20);
    controller.disconnect();
    expect(source.card.hasAttribute('popover')).toBe(false);
    pointer(window, 'pointerup', 390, 250);
    expect(move).toHaveBeenCalledOnce();
    expect(end.mock.calls).toEqual([[true], [true]]);
  });

  it('cancels a drop whose source was removed while dragging', () => {
    const { source, move, end } = setup();
    pointer(source.handle, 'pointerdown', 20, 20);
    pointer(window, 'pointermove', 390, 250);
    source.box.remove();
    pointer(window, 'pointerup', 390, 250);
    expect(move).toHaveBeenCalledOnce();
    expect(end).toHaveBeenCalledExactlyOnceWith(true);
  });

  it.each(['pointercancel', 'blur', 'resize', 'outside'])('rolls back the gesture on %s and removes floating styles', (reason) => {
    const { source, end } = setup();
    pointer(source.handle, 'pointerdown', 20, 20);
    pointer(window, 'pointermove', 390, 250);
    if (reason === 'outside') pointer(window, 'pointerup', 800, 25);
    else if (reason === 'pointercancel') pointer(window, reason, 390, 250);
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
    pointer(window, 'pointermove', 390, 250);
    const pending = [...frames.values()];
    frames.clear();
    for (const frame of pending) frame(0);
    expect(target.card.animate).toHaveBeenCalledWith([{ transform: 'translate(220px, 0px)' }, { transform: 'none' }], expect.objectContaining({ duration: 180 }));
    const animation = vi.mocked(target.card.animate).mock.results[0].value;
    controller.disconnect();
    expect(animation.cancel).toHaveBeenCalled();
  });
});
