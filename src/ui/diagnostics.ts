import { LitElement, html, nothing } from 'lit';
import { binaryReading, diagnosticEntity, printerAlerts } from '../domain/diagnostics';
import { entityAvailability } from '../domain/printers';
import type { Printer } from '../domain/printers';
import { entityValue } from './entity-value';
import { text } from './i18n';
import type { Language, Message } from './i18n';
import { icon } from './icons';

const deviceFields: { key: string; label: Message; domain?: string }[] = [
  { key: 'online', label: 'deviceOnline', domain: 'binary_sensor' }, { key: 'wifi_signal', label: 'wifiSignal' },
  { key: 'mqtt_mode', label: 'connectionMode' }, { key: 'sdcard_status', label: 'sdCard' },
  { key: 'nozzle_diameter', label: 'nozzleDiameter' }, { key: 'nozzle_type', label: 'nozzleType' },
  { key: 'firmware_update', label: 'firmwareStatus', domain: 'binary_sensor' }, { key: 'total_usage_hours', label: 'estimatedUsage' },
];

export class BambuPrinterDiagnostics extends LitElement {
  static properties = { printer: { attribute: false }, language: { attribute: false }, variant: {} };
  printer?: Printer;
  language: Language = 'en';
  variant: 'alerts' | 'device' = 'alerts';
  protected createRenderRoot(): HTMLElement { return this; }
  private t(key: Message): string { return text(this.language, key); }

  private deviceValue(field: typeof deviceFields[number]): string {
    const entity = diagnosticEntity(this.printer!, field.key, field.domain);
    if (entityAvailability(entity) !== 'ready') return entityValue(this.language, entity);
    if (field.domain === 'binary_sensor') {
      const value = binaryReading(entity);
      if (value === null) return `${this.t('unknown')} · ${entity!.state!.state}`;
      return field.key === 'online' ? this.t(value ? 'online' : 'offline') : this.t(value ? 'firmwareAvailable' : 'firmwareNoUpdate');
    }
    const state = entity!.state!.state;
    const labels: Record<string, Message> = { local: 'connectionLocal', bambu_cloud: 'connectionCloud', normal: 'sdNormal', missing: 'sdMissing', abnormal: 'sdAbnormal', hardened_steel: 'hardenedSteel', stainless_steel: 'stainlessSteel' };
    return labels[state] ? this.t(labels[state]) : entityValue(this.language, entity);
  }

  protected render() {
    if (!this.printer) return nothing;
    if (this.variant === 'device') return html`<section class="panel device-health"><div class="panel-head"><h2>${icon('connection')} ${this.t('deviceHealth')}</h2><span class="description">${this.printer.model}</span></div><dl class="device-readings">${deviceFields.map((field) => html`<div><dt>${this.t(field.label)}</dt><dd>${this.deviceValue(field)}</dd></div>`)}</dl><p class="panel-note">${this.t('usageEstimateHelp')}</p></section>`;
    const { groups, status } = printerAlerts(this.printer);
    const headings: Record<typeof status, Message> = { offline: 'alertsOffline', alert: 'alertsActive', clear: 'alertsClear', unknown: 'alertsUnknown' };
    return html`<section class="panel alerts-panel"><div class="panel-head"><h2>${icon('alert')} ${this.t('alerts')}</h2><span class="diagnostic-state ${status}">${this.t(headings[status])}</span></div><div class="diagnostic-body">
      ${status === 'offline' ? html`<p class="diagnostic-warning">${this.t('alertsOfflineHelp')}</p>` : nothing}
      ${groups.map((group) => html`<div class="diagnostic-group"><div class="diagnostic-group-title"><b>${this.t(group.kind === 'hms_errors' ? 'hmsErrors' : 'printError')}</b><span class=${group.active ? 'diagnostic-warning' : 'description'}>${group.active === null ? (group.invalid ? this.t('diagnosticInvalid') : this.t(group.availability === 'ready' ? 'unknown' : group.availability)) : this.t(group.active ? 'reportedFault' : 'noReportedFault')}</span></div>
        ${group.invalid ? html`<p class="diagnostic-warning" role="alert">${this.t('diagnosticDetailsInvalid')}${group.detailError ? ` · ${group.detailError}` : ''}</p>` : nothing}
        ${group.active && !group.alerts.length ? html`<p class="description">${this.t('diagnosticDetailsMissing')}</p>` : nothing}
        ${group.alerts.map((alert) => html`<article class="printer-alert"><div><b>${alert.code || this.t('reportedFault')}</b>${alert.severity ? html`<span class="alert-severity">${alert.severity}</span>` : nothing}</div><p>${alert.description || this.t('diagnosticDetailsMissing')}</p>${alert.wiki ? html`<a href=${alert.wiki} target="_blank" rel="noopener noreferrer">${this.t('officialTroubleshooting')} ↗</a>` : alert.linkRejected ? html`<small>${this.t('diagnosticLinkInvalid')}</small>` : nothing}</article>`)}
      </div>`)}
    </div><p class="panel-note">${this.t('alertsScopeHelp')}</p></section>`;
  }
}

customElements.define('bambu-printer-diagnostics', BambuPrinterDiagnostics);
