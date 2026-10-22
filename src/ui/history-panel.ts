import { LitElement, html, nothing, svg } from 'lit';
import type { PropertyValues } from 'lit';
import { asError } from '../ha/catalog';
import { HistoryClient } from '../ha/history';
import { historySpecs, recentPrinterEvents, temperatureSegments, celsius } from '../domain/history';
import type { HistoryRecords, HistorySpec, PrinterEvent } from '../domain/history';
import { entityAvailability } from '../domain/printers';
import type { Printer } from '../domain/printers';
import type { HomeAssistant } from '../ha/types';
import { text } from './i18n';
import type { Language, Message } from './i18n';
import { icon } from './icons';

// The approved views show 1h of temperatures and 24h of events; the workspace minute clock refreshes them.
const HOUR_MS = 3_600_000;
const REFRESH_MS = 60_000;
const temperatureLabels: Record<string, Message> = { nozzle_temp: 'nozzle', target_nozzle_temp: 'targetNozzle', bed_temp: 'bed', target_bed_temp: 'targetBed' };

export class BambuPrinterHistory extends LitElement {
  static properties = {
    hass: { attribute: false }, printer: { attribute: false }, language: { attribute: false }, variant: {}, now: { attribute: false },
    _records: { state: true }, _loading: { state: true }, _error: { state: true }, _start: { state: true }, _end: { state: true },
  };
  hass?: HomeAssistant;
  printer?: Printer;
  language: Language = 'en';
  variant: 'temperature' | 'events' = 'temperature';
  now = Date.now();
  private _records?: HistoryRecords;
  private _loading = false;
  private _error = '';
  private _start = 0;
  private _end = 0;
  private generation = 0;
  private context?: { connection: object; signature: string };
  private requestedMinute?: number;

  protected createRenderRoot(): HTMLElement { return this; }
  connectedCallback(): void { super.connectedCallback(); this.requestUpdate(); }
  disconnectedCallback(): void { super.disconnectedCallback(); this.generation++; this.context = undefined; }
  private t(key: Message): string { return text(this.language, key); }
  private get specs(): HistorySpec[] { return this.printer ? historySpecs(this.printer, this.variant) : []; }
  private get entityIds(): string[] { return this.specs.filter(({ entity }) => entity && !entity.entry.disabled_by).map(({ entity }) => entity!.entry.entity_id); }

  protected willUpdate(_changes: PropertyValues): void {
    if (!this.isConnected || !this.hass || !this.printer) return;
    const signature = JSON.stringify([this.printer.id, this.variant, this.entityIds]);
    if (this.context?.connection !== this.hass.connection || this.context.signature !== signature) {
      this.context = { connection: this.hass.connection, signature };
      this.generation++;
      this._records = undefined;
      this._loading = false;
      this._error = '';
      this._end = 0;
      this.requestedMinute = undefined;
    }
    if (this.entityIds.length && !this._loading && this.requestedMinute !== Math.floor(this.now / REFRESH_MS)) void this.load();
  }

  private async load(): Promise<void> {
    if (!this.isConnected || this._loading || !this.hass || !this.entityIds.length) return;
    const generation = this.generation;
    const hass = this.hass;
    const variant = this.variant;
    const end = this.now;
    const start = end - (variant === 'temperature' ? HOUR_MS : 24 * HOUR_MS);
    const ids = this.entityIds;
    this.requestedMinute = Math.floor(this.now / REFRESH_MS);
    this._loading = true;
    this._error = '';
    try {
      const records = await new HistoryClient(hass).read(ids, start, end, variant);
      if (generation !== this.generation) return;
      this._records = records;
      this._start = start;
      this._end = end;
    } catch (error) {
      if (generation === this.generation) this._error = asError(error).message;
    } finally {
      if (generation === this.generation) this._loading = false;
    }
  }

  private time(value: number, full = false): string {
    return new Intl.DateTimeFormat(this.language, { timeZone: this.hass?.config?.time_zone, ...(full ? { month: '2-digit', day: '2-digit' } : {}), hour: '2-digit', minute: '2-digit', hour12: false }).format(value);
  }
  private number(value: number): string { return new Intl.NumberFormat(this.language, { maximumFractionDigits: 1 }).format(value); }

  private temperatures() {
    const series = this.specs.map((spec) => {
      const points = spec.entity ? this._records!.get(spec.entity.entry.entity_id) || [] : [];
      return { ...spec, points, segments: temperatureSegments(points, this._start, this._end) };
    });
    const values = series.flatMap((item) => item.segments.flatMap((segment) => segment.map((point) => point.value)));
    if (!values.length) return this.empty('noTemperatureHistory');
    let low = values.reduce((current, value) => Math.min(current, value), Infinity);
    let high = values.reduce((current, value) => Math.max(current, value), -Infinity);
    if (low === high) { const padding = Math.max(Math.abs(low) * .05, 1); low -= padding; high += padding; }
    const x = (time: number) => 36 + (time - this._start) / (this._end - this._start) * 272;
    const y = (value: number) => 145 - (value - low) / (high - low) * 124;
    return html`<div class="temperature-chart">${svg`<svg viewBox="0 0 320 174" role="img" aria-label=${this.t('temperatureChartLabel')}>
      <text x="4" y="13" class="chart-axis">°C</text>
      ${[low, (low + high) / 2, high].map((value) => svg`<line x1="36" x2="308" y1=${y(value)} y2=${y(value)} class="chart-grid"></line><text x="30" y=${y(value) + 4} text-anchor="end" class="chart-axis">${this.number(value)}</text>`)}
      ${series.map((spec) => spec.segments.map((segment) => svg`<path d=${segment.map((point, index) => `${index ? 'L' : 'M'}${x(point.time).toFixed(2)},${y(point.value).toFixed(2)}`).join(' ')} fill="none" stroke=${spec.color} stroke-width=${spec.target ? '1.5' : '2'} stroke-dasharray=${spec.target ? '4 3' : 'none'}></path>`))}
      <text x="36" y="166" class="chart-axis">${this.time(this._start)}</text><text x="308" y="166" text-anchor="end" class="chart-axis">${this.time(this._end)}</text>
    </svg`}</div><div class="chart-legend">${series.map((spec) => {
      const latest = spec.points.at(-1);
      const value = latest ? celsius(latest) : null;
      return html`<div><span class="legend-swatch ${spec.target ? 'target' : ''}" style=${`--series-color:${spec.color}`}></span><span>${this.t(temperatureLabels[spec.key])}</span><b>${value === null ? this.t(spec.entity ? 'noRecordedValue' : 'unsupported') : `${this.number(value)} °C`}</b></div>`;
    })}</div><p class="panel-note">${this.t('temperatureHistoryHelp')}</p>`;
  }

  private eventTitle(event: PrinterEvent): string {
    if (event.kind === 'hms_errors' || event.kind === 'print_error') {
      const name = this.t(event.kind === 'hms_errors' ? 'hmsErrors' : 'printError');
      return `${name} · ${event.state === 'on' ? this.t('reportedFault') : event.state === 'off' ? this.t('faultCleared') : event.state}`;
    }
    if (event.state === 'running' && event.previous === 'pause') return this.t('eventResumed');
    if (event.state === 'running' && ['prepare', 'idle', 'finish'].includes(event.previous || '')) return this.t('eventStarted');
    const labels: Record<string, Message> = { running: 'running', printing: 'running', prepare: 'prepare', pause: 'pause', paused_user: 'pause', finish: 'eventFinished', failed: 'failed', idle: 'idle', offline: 'offline', unavailable: 'unavailable', unknown: 'unknown' };
    return labels[event.state] ? this.t(labels[event.state]) : event.state;
  }

  private events() {
    const events = recentPrinterEvents(this.specs, this._records!, this._start, this._end);
    if (!events.length) return this.empty('noRecentEvents');
    return html`<ol class="printer-event-list">${events.map((event) => html`<li class=${event.kind !== 'print_status' && event.state === 'on' ? 'fault' : ''}><span class="event-dot"></span><div><b>${this.eventTitle(event)}</b><time datetime=${new Date(event.time).toISOString()}>${this.time(event.time, true)}</time></div></li>`)}</ol><p class="panel-note">${this.t('recentEventsHelp')} · ${events.length}</p>`;
  }

  private empty(key: Message) { return html`<div class="history-empty"><span>${this.t(key)}</span><small>${this.t('historyRecorderHelp')}</small></div>`; }

  protected render() {
    const missing = this.specs.filter(({ entity }) => !entity || entity.entry.disabled_by);
    return html`<section class="panel printer-history ${this.variant}"><div class="panel-head"><h2>${icon(this.variant === 'temperature' ? 'chart' : 'clock')} ${this.t(this.variant === 'temperature' ? 'temperatureHistory' : 'recentEvents')}</h2><button class="icon-button" aria-label=${this.t('refreshHistory')} ?disabled=${this._loading || !this.entityIds.length} @click=${() => { this.now = Date.now(); void this.load(); }}>${icon('refresh')}</button></div>
      <div class="history-meta" role="status">${this.t(this.variant === 'temperature' ? 'historyHour' : 'historyDay')} · ${this._loading ? this.t('historyRefreshing') : this._end ? `${this.t('historyAsOf')} ${this.time(this._end)}` : this.t('notLoaded')}</div>
      ${this._error ? html`<div class="history-error" role="alert"><b>${this.t('historyReadError')}</b><span>${this._error}</span><small>${this.t('historyRecorderHelp')}</small><button class="button small" ?disabled=${this._loading} @click=${() => { this.now = Date.now(); void this.load(); }}>${this.t('retry')}</button></div>` : nothing}
      ${missing.length ? html`<p class="panel-note">${this.t('historyMissingEntities')}: ${missing.map((spec) => `${spec.key} (${this.t(entityAvailability(spec.entity) === 'disabled' ? 'disabled' : 'unsupported')})`).join(', ')}</p>` : nothing}
      ${!this.entityIds.length ? this.empty('historyUnsupported') : this._records ? (this.variant === 'temperature' ? this.temperatures() : this.events()) : !this._error ? html`<div class="history-empty">${this.t('loading')}</div>` : nothing}
      ${this._error && this._records ? html`<p class="panel-note">${this.t('historyRetainedData')} ${this.time(this._end, true)}</p>` : nothing}
    </section>`;
  }
}

customElements.define('bambu-printer-history', BambuPrinterHistory);
