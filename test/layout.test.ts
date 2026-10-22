import { describe, expect, it, vi } from 'vitest';
import { cardPresentation, defaultLayout, moveLayoutCard, parseLayoutPreference, resolveLayoutOrder, updateCardPresentation } from '../src/domain/layout';
import { LayoutClient } from '../src/ha/layout';
import { fixtureHass } from './fixtures';

describe('detail layout order', () => {
  it('adds capabilities without hiding cards and remembers the position of an absent feeder', () => {
    const saved = ['ams:offline', 'job', 'camera'];
    const available = ['camera', 'job', 'ams:new'];
    expect(resolveLayoutOrder(available, saved)).toEqual(['job', 'camera', 'ams:new']);
    const moved = moveLayoutCard(available, saved, { source: 'camera', target: 'job', after: false });
    expect(resolveLayoutOrder(available, moved)).toEqual(['camera', 'job', 'ams:new']);
    expect(moved[0]).toBe('ams:offline');
    expect(resolveLayoutOrder([...available, 'ams:offline'], moved)[0]).toBe('ams:offline');
    expect(saved).toEqual(['ams:offline', 'job', 'camera']);
  });

  it('moves before/after a target and rejects a stale move rather than removing a card', () => {
    const available = ['camera', 'job', 'controls'];
    expect(moveLayoutCard(available, [], { source: 'camera', target: 'controls', after: true })).toEqual(['job', 'controls', 'camera']);
    expect(moveLayoutCard(available, [], { source: 'controls', target: 'job', after: false })).toEqual(['camera', 'controls', 'job']);
    expect(() => moveLayoutCard(available, [], { source: 'removed', target: 'job', after: true })).toThrow('cards changed');
  });

  it('accepts only actual absence or supported unique layout preferences', () => {
    expect(parseLayoutPreference(null)).toEqual({ version: 2, order: [], cards: {} });
    expect(parseLayoutPreference({ version: 1, order: ['job', 'camera'] }).order).toEqual(['job', 'camera']);
    for (const value of [undefined, [], { version: 2, order: [] }, { version: 1, order: ['camera', 'camera'] }, { version: 1, order: [''] }, { version: 1, order: [4] }]) {
      expect(() => parseLayoutPreference(value)).toThrow();
    }
  });
});

describe('HA per-user layout storage', () => {
  it('uses independent per-printer keys and treats only null as missing preferences', async () => {
    const callWS = vi.fn().mockResolvedValueOnce({ value: null }).mockResolvedValueOnce({ value: { version: 1, order: ['job'] } }).mockResolvedValueOnce(undefined);
    const hass = fixtureHass({ callWS });
    const client = new LayoutClient(hass);
    expect((await client.load('printer-one')).order).toEqual([]);
    expect((await client.load('printer-two')).order).toEqual(['job']);
    await client.save('printer-two', { version: 2, order: ['camera', 'job'], cards: {} });
    expect(callWS.mock.calls[0][0]).toEqual({ type: 'frontend/get_user_data', key: 'bambu_dashboard.detail_layout.v1.printer-one' });
    expect(callWS.mock.calls[2][0]).toEqual({ type: 'frontend/set_user_data', key: 'bambu_dashboard.detail_layout.v1.printer-two', value: { version: 2, order: ['camera', 'job'], cards: {} } });
  });

  it('exposes unsupported responses and backend write failures', async () => {
    const callWS = vi.fn().mockResolvedValueOnce({}).mockResolvedValueOnce({ value: { version: 99, order: [] } }).mockRejectedValueOnce(new Error('Storage unavailable'));
    const client = new LayoutClient(fixtureHass({ callWS }));
    await expect(client.load('one')).rejects.toThrow('invalid frontend user-data');
    await expect(client.load('one')).rejects.toThrow('unsupported detail layout');
    await expect(client.save('one', defaultLayout())).rejects.toThrow('Storage unavailable');
  });
});

describe('card presentation preferences', () => {
  it('migrates v1 without changing order and validates every v2 setting', () => {
    expect(parseLayoutPreference({ version: 1, order: ['job', 'camera'] })).toEqual({ version: 2, order: ['job', 'camera'], cards: {} });
    const preference = updateCardPresentation(defaultLayout(), 'ams:offline', { hidden: true, collapsed: true, width: 'wide' });
    expect(parseLayoutPreference(preference)).toEqual(preference);
    expect(cardPresentation(preference, 'constructor')).toEqual({ hidden: false, collapsed: false, width: 'normal' });
    for (const cards of [null, [], { job: { hidden: 'yes', collapsed: false, width: 'normal' } }, { job: { hidden: false, collapsed: false, width: 'three' } }, { '': { hidden: false, collapsed: false, width: 'normal' } }]) expect(() => parseLayoutPreference({ version: 2, order: [], cards })).toThrow();
    expect(cardPresentation(defaultLayout(), 'job').hidden).toBe(false);
  });
});
