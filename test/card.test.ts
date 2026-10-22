import { afterEach, describe, expect, it, vi } from 'vitest';
import { BambuDashboardCard } from '../src/card';
import { fixtureHass, fixtureRegistry, project, slicedProject } from './fixtures';

afterEach(() => { document.body.replaceChildren(); });

describe('complete dashboard', () => {
  it('renders every discovered printer, navigates details, and exposes the complete parameter list', async () => {
    const card = new BambuDashboardCard();
    card.setConfig({ type: 'custom:bambu-dashboard-card' });
    card.hass = fixtureHass();
    document.body.append(card);
    await vi.waitFor(() => expect(card.shadowRoot!.querySelectorAll('.printer-card')).toHaveLength(2));
    const printerButtons = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.printer-link')];
    printerButtons.find((button) => button.textContent!.includes('Workshop'))!.click();
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector('.detail-grid')).not.toBeNull();
    expect(card.shadowRoot!.textContent).toContain('Modular desk organizer');
    expect(card.shadowRoot!.querySelector<HTMLSelectElement>('.field select')!.value).toBe('standard');
    const parameters = [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.tabs button')].find((button) => button.textContent!.includes('All parameters'))!;
    parameters.click();
    await card.updateComplete;
    const expectedCount = fixtureRegistry().entities.filter((entry) => entry.device_id === 'printer-one' || entry.device_id === 'ams-one').length;
    expect(card.shadowRoot!.querySelectorAll('.parameter-table tbody tr')).toHaveLength(expectedCount);
  });

  it('keeps a cached-project API failure visible in the file workspace', async () => {
    const card = new BambuDashboardCard();
    card.hass = fixtureHass({ callApi: vi.fn().mockRejectedValue(new Error('HTTP 404')) });
    document.body.append(card);
    await vi.waitFor(() => expect(card.shadowRoot!.querySelectorAll('.printer-card')).toHaveLength(2));
    [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.tabs button')].find((button) => button.textContent!.includes('Recent files'))!.click();
    await vi.waitFor(() => expect(card.shadowRoot!.textContent).toContain('HTTP 404'));
    expect(card.shadowRoot!.textContent).not.toContain('No cached projects are available.');
  });

  it('allows correcting AMS validation and keeps the selected target explicit', async () => {
    const hass = fixtureHass({
      callApi: vi.fn().mockResolvedValue({ files: [project] }),
      fetchWithAuth: vi.fn().mockResolvedValue(new Response(slicedProject() as BodyInit)),
    });
    hass.states['sensor.one_print_status'].state = 'idle';
    const card = new BambuDashboardCard();
    card.hass = hass;
    document.body.append(card);
    await vi.waitFor(() => expect(card.shadowRoot!.querySelectorAll('.printer-card')).toHaveLength(2));
    [...card.shadowRoot!.querySelectorAll<HTMLButtonElement>('.tabs button')].find((button) => button.textContent!.includes('Recent files'))!.click();
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('.file-row')).not.toBeNull());
    card.shadowRoot!.querySelector<HTMLButtonElement>('.file-row button.button')!.click();
    await vi.waitFor(() => expect(card.shadowRoot!.querySelector('.dialog select[aria-label="Target printer"]')).not.toBeNull());
    const useAms = [...card.shadowRoot!.querySelectorAll<HTMLLabelElement>('.dialog label')].find((label) => label.textContent!.includes('Use AMS'))!.querySelector<HTMLInputElement>('input')!;
    useAms.click();
    await card.updateComplete;
    card.shadowRoot!.querySelector<HTMLButtonElement>('.dialog-footer .primary')!.click();
    await card.updateComplete;
    expect(card.shadowRoot!.textContent).toContain('Choose the AMS mapping');
    const mapping = card.shadowRoot!.querySelector<HTMLInputElement>('input[placeholder="0,1,2"]')!;
    mapping.value = '0';
    mapping.dispatchEvent(new Event('input', { bubbles: true }));
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector<HTMLButtonElement>('.dialog-footer .primary')!.disabled).toBe(false);
    const target = card.shadowRoot!.querySelector<HTMLSelectElement>('.dialog select[aria-label="Target printer"]')!;
    target.value = 'printer-two';
    target.dispatchEvent(new Event('change', { bubbles: true }));
    await card.updateComplete;
    expect(card.shadowRoot!.querySelector('.dialog-target')!.textContent).toContain('Studio A1');
    expect(card.shadowRoot!.querySelector('input[placeholder="0,1,2"]')).toBeNull();
  });
});
