import { html, render } from 'lit';
import { BambuDashboardCard } from '../src/card';
import { printerIllustration } from '../src/ui/icons';
import type { HomeAssistant, NativeCard } from '../src/ha/types';
import { fixtureHass, project, slicedProject } from '../test/fixtures';

class PreviewCamera extends HTMLElement implements NativeCard {
  hass?: HomeAssistant;
  setConfig(): void {}
  connectedCallback(): void {
    this.style.cssText = 'display:grid;place-items:center;height:100%;background:radial-gradient(ellipse at center,#2b866f18,transparent 75%);color:#a6b8b0;position:relative';
    render(html`${printerIllustration()}<span style="position:absolute;right:10px;top:10px;font:9px system-ui;letter-spacing:1px;color:#8ca89a">SYNTHETIC CAMERA</span>`, this);
    const svg = this.querySelector('svg');
    if (svg) svg.style.cssText = 'width:88%;height:100%;max-width:320px';
  }
}
customElements.define('bambu-preview-camera', PreviewCamera);

window.loadCardHelpers = async () => ({ createCardElement: () => document.createElement('bambu-preview-camera') as PreviewCamera });
const bytes = slicedProject();
const files = [
  { ...project, filename: 'Modular desk organizer.3mf', size: bytes.length, size_human: `${(bytes.length / 1024).toFixed(1)} KB`, thumbnail_path: 'SYNTHETIC_ONE/prints/cache/preview.svg', printer_name: 'Workshop A1' },
  { ...project, filename: 'Cable guide set.3mf', path: 'SYNTHETIC_TWO/prints/cache/cable-guide.3mf', size: bytes.length, size_human: `${(bytes.length / 1024).toFixed(1)} KB`, printer_serial: 'SYNTHETIC_TWO', printer_device_id: 'printer-two', printer_name: 'Studio A1', thumbnail_path: 'SYNTHETIC_TWO/prints/cache/preview.svg' },
];
const thumbnail = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="m20 35 30-17 30 17v34L50 86 20 69z" fill="#28bb8b22" stroke="#28bb8b" stroke-width="3"/><path d="m20 35 30 17 30-17M50 52v34" fill="none" stroke="#28bb8b" stroke-width="3"/></svg>';
const readOnly = () => { throw new Error('This preview is read-only. Install the card in Home Assistant to control a real printer.'); };

const hass: HomeAssistant = fixtureHass({
  user: { is_admin: false },
  callService: async () => readOnly(),
  callApi: async <T>(method: string, path: string) => {
    if (method === 'GET' && path === 'bambu_lab/print_history') return { files } as T;
    return readOnly();
  },
  fetchWithAuth: async (path: string) => {
    if (path.endsWith('.3mf')) return new Response(bytes as BodyInit);
    if (path.endsWith('preview.svg')) return new Response(thumbnail, { headers: { 'Content-Type': 'image/svg+xml' } });
    throw new Error(`Unconfigured preview file: ${path}`);
  },
});
const card = new BambuDashboardCard();
card.setConfig({ type: 'custom:bambu-dashboard-card', discovery: 'auto' });
card.hass = hass;
document.querySelector('#app')!.append(card);
