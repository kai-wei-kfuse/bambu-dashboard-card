import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BambuMasonry } from '../src/ui/masonry';

let callbacks: FrameRequestCallback[];
let onResize: ResizeObserverCallback;
let observe: ReturnType<typeof vi.fn>;
let unobserve: ReturnType<typeof vi.fn>;
let disconnect: ReturnType<typeof vi.fn>;

beforeEach(() => {
  callbacks = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  vi.stubGlobal('ResizeObserver', class {
    constructor(callback: ResizeObserverCallback) { onResize = callback; }
    observe = observe;
    unobserve = unobserve;
    disconnect = disconnect;
  });
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => { callbacks.push(callback); return callbacks.length; }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

function item(height: number): HTMLElement {
  const element = document.createElement('section');
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ height } as DOMRect);
  return element;
}

function mount(...items: HTMLElement[]): BambuMasonry {
  const layout = new BambuMasonry();
  layout.style.cssText = 'grid-auto-rows:1px;row-gap:14px';
  layout.append(...items);
  document.body.append(layout);
  return layout;
}

describe('content-sized masonry', () => {
  it('allocates separate spans to natural card heights and reflows changed content without moving nodes', () => {
    const camera = item(100);
    const job = item(250);
    const layout = mount(camera, job);
    callbacks.shift()!(0);
    expect(camera.style.gridRowEnd).toBe('span 8');
    expect(job.style.gridRowEnd).toBe('span 18');
    vi.mocked(camera.getBoundingClientRect).mockReturnValue({ height: 125 } as DOMRect);
    onResize([], {} as ResizeObserver);
    onResize([], {} as ResizeObserver);
    expect(callbacks).toHaveLength(1);
    callbacks.shift()!(0);
    expect(camera.style.gridRowEnd).toBe('span 10');
    expect([...layout.children]).toEqual([camera, job]);
  });

  it('observes new modules, releases removed modules and stops pending work on detach', async () => {
    const camera = item(100);
    const layout = mount(camera);
    const ams = item(180);
    layout.append(ams);
    await vi.waitFor(() => expect(observe).toHaveBeenCalledWith(ams));
    camera.remove();
    await vi.waitFor(() => expect(unobserve).toHaveBeenCalledWith(camera));
    layout.remove();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(cancelAnimationFrame).toHaveBeenCalled();
    document.body.append(layout);
    expect(observe.mock.calls.filter(([element]) => element === ams)).toHaveLength(2);
  });
});
