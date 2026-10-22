import { afterEach, describe, expect, it, vi } from 'vitest';
import { BambuFileImage } from '../src/ui/media';
import { fixtureHass } from './fixtures';

afterEach(() => document.body.replaceChildren());

describe('authenticated media lifecycle', () => {
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
