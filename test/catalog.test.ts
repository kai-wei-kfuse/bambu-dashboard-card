import { describe, expect, it, vi } from 'vitest';
import { catalogFor } from '../src/ha/catalog';
import { fixtureHass, fixtureRegistry } from './fixtures';

describe('shared registry subscriptions', () => {
  it('shares subscriptions and releases them only after the final consumer leaves', async () => {
    const release = vi.fn();
    const subscribeEvents = vi.fn().mockResolvedValue(release);
    const hass = fixtureHass({ connection: { subscribeEvents } });
    const first = catalogFor(hass);
    const second = catalogFor(hass);
    expect(first).toBe(second);
    const listener = vi.fn();
    const leaveOne = first.subscribe(listener);
    const leaveTwo = second.subscribe(vi.fn());
    await vi.waitFor(() => expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ loading: false, snapshot: expect.any(Object) })));
    expect(subscribeEvents).toHaveBeenCalledTimes(2);
    leaveOne();
    expect(release).not.toHaveBeenCalled();
    leaveTwo();
    expect(release).toHaveBeenCalledTimes(2);
  });

  it('reports registry errors instead of reporting zero printers', async () => {
    const hass = fixtureHass({ callWS: vi.fn().mockRejectedValue(new Error('Unauthorized registry access')) });
    const listener = vi.fn();
    const leave = catalogFor(hass).subscribe(listener);
    await vi.waitFor(() => expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ loading: false, error: expect.objectContaining({ message: 'Unauthorized registry access' }) })));
    leave();
  });

  it('does not let an old request overwrite newer device discovery', async () => {
    const registry = fixtureRegistry();
    const hass = fixtureHass();
    const store = catalogFor(hass);
    const listener = vi.fn();
    const leave = store.subscribe(listener);
    await vi.waitFor(() => expect(listener).toHaveBeenLastCalledWith(expect.objectContaining({ loading: false })));
    let resolveOld: (value: unknown) => void = () => {};
    const old = new Promise((resolve) => { resolveOld = resolve; });
    const callWS = vi.fn().mockImplementationOnce(() => old).mockResolvedValueOnce(registry.entities).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    store.updateHass({ ...hass, callWS });
    const previous = store.refresh();
    await store.refresh();
    resolveOld(registry.devices);
    await previous;
    expect(listener).toHaveBeenLastCalledWith({ loading: false, snapshot: { devices: [], entities: [] } });
    leave();
  });
});
