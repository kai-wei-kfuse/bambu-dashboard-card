import { afterEach, describe, expect, it, vi } from 'vitest';
import { BambuCamera, BambuFileImage } from '../src/ui/media';
import type { NativeCard } from '../src/ha/types';
import { fixtureHass } from './fixtures';

afterEach(() => { document.body.replaceChildren(); vi.unstubAllGlobals(); delete window.loadCardHelpers; });

describe('authenticated media lifecycle', () => {
  it.each([[0, 'auto'], [2, 'live']])('delegates an external HA camera with feature %s to native %s mode', async (features, view) => {
    let visibility!: IntersectionObserverCallback;
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) { visibility = callback; }
      observe() {}
      disconnect() {}
    });
    const create = vi.fn().mockImplementation(() => Object.assign(document.createElement('hui-picture-entity-card'), { setConfig() {} }) as NativeCard);
    window.loadCardHelpers = async () => ({ createCardElement: create });
    const hass = fixtureHass();
    hass.states['camera.external'] = { entity_id: 'camera.external', state: 'idle', attributes: { supported_features: features } };
    const camera = new BambuCamera();
    camera.hass = hass;
    camera.entity = 'camera.external';
    document.body.append(camera);
    await camera.updateComplete;
    visibility([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    await vi.waitFor(() => expect(create).toHaveBeenCalledWith({ type: 'picture-entity', entity: 'camera.external', camera_view: view, show_name: false, show_state: false }));
  });

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

  it('falls back to slotted empty state when an HA image entity returns HTTP 500 or empty bytes and recovers on reload', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 500 }))
      .mockResolvedValueOnce(new Response(new Uint8Array(), { status: 200 }))
      .mockResolvedValueOnce(new Response(new Uint8Array([137, 80, 78, 71]), { status: 200, headers: { 'Content-Type': 'image/png' } }));
    const media = new BambuFileImage();
    media.entity = 'image.one_cover_image';
    media.version = 'v1';
    media.hass = fixtureHass({ fetchWithAuth: request });
    const fallback = document.createElement('div');
    fallback.className = 'preview-empty';
    fallback.textContent = 'No print preview available';
    media.append(fallback);
    document.body.append(media);

    await vi.waitFor(() => expect(media.empty).toBe(true));
    expect(media.hasAttribute('empty')).toBe(true);
    expect(media.shadowRoot!.querySelector('.error')).toBeNull();
    expect(media.shadowRoot!.querySelector('slot')).not.toBeNull();
    expect(media.textContent).toContain('No print preview available');

    media.version = 'v2';
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));
    await vi.waitFor(() => expect(media.empty).toBe(true));
    expect(media.shadowRoot!.querySelector('.error')).toBeNull();

    media.version = 'v3';
    await vi.waitFor(() => expect(media.shadowRoot!.querySelector('img')).not.toBeNull());
    expect(media.empty).toBe(false);
    expect(media.hasAttribute('empty')).toBe(false);
  });

  it('keeps auth and file-cache HTTP errors visible instead of treating them as empty', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(new Response('', { status: 401 }))
      .mockResolvedValueOnce(new Response('', { status: 500 }));

    const imageMedia = new BambuFileImage();
    imageMedia.entity = 'image.one_cover_image';
    imageMedia.hass = fixtureHass({ fetchWithAuth: request });
    document.body.append(imageMedia);
    await vi.waitFor(() => expect(imageMedia.shadowRoot!.querySelector('.error')?.textContent).toContain('Image: HTTP 401'));
    expect(imageMedia.empty).toBe(false);

    const cacheMedia = new BambuFileImage();
    cacheMedia.path = 'SYNTHETIC/prints/preview.png';
    cacheMedia.hass = fixtureHass({ fetchWithAuth: request });
    document.body.append(cacheMedia);
    await vi.waitFor(() => expect(cacheMedia.shadowRoot!.querySelector('.error')?.textContent).toContain('Image: HTTP 500'));
    expect(cacheMedia.empty).toBe(false);
  });
});
