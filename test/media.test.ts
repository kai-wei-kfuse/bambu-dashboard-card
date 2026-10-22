import { afterEach, describe, expect, it, vi } from 'vitest';
import { BambuCamera, BambuFileImage } from '../src/ui/media';
import type { NativeCard } from '../src/ha/types';
import { fixtureHass } from './fixtures';

afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); delete window.loadCardHelpers; });

describe('authenticated media lifecycle', () => {
  it('reserves a camera frame ratio while offscreen and clears it for a different camera', async () => {
    let onVisibility!: IntersectionObserverCallback;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { onVisibility = callback; }
      observe() {}
      disconnect() {}
    });
    window.loadCardHelpers = async () => ({ createCardElement: () => Object.assign(document.createElement('hui-picture-entity-card'), { setConfig() {} }) as NativeCard });
    const camera = new BambuCamera();
    camera.hass = fixtureHass();
    camera.entity = 'camera.one_camera';
    document.body.append(camera);
    await camera.updateComplete;
    onVisibility([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    await vi.waitFor(() => expect(camera.shadowRoot!.querySelector('hui-picture-entity-card')).not.toBeNull());
    onVisibility([{ isIntersecting: false, boundingClientRect: { width: 320, height: 240 } } as IntersectionObserverEntry], {} as IntersectionObserver);
    await camera.updateComplete;
    expect(camera.style.aspectRatio).toBe('320 / 240');
    expect(camera.shadowRoot!.querySelector('hui-picture-entity-card')).toBeNull();
    camera.entity = 'camera.two_camera';
    await camera.updateComplete;
    expect(camera.style.aspectRatio).toBe('');
  });

  it('reloads through the current HA session when its connection changes', async () => {
    const firstRequest = vi.fn().mockImplementation(async () => new Response('first', { headers: { 'Content-Type': 'image/png' } }));
    const secondRequest = vi.fn().mockImplementation(async () => new Response('second', { headers: { 'Content-Type': 'image/png' } }));
    const media = new BambuFileImage();
    media.path = 'SYNTHETIC/prints/preview.png';
    media.hass = fixtureHass({ fetchWithAuth: firstRequest });
    document.body.append(media);
    await vi.waitFor(() => expect(firstRequest).toHaveBeenCalledOnce());
    media.hass = fixtureHass({ fetchWithAuth: secondRequest });
    await vi.waitFor(() => expect(secondRequest).toHaveBeenCalledOnce());
    expect(secondRequest).toHaveBeenCalledWith('/api/bambu_lab/file_cache/SYNTHETIC/prints/preview.png', expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('requests fresh media when the same element is removed and reattached', async () => {
    const request = vi.fn().mockImplementation(async () => new Response('image', { headers: { 'Content-Type': 'image/png' } }));
    const media = new BambuFileImage();
    media.path = 'SYNTHETIC/prints/preview.png';
    media.hass = fixtureHass({ fetchWithAuth: request });
    document.body.append(media);
    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());
    media.remove();
    document.body.append(media);
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });
});
