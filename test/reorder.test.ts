import { afterEach, describe, expect, it, vi } from 'vitest';
import { CardReorder } from '../src/ui/reorder';

const active: CardReorder[] = [];
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
    box.append(handle);
    host.append(box);
    vi.spyOn(box, 'getBoundingClientRect').mockReturnValue(new DOMRect(x, 0, 200, 300));
    return { box, handle };
  };
  const source = item('camera', 0);
  const target = item('job', 220);
  const move = vi.fn();
  const controller = new CardReorder(host, move);
  controller.enabled = true;
  active.push(controller);
  return { source, target, move, controller, parent };
}

function pointer(target: EventTarget, type: string, x: number, y: number, pointerType = 'mouse') {
  target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, isPrimary: true, button: 0, clientX: x, clientY: y, pointerType }));
}

describe('card drag gestures', () => {
  it.each(['mouse', 'touch'])('moves once from a dedicated %s handle and cleans its preview without moving card DOM', (type) => {
    const { source, target, move, parent } = setup();
    pointer(source.handle, 'pointerdown', 20, 20, type);
    pointer(window, 'pointermove', 250, 25, type);
    expect(target.box.getAttribute('data-layout-drop')).toBe('before');
    expect(parent.querySelector('.layout-drag-ghost')!.textContent).toBe('camera');
    pointer(window, 'pointerup', 250, 25, type);
    expect(move).toHaveBeenCalledExactlyOnceWith({ source: 'camera', target: 'job', after: false });
    expect(parent.querySelector('.layout-drag-ghost')).toBeNull();
    expect(source.box.nextElementSibling).toBe(target.box);
    expect(source.box.hasAttribute('data-layout-dragging')).toBe(false);
  });

  it('cancels on Escape or detach and never activates when disabled or started from content', () => {
    const { source, move, controller, parent } = setup();
    pointer(source.box, 'pointerdown', 20, 20);
    expect(parent.querySelector('.layout-drag-ghost')).toBeNull();
    pointer(source.handle, 'pointerdown', 20, 20);
    pointer(window, 'pointermove', 250, 25);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    pointer(window, 'pointerup', 250, 25);
    expect(move).not.toHaveBeenCalled();
    controller.enabled = false;
    pointer(source.handle, 'pointerdown', 20, 20);
    expect(parent.querySelector('.layout-drag-ghost')).toBeNull();
    controller.enabled = true;
    pointer(source.handle, 'pointerdown', 20, 20);
    controller.disconnect();
    expect(parent.querySelector('.layout-drag-ghost')).toBeNull();
    pointer(window, 'pointerup', 250, 25);
    expect(move).not.toHaveBeenCalled();
  });

  it('cancels a drop whose source was removed while dragging', () => {
    const { source, move } = setup();
    pointer(source.handle, 'pointerdown', 20, 20);
    pointer(window, 'pointermove', 250, 25);
    source.box.remove();
    pointer(window, 'pointerup', 250, 25);
    expect(move).not.toHaveBeenCalled();
  });
});
