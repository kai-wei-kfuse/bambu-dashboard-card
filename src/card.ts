import { LitElement, html, nothing, unsafeCSS } from 'lit';
import type { PropertyValues } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { catalogFor, asError } from './ha/catalog';
import type { CatalogState } from './ha/catalog';
import type { CardConfig, HomeAssistant, Unsubscribe } from './ha/types';
import { BambuClient } from './ha/client';
import { canStart, discoverPrinters, domainOf, entityName, filamentColor, filamentRemaining, findEntity, isAvailable, numeric, parameterAttributes, scalar } from './domain/printers';
import type { AmsUnit, EntityBinding, Printer } from './domain/printers';
import { inspectProject, projectCompatibility, validatePrintOptions } from './domain/projects';
import type { CachedProject, PrintOptions, ProjectMetadata } from './domain/projects';
import { text } from './ui/i18n';
import type { Language, Message } from './ui/i18n';
import { icon, printerIllustration } from './ui/icons';
import { syncSelectValues } from './ui/select-values';
import styles from './ui/styles.css?inline';
import './ui/media';
import './ui/completion-notifications';
import './editor';

type Tab = 'overview' | 'ams' | 'files' | 'parameters';
interface PendingCommand { name: string; phase: 'request' | 'submitted'; confirmed?: (printer: Printer) => boolean }
interface StartDialog {
  kind: 'start'; printerId: string; file?: CachedProject; metadata?: ProjectMetadata;
  loading: boolean; error: string; path: string; acknowledged: boolean; options: PrintOptions;
}
type Dialog = StartDialog | { kind: 'stop'; printerId: string };

export class BambuDashboardCard extends LitElement {
  static properties = {
    _config: { state: true }, _catalogState: { state: true }, _selected: { state: true },
    _tab: { state: true }, _search: { state: true }, _error: { state: true }, _notice: { state: true },
    _files: { state: true }, _filesError: { state: true }, _filesLoading: { state: true },
    _dialog: { state: true }, _pending: { state: true }, _transfer: { state: true },
  };
  static styles = unsafeCSS(styles);
  private _hass?: HomeAssistant;
  private _config: CardConfig = { type: 'custom:bambu-dashboard-card', discovery: 'auto' };
  private _catalogState: CatalogState = { loading: true };
  private _selected: string | null = null;
  private _tab: Tab = 'overview';
  private _search = '';
  private _error = '';
  private _notice = '';
  private _files?: CachedProject[];
  private _filesError = '';
  private _filesLoading = false;
  private _dialog?: Dialog;
  private _pending = new Map<string, PendingCommand>();
  private _transfer = '';
  private unsubscribe?: Unsubscribe;
  private connection?: object;
  private dialogGeneration = 0;
  private downloadUrl?: string;

  set hass(value: HomeAssistant) {
    const previous = this._hass;
    this._hass = value;
    if (this.isConnected) this.attachCatalog();
    this.requestUpdate('hass', previous);
  }
  get hass(): HomeAssistant | undefined { return this._hass; }

  setConfig(config: CardConfig): void {
    if (!config || (config.discovery === 'selected' && !Array.isArray(config.devices))) {
      throw new Error('Selected discovery requires a devices array.');
    }
    this._config = { ...config };
  }

  static getConfigElement(): HTMLElement { return document.createElement('bambu-dashboard-card-editor'); }
  static getStubConfig(): CardConfig { return { type: 'custom:bambu-dashboard-card', discovery: 'auto' }; }
  getCardSize(): number { return 12; }
  getGridOptions() { return { columns: 'full', min_columns: 6 }; }

  connectedCallback(): void {
    super.connectedCallback();
    this.attachCatalog();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.connection = undefined;
    if (this.downloadUrl) URL.revokeObjectURL(this.downloadUrl);
  }

  private attachCatalog(): void {
    if (!this._hass || this.connection === this._hass.connection) return;
    this.unsubscribe?.();
    this.connection = this._hass.connection;
    this.unsubscribe = catalogFor(this._hass).subscribe((state) => { this._catalogState = state; });
  }

  private get language(): Language {
    if (this._config.language && this._config.language !== 'auto') return this._config.language;
    return this._hass?.language.startsWith('zh') ? 'zh' : 'en';
  }
  private t(key: Message): string { return text(this.language, key); }
  private get printers(): Printer[] {
    return this._catalogState.snapshot && this._hass ? discoverPrinters(this._catalogState.snapshot, this._hass, this._config) : [];
  }
  private get currentPrinters(): Printer[] { return this.printers.filter((printer) => !this._selected || printer.id === this._selected); }
  private get client(): BambuClient {
    if (!this._hass) throw new Error('Home Assistant is not connected.');
    return new BambuClient(this._hass);
  }
  private target(id: string): Printer {
    const registered = this._catalogState.snapshot && this._hass
      ? discoverPrinters(this._catalogState.snapshot, this._hass, { type: this._config.type, discovery: 'auto' }) : [];
    const printer = registered.find((candidate) => candidate.id === id);
    if (!printer) throw new Error('The target printer is no longer registered.');
    return printer;
  }

  protected willUpdate(changes: PropertyValues): void {
    if (!changes.has('hass') && !changes.has('_catalogState')) return;
    const printers = this.printers;
    const registered = this._catalogState.snapshot && this._hass
      ? discoverPrinters(this._catalogState.snapshot, this._hass, { type: this._config.type, discovery: 'auto' }) : [];
    if (this._selected && !printers.some((printer) => printer.id === this._selected) && this._catalogState.snapshot) this._selected = null;
    for (const [id, command] of this._pending) {
      const printer = registered.find((candidate) => candidate.id === id);
      if (!printer && this._catalogState.snapshot && !this._catalogState.loading && !this._catalogState.error) {
        this.clearPending(id);
        this._error = `${command.name}: target device was removed; the command outcome is unknown.`;
        continue;
      }
      if (printer && command.phase === 'submitted' && command.confirmed?.(printer)) {
        this._pending = new Map(this._pending);
        this._pending.delete(id);
        this._notice = `${printer.name} · ${this.t('confirmed')}`;
      }
    }
  }

  protected updated(): void { syncSelectValues(this.renderRoot); }

  private value(entity?: EntityBinding): string {
    if (!entity) return this.t('unsupported');
    if (entity.entry.disabled_by) return this.t('disabled');
    if (!entity.state) return this.t('notLoaded');
    if (entity.state.state === 'unavailable') return this.t('unavailable');
    if (entity.state.state === 'unknown') return this.t('unknown');
    const unit = entity.state.attributes.unit_of_measurement;
    return `${entity.state.state}${unit ? ` ${String(unit)}` : ''}`;
  }
  private sensor(printer: Printer, key: string): string { return this.value(findEntity(printer.entities, key)); }
  private status(printer: Printer): string {
    const known: Record<string, Message> = { idle: 'idle', running: 'running', pause: 'pause', prepare: 'prepare', finish: 'finish', failed: 'failed', offline: 'offline', unavailable: 'unavailable', unknown: 'unknown' };
    return known[printer.status] ? this.t(known[printer.status]) : printer.status;
  }
  private statusBadge(printer: Printer) {
    return html`<span class="status ${printer.status}"><span class="dot ${printer.status}"></span>${this.status(printer)}</span>`;
  }
  private selectPrinter(id: string | null): void { this._selected = id; this._search = ''; }
  private setTab(tab: Tab): void {
    this._tab = tab;
    if (tab === 'files' && !this._files && !this._filesLoading) void this.loadFiles();
  }
  private progress(printer: Printer) {
    const valid = printer.progress !== null && printer.progress >= 0 && printer.progress <= 100;
    return html`<div class="progress-label"><span>${this.t('progress')}</span><strong>${printer.progress === null ? '—' : `${printer.progress}%`}</strong></div>
      <div class="progress-track" role="progressbar" aria-label=${this.t('progress')} aria-valuenow=${valid ? printer.progress! : nothing} style=${`--progress:${valid ? printer.progress : 0}%`}><div class="progress-fill"></div></div>`;
  }

  private async runAction(printerId: string, name: string, action: (printer: Printer) => Promise<void>, confirmed: (printer: Printer) => boolean): Promise<void> {
    if (this._pending.has(printerId)) return;
    this._error = '';
    this._pending = new Map(this._pending).set(printerId, { name, phase: 'request' });
    try {
      await action(this.target(printerId));
      const printer = this.target(printerId);
      if (confirmed(printer)) {
        this.clearPending(printerId);
        this._notice = `${printer.name} · ${this.t('confirmed')}`;
      } else {
        this._pending = new Map(this._pending).set(printerId, { name, phase: 'submitted', confirmed });
      }
    } catch (error) {
      this.clearPending(printerId);
      this._error = `${name}: ${asError(error).message}`;
    }
  }
  private clearPending(id: string): void { this._pending = new Map(this._pending); this._pending.delete(id); }
  private press(printer: Printer, action: 'pause' | 'resume' | 'stop'): void {
    if (action === 'stop') { this._dialog = { kind: 'stop', printerId: printer.id }; return; }
    void this.runAction(printer.id, `${printer.name} · ${action}`, (target) => this.client.press(target, action), (target) => target.status === (action === 'pause' ? 'pause' : 'running'));
  }

  private async loadFiles(): Promise<void> {
    this._filesLoading = true;
    this._filesError = '';
    try { this._files = await this.client.files(); }
    catch (error) { this._filesError = asError(error).message; }
    finally { this._filesLoading = false; }
  }
  private async download(file: CachedProject): Promise<void> {
    try {
      const bytes = await this.client.fileBytes(file.path);
      if (this.downloadUrl) URL.revokeObjectURL(this.downloadUrl);
      this.downloadUrl = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/octet-stream' }));
      const anchor = document.createElement('a');
      anchor.href = this.downloadUrl;
      anchor.download = file.filename;
      anchor.click();
    } catch (error) { this._error = asError(error).message; }
  }
  private async openStart(printer: Printer, file?: CachedProject): Promise<void> {
    const generation = ++this.dialogGeneration;
    this._transfer = '';
    this._dialog = {
      kind: 'start', printerId: printer.id, file, loading: Boolean(file), error: '', path: '', acknowledged: false,
      options: { plate: 1, timelapse: false, bedLeveling: true, flowCalibration: true, vibrationCalibration: true, useAms: false, amsMapping: '' },
    };
    if (!file) return;
    try {
      const metadata = inspectProject(await this.client.fileBytes(file.path));
      if (generation !== this.dialogGeneration || this._dialog?.kind !== 'start') return;
      this._dialog = { ...this._dialog, metadata, loading: false, options: { ...this._dialog.options, plate: metadata.plates[0].id } };
    } catch (error) {
      if (generation === this.dialogGeneration && this._dialog?.kind === 'start') this._dialog = { ...this._dialog, loading: false, error: asError(error).message };
    }
  }
  private updateOptions(patch: Partial<PrintOptions>): void {
    if (this._dialog?.kind === 'start') this._dialog = { ...this._dialog, error: '', options: { ...this._dialog.options, ...patch } };
  }
  private closeDialog(): void { this.dialogGeneration++; this._dialog = undefined; }

  private async confirmStart(): Promise<void> {
    const dialog = this._dialog;
    if (dialog?.kind !== 'start') return;
    const id = dialog.printerId;
    const printer = this.target(id);
    try {
      validatePrintOptions(dialog.options, dialog.metadata?.plates);
      if (dialog.file) {
        if (!dialog.metadata) throw new Error('Project metadata has not been verified.');
        const errors = projectCompatibility(dialog.metadata, printer.model, numeric(findEntity(printer.entities, 'nozzle_diameter')));
        if (errors.length) throw new Error(errors.join(' '));
      } else if (!dialog.acknowledged) throw new Error(this.t('manualConfirm'));
      if (dialog.options.useAms && !printer.ams.some((unit) => !unit.external)) throw new Error('No AMS is registered for this printer.');
    } catch (error) {
      this._dialog = { ...dialog, error: asError(error).message };
      return;
    }
    await this.runAction(id, `${printer.name} · ${this.t('start')}`, async () => {
      const path = dialog.file ? await this.client.ensureFile(this.target(id), dialog.file, (progress) => {
        this._transfer = `${this.t('transferring')} ${progress.sent.toLocaleString()} / ${progress.total.toLocaleString()} B`;
      }) : dialog.path;
      await this.client.start(this.target(id), path, dialog.options);
      this.closeDialog();
    }, (target) => ['prepare', 'running'].includes(target.status));
  }

  protected render() {
    const printers = this.printers;
    const active = printers.find((printer) => printer.id === this._selected);
    return html`<div class="shell">
      <header class="topbar"><div class="brand"><span class="brand-mark">${icon('printer')}</span><div><div class="brand-title">${this._config.title || 'Bambu Dashboard'}</div><div class="brand-subtitle">HOME ASSISTANT · PRINT WORKSPACE</div></div></div>
      <div class="top-actions"><span class="connection"><span class="dot ${this._catalogState.error ? 'failed' : 'ready'}"></span>ha-bambulab</span><button class="icon-button" aria-label=${this.t('refresh')} @click=${() => this._hass && void catalogFor(this._hass).refresh()}>${icon('refresh')}</button></div></header>
      <div class="workspace">${this.renderSidebar(printers)}<main class="main">
        <div class="mobile-picker"><select aria-label=${this.t('printers')} data-value=${this._selected || ''} @change=${(event: Event) => this.selectPrinter((event.target as HTMLSelectElement).value || null)}><option value="">${this.t('allPrinters')}</option>${printers.map((printer) => html`<option value=${printer.id}>${printer.name}</option>`)}</select></div>
        <div class="page-heading"><div><div class="eyebrow">${active ? active.model : 'YOUR PRINT FARM'}</div><h1>${active?.name || this.t('workspace')}</h1><p class="description">${active ? `${this.status(active)} · ${this.value(active.stage)}` : this.t('subtitle')}</p></div>
        <div class="stats"><span class="stat"><b>${printers.length}</b>${this.t('printers')}</span><span class="stat"><b>${printers.filter((printer) => printer.status === 'running').length}</b>${this.t('printing')}</span></div></div>
        ${this.renderBanners()}
        ${this._catalogState.error ? html`<div class="banner error">${icon('alert')}<div>${this.t('registryError')}: ${this._catalogState.error.message}</div></div>` : nothing}
        <nav class="tabs" aria-label="Workspace">${(['overview', 'ams', 'files', 'parameters'] as Tab[]).map((tab, index) => html`<button class=${this._tab === tab ? 'active' : ''} @click=${() => this.setTab(tab)}>${icon(['grid', 'spool', 'folder', 'tune'][index])}${this.t(tab)}</button>`)}</nav>
        ${this._catalogState.loading && !this._catalogState.snapshot ? this.renderEmpty('refresh', this.t('discover')) : !printers.length ? this.renderEmpty('printer', this.t('noPrinters')) : this.renderContent(active)}
      </main></div></div>${this.renderDialog()}`;
  }

  private renderSidebar(printers: Printer[]) {
    return html`<aside class="sidebar"><div class="sidebar-label">WORKSPACE</div><button class=${!this._selected ? 'selected' : ''} @click=${() => this.selectPrinter(null)}>${icon('grid')}${this.t('allPrinters')}</button><div class="sidebar-rule"></div><div class="sidebar-label">${this.t('printers')}</div>
      ${repeat(printers, (printer) => printer.id, (printer) => html`<button class="printer-link ${this._selected === printer.id ? 'selected' : ''}" @click=${() => this.selectPrinter(printer.id)}>${icon('printer')}<span class="name">${printer.name}<small class="model">${printer.model}</small></span><span class="dot ${printer.status}"></span></button>`)}
      <div class="sidebar-foot">Bambu Dashboard Card<br>v0.1 · Community project</div></aside>`;
  }
  private renderBanners() {
    return html`${this._error ? html`<div class="banner error" role="alert">${icon('alert')}<div class="copy">${this._error}</div><button class="icon-button" aria-label=${this.t('close')} @click=${() => { this._error = ''; }}>${icon('close')}</button></div>` : nothing}
      ${this._notice ? html`<div class="banner notice" role="status">${icon('check')}<div class="copy">${this._notice}</div><button class="icon-button" aria-label=${this.t('close')} @click=${() => { this._notice = ''; }}>${icon('close')}</button></div>` : nothing}
      ${[...this._pending].map(([id, command]) => html`<div class="banner notice" role="status">${icon('clock')}<div class="copy"><b>${command.name}</b><br>${command.phase === 'request' ? this._transfer || this.t('loading') : this.t('submitted')}</div>${command.phase === 'submitted' ? html`<button class="button small" @click=${() => this.clearPending(id)}>${this.t('dismiss')}</button>` : nothing}</div>`)}`;
  }
  private renderEmpty(name: string, message: string) { return html`<div class="panel empty">${icon(name)}<p>${message}</p></div>`; }
  private renderContent(active?: Printer) {
    if (this._tab === 'files') return this.renderFiles();
    if (this._tab === 'parameters') return this.renderParameters();
    if (this._tab === 'ams') return html`${this.currentPrinters.map((printer) => this.renderAms(printer, true))}`;
    return active ? this.renderDetail(active) : html`<div class="printer-grid">${repeat(this.printers, (printer) => printer.id, (printer) => this.renderTile(printer))}</div>`;
  }
  private renderTile(printer: Printer) {
    const task = scalar(findEntity(printer.entities, 'subtask_name'));
    return html`<article class="panel printer-card"><button class="card-heading" @click=${() => this.selectPrinter(printer.id)}><span class="machine-badge">${icon('printer')}</span><span class="heading-copy"><b>${printer.name}</b><small>${printer.model}</small></span>${this.statusBadge(printer)}</button>
      <div class="tile-media"><div class="preview" aria-label=${this.t('camera')}>${printerIllustration()}${printer.camera && isAvailable(printer.camera) ? html`<bambu-dashboard-camera .hass=${this._hass} .entity=${printer.camera.entry.entity_id}></bambu-dashboard-camera>` : nothing}<span class="preview-caption">${printer.camera ? this.t('camera') : this.t('unsupported')}</span></div>
      <div class="project-preview" aria-label=${this.t('projectPreview')}>${printer.cover && scalar(printer.cover) ? html`<bambu-dashboard-file-image .hass=${this._hass} .entity=${printer.cover.entry.entity_id} .version=${scalar(printer.cover) || ''}></bambu-dashboard-file-image>` : html`<div class="preview-empty">${icon('folder')}<span>${this.t('noProjectPreview')}</span></div>`}<span class="preview-caption">${this.t('projectPreview')}</span></div></div>
      <div class="tile-content"><div class="task-line">${icon('folder')}<span>${task || this.t('noTask')}</span></div>${this.progress(printer)}<div class="tile-metrics"><div><span>${this.t('remaining')}</span><strong>${this.sensor(printer, 'remaining_time')}</strong></div><div><span>${this.t('nozzle')}</span><strong>${this.sensor(printer, 'nozzle_temp')}</strong></div><div><span>${this.t('bed')}</span><strong>${this.sensor(printer, 'bed_temp')}</strong></div></div>
      <div class="tile-footer"><div class="filament-dots">${printer.ams.flatMap((unit) => unit.slots).map(({ entity }) => html`<span title=${entityName(entity)} class="filament-dot ${entity.state?.attributes.active ? 'active' : ''}" style=${`--filament:${filamentColor(entity.state?.attributes.color) || 'transparent'}`}></span>`)}</div><button class="button small" @click=${() => this.selectPrinter(printer.id)}>${this.t('details')}${icon('arrow')}</button></div></div></article>`;
  }

  private renderDetail(printer: Printer) {
    return html`<div class="detail-grid"><section class="panel"><div class="panel-head"><h2>${icon('camera')} ${this.t('camera')}</h2><span class="description">${printer.camera && (Number(printer.camera.state?.attributes.supported_features) & 2) ? this.t('live') : this.t('snapshot')}</span></div><div class="camera-large">${printer.camera ? html`<bambu-dashboard-camera .hass=${this._hass} .entity=${printer.camera.entry.entity_id}></bambu-dashboard-camera>` : html`${printerIllustration()}<span class="preview-caption">${this.t('unsupported')}</span>`}</div></section>
      <section class="panel"><div class="panel-head"><h2>${this.t('controls')}</h2>${this.statusBadge(printer)}</div><div class="panel-body"><div class="job-top">${printer.cover && scalar(printer.cover) ? html`<div class="job-cover"><bambu-dashboard-file-image .hass=${this._hass} .entity=${printer.cover.entry.entity_id} .version=${scalar(printer.cover) || ''}></bambu-dashboard-file-image></div>` : nothing}<div><div class="eyebrow">${this.t('task')}</div><div class="job-name">${scalar(findEntity(printer.entities, 'subtask_name')) || this.t('noTask')}</div></div></div>${this.progress(printer)}<div class="job-summary"><div><span>${this.t('remaining')}</span><b>${this.sensor(printer, 'remaining_time')}</b></div><div><span>${this.t('layers')}</span><b>${this.sensor(printer, 'current_layer')} / ${this.sensor(printer, 'total_layers')}</b></div></div>${this.renderControls(printer)}</div></section></div>
      <bambu-completion-notifications .hass=${this._hass} .printer=${printer} .registry=${this._catalogState.snapshot} .language=${this.language}></bambu-completion-notifications>
      <div class="metric-grid">${[['nozzle', 'nozzle_temp', 'target_nozzle_temp'], ['bed', 'bed_temp', 'target_bed_temp'], ['fan', 'cooling_fan_speed', ''], ['weight', 'print_weight', ''], ['length', 'print_length', '']].map(([label, key, target]) => html`<div class="panel metric"><div class="metric-top">${icon(label === 'nozzle' || label === 'bed' ? 'heat' : 'tune')}${this.t(label as Message)}</div><strong>${this.sensor(printer, key)}</strong>${target ? html`<small>→ ${this.sensor(printer, target)}</small>` : nothing}</div>`)}</div>${this.renderAms(printer, false)}`;
  }
  private renderControls(printer: Printer) {
    const busy = this._pending.has(printer.id);
    const speedOptions = printer.speed?.state?.attributes.options;
    return html`<button class="button primary" style="width:100%" ?disabled=${!canStart(printer) || busy} @click=${() => void this.openStart(printer)}>${icon('play')}${this.t('start')}</button><div class="control-row"><button class="button" ?disabled=${busy || !(printer.status === 'running' ? isAvailable(printer.pause) : printer.status === 'pause' && isAvailable(printer.resume))} @click=${() => this.press(printer, printer.status === 'pause' ? 'resume' : 'pause')}>${icon(printer.status === 'pause' ? 'play' : 'pause')}${this.t(printer.status === 'pause' ? 'resumeAction' : 'pauseAction')}</button><button class="button danger" ?disabled=${busy || !['running', 'pause'].includes(printer.status) || !isAvailable(printer.stop)} @click=${() => this.press(printer, 'stop')}>${icon('stop')}${this.t('stopAction')}</button></div>
      <div class="control-divider"></div><label class="field"><span>${this.t('speed')}</span><select data-value=${scalar(printer.speed) || ''} ?disabled=${busy || printer.status !== 'running' || !isAvailable(printer.speed)} @change=${(event: Event) => { const option = (event.target as HTMLSelectElement).value; void this.runAction(printer.id, `${printer.name} · ${this.t('speed')}`, (target) => this.client.speed(target, option), (target) => scalar(target.speed) === option); }}><option value="" disabled>${this.value(printer.speed)}</option>${Array.isArray(speedOptions) ? speedOptions.map((option) => html`<option value=${String(option)}>${String(option)}</option>`) : nothing}</select></label><div class="helper">${this.t('speedHelp')}</div>
      <div class="control-divider"></div><div class="light-control"><span>${icon('light')} ${this.t('light')}</span><button class="button small ${scalar(printer.light) === 'on' ? 'on' : ''}" ?disabled=${busy || !isAvailable(printer.light) || !['on', 'off'].includes(scalar(printer.light) || '')} @click=${() => { const expected = scalar(printer.light) === 'on' ? 'off' : 'on'; void this.runAction(printer.id, `${printer.name} · ${this.t('light')}`, (target) => this.client.light(target), (target) => scalar(target.light) === expected); }}>${scalar(printer.light) === 'on' ? this.t('on') : scalar(printer.light) === 'off' ? this.t('off') : this.value(printer.light)}</button></div><div class="helper">${this.t('lightHelp')}</div>`;
  }

  private renderAms(printer: Printer, showName: boolean) {
    if (!printer.ams.length) return html`<div class="ams-section">${this.renderEmpty('spool', `${showName ? `${printer.name} · ` : ''}${this.t('noAms')}`)}</div>`;
    return html`${printer.ams.map((unit) => this.renderAmsUnit(printer, unit, showName))}`;
  }
  private renderAmsUnit(printer: Printer, unit: AmsUnit, showName: boolean) {
    const humidity = findEntity(unit.entities, 'humidity');
    const temperature = findEntity(unit.entities, 'ams_temp');
    return html`<section class="panel ams-section"><div class="panel-head"><h2>${icon('spool')} ${showName ? `${printer.name} · ` : ''}${unit.external ? this.t('external') : unit.device.name_by_user || unit.device.model}</h2><span class="description">${unit.slots.length} ${unit.external ? '' : 'slots'}</span></div><div class="ams-grid">${unit.slots.map(({ index, entity }) => {
      const attributes = entity.state?.attributes || {};
      const remain = filamentRemaining(entity);
      return html`<div class="spool ${attributes.active === true ? 'active' : ''}" style=${`--filament:${filamentColor(attributes.color) || 'var(--bd-raised)'}`}><div class="spool-index">${unit.external ? this.t('external') : `SLOT ${String(index).padStart(2, '0')}`}</div>${attributes.active === true ? html`<span class="active-label">● ${this.t('active')}</span>` : nothing}<div class="spool-visual"></div><h3>${attributes.empty === true ? this.t('empty') : this.value(entity)}</h3><div class="material">${typeof attributes.type === 'string' ? attributes.type : '—'} ${filamentColor(attributes.color) || ''}</div><div class="remain">${remain === null ? this.t('remainingUnknown') : `${remain}%`}</div></div>`;
    })}</div>${humidity || temperature ? html`<div class="ams-extra">${humidity ? html`<span>${this.t('humidity')}: ${this.value(humidity)}</span>` : nothing}${temperature ? html`<span>${this.t('temperature')}: ${this.value(temperature)}</span>` : nothing}</div>` : nothing}</section>`;
  }

  private renderFiles() {
    const files = this._files?.filter((file) => !this._selected || file.printer_device_id === this._selected);
    return html`<div class="section-heading"><div><h2>${this.t('cachedFiles')}</h2><p class="description">${this.t('cacheHelp')}</p></div><button class="button small" ?disabled=${this._filesLoading} @click=${() => void this.loadFiles()}>${icon('refresh')}${this.t('refresh')}</button></div>
      ${this._filesError ? html`<div class="banner error" style="margin-top:18px" role="alert">${icon('alert')}<div>${this._filesError}</div></div>` : nothing}
      ${this._filesLoading ? this.renderEmpty('refresh', this.t('loading')) : files?.length ? html`<section class="panel file-list">${files.map((file) => {
        const owner = this.printers.find((candidate) => candidate.id === (this._selected || file.printer_device_id));
        const printer = owner && canStart(owner) ? owner : this.printers.find((candidate) => canStart(candidate) && !this._pending.has(candidate.id));
        return html`<div class="file-row"><div class="file-preview">${file.thumbnail_path ? html`<bambu-dashboard-file-image .hass=${this._hass} .path=${file.thumbnail_path}></bambu-dashboard-file-image>` : icon('folder')}</div><div><div class="file-title">${file.filename}</div><div class="file-meta"><span>${file.printer_name}</span><span>${file.size_human || `${file.size.toLocaleString()} B`}</span><span>${this.date(file.modified)}</span></div></div><div class="file-actions"><button class="icon-button" aria-label=${this.t('download')} @click=${() => void this.download(file)}>${icon('download')}</button><button class="button small" ?disabled=${!printer || !canStart(printer) || this._pending.has(printer.id)} @click=${() => printer && void this.openStart(printer, file)}>${icon('play')}${this.t('printAgain')}</button></div></div>`;
      })}</section>` : !this._filesError ? this.renderEmpty('folder', this.t('noFiles')) : nothing}`;
  }
  private date(value?: string): string {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return new Intl.DateTimeFormat(this.language, { dateStyle: 'medium', timeStyle: 'short', timeZone: this._hass?.config?.time_zone }).format(parsed);
  }
  private renderParameters() {
    const query = this._search.toLocaleLowerCase();
    const rows = this.currentPrinters.flatMap((printer) => printer.allEntities.map((entity) => ({ printer, entity })))
      .filter(({ printer, entity }) => `${printer.name} ${entityName(entity)} ${entity.entry.entity_id} ${entity.state?.state || ''}`.toLocaleLowerCase().includes(query));
    return html`<div class="section-heading"><div><h2>${this.t('parameters')}</h2><p class="description">${rows.length} entities · ha-bambulab</p></div></div><label class="search-box">${icon('search')}<input aria-label=${this.t('search')} placeholder=${this.t('search')} .value=${this._search} @input=${(event: Event) => { this._search = (event.target as HTMLInputElement).value; }}/></label>
      ${rows.length ? html`<section class="panel" style="overflow-x:auto"><table class="parameter-table"><thead><tr><th>${this.t('entity')}</th><th>${this.t('value')}</th><th>${this.t('details')}</th></tr></thead><tbody>${repeat(rows, ({ entity }) => entity.entry.entity_id, ({ printer, entity }) => html`<tr><td><div class="entity-name">${entityName(entity)}</div><div class="entity-id">${printer.name} · ${domainOf(entity.entry.entity_id)}</div></td><td><span class="entity-value">${this.value(entity)}</span></td><td><details><summary>${this.t('attributes')}</summary><div class="entity-id">${entity.entry.entity_id}</div><dl class="attribute-grid"><dt>${this.t('updated')}</dt><dd>${this.date(entity.state?.last_updated)}</dd>${Object.entries(parameterAttributes(entity)).map(([key, value]) => html`<dt>${key}</dt><dd>${typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</dd>`)}</dl><button class="button small" @click=${() => this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: entity.entry.entity_id }, bubbles: true, composed: true }))}>${this.t('details')}</button></details></td></tr>`)}</tbody></table></section>` : this.renderEmpty('search', this.t('noParameters'))}`;
  }

  private renderDialog() {
    const dialog = this._dialog;
    if (!dialog) return nothing;
    const printer = this.printers.find((candidate) => candidate.id === dialog.printerId);
    if (!printer) return html`<div class="overlay"><section class="dialog" role="dialog" aria-modal="true"><div class="dialog-body">The target printer was removed.</div><div class="dialog-footer"><button class="button" @click=${() => this.closeDialog()}>${this.t('close')}</button></div></section></div>`;
    const busy = this._pending.has(printer.id);
    const incompatible = dialog.kind === 'start' && dialog.metadata ? projectCompatibility(dialog.metadata, printer.model, numeric(findEntity(printer.entities, 'nozzle_diameter'))).length > 0 : false;
    return html`<div class="overlay" @keydown=${(event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) this.closeDialog(); }}><section class="dialog" role="dialog" aria-modal="true" aria-label=${this.t(dialog.kind === 'stop' ? 'stopAction' : 'start')}><div class="panel-head"><h2>${this.t(dialog.kind === 'stop' ? 'stopAction' : 'start')}</h2><button class="icon-button" ?disabled=${busy} aria-label=${this.t('close')} @click=${() => this.closeDialog()}>${icon('close')}</button></div><div class="dialog-body"><div class="dialog-target"><div><span>${this.t('target')}</span><b>${printer.name}</b></div><div><span>${printer.model}</span><b>${this.sensor(printer, 'nozzle_diameter')}</b></div></div>
      ${dialog.kind === 'stop' ? html`<p>${this.t('stopHelp')}</p>` : this.renderStartFields(printer, dialog, busy)}</div><div class="dialog-footer"><button class="button" ?disabled=${busy} @click=${() => this.closeDialog()}>${this.t('cancel')}</button>${dialog.kind === 'stop' ? html`<button class="button danger" ?disabled=${busy} @click=${() => { this.closeDialog(); void this.runAction(printer.id, `${printer.name} · ${this.t('stopAction')}`, (target) => this.client.press(target, 'stop'), (target) => ['idle', 'finish', 'failed'].includes(target.status)); }}>${this.t('stopAction')}</button>` : html`<button class="button primary" ?disabled=${busy || incompatible || dialog.loading || Boolean(dialog.file && (!dialog.metadata || dialog.error)) || !canStart(printer)} @click=${() => void this.confirmStart()}>${icon('play')}${this.t('confirmStart')}</button>`}</div></section></div>`;
  }
  private renderStartFields(printer: Printer, dialog: StartDialog, busy: boolean) {
    if (dialog.loading) return html`<p>${this.t('checking')}</p>`;
    const compatibility = dialog.metadata ? projectCompatibility(dialog.metadata, printer.model, numeric(findEntity(printer.entities, 'nozzle_diameter'))) : [];
    return html`<label class="field"><span>${this.t('target')}</span><select aria-label=${this.t('target')} data-value=${printer.id} ?disabled=${busy} @change=${(event: Event) => { this._dialog = { ...dialog, printerId: (event.target as HTMLSelectElement).value, error: '', acknowledged: false, options: { ...dialog.options, useAms: false, amsMapping: '' } }; }}>${this.printers.map((target) => html`<option value=${target.id} ?disabled=${!canStart(target) || this._pending.has(target.id)}>${target.name} · ${target.model}</option>`)}</select></label>
      ${dialog.error ? html`<div class="banner error" role="alert">${dialog.error}</div>` : nothing}${compatibility.length ? html`<div class="banner error">${compatibility.join(' ')}</div>` : nothing}
      ${dialog.file ? html`<div class="field"><span>${this.t('task')}</span><b>${dialog.file.filename}</b></div>` : html`<label class="field"><span>${this.t('sdPath')}</span><input placeholder="cache/project.3mf" .value=${dialog.path} ?disabled=${busy} @input=${(event: Event) => { this._dialog = { ...dialog, path: (event.target as HTMLInputElement).value }; }}/></label><label class="check"><input type="checkbox" .checked=${dialog.acknowledged} ?disabled=${busy} @change=${(event: Event) => { this._dialog = { ...dialog, acknowledged: (event.target as HTMLInputElement).checked }; }}/>${this.t('manualConfirm')}</label>`}
      <label class="field"><span>${this.t('plate')}</span>${dialog.metadata ? html`<select data-value=${String(dialog.options.plate)} ?disabled=${busy} @change=${(event: Event) => this.updateOptions({ plate: Number((event.target as HTMLSelectElement).value) })}>${dialog.metadata.plates.map((plate) => html`<option value=${plate.id}>${plate.id} · ${plate.name}</option>`)}</select>` : html`<input type="number" min="1" max="100" .value=${String(dialog.options.plate)} ?disabled=${busy} @input=${(event: Event) => this.updateOptions({ plate: Number((event.target as HTMLInputElement).value) })}/>`}</label>
      <div class="two-fields">${([['bedLeveling', 'bedLevel'], ['timelapse', 'timelapse'], ['flowCalibration', 'flowCali'], ['vibrationCalibration', 'vibrationCali']] as [keyof PrintOptions, Message][]).map(([key, label]) => html`<label class="check"><input type="checkbox" .checked=${Boolean(dialog.options[key])} ?disabled=${busy} @change=${(event: Event) => this.updateOptions({ [key]: (event.target as HTMLInputElement).checked })}/>${this.t(label)}</label>`)}</div>
      ${printer.ams.some((unit) => !unit.external) ? html`<div class="control-divider"></div><label class="check"><input type="checkbox" .checked=${dialog.options.useAms} ?disabled=${busy} @change=${(event: Event) => this.updateOptions({ useAms: (event.target as HTMLInputElement).checked })}/>${this.t('useAms')}</label>${dialog.options.useAms ? html`<label class="field"><span>${this.t('mapping')}</span><input placeholder="0,1,2" .value=${dialog.options.amsMapping} ?disabled=${busy} @input=${(event: Event) => this.updateOptions({ amsMapping: (event.target as HTMLInputElement).value })}/></label><p class="helper">${this.t('mappingHelp')}</p>` : nothing}` : nothing}
      <div class="control-divider"></div><p class="helper">${this.t('startHelp')}</p>${this._transfer ? html`<p class="progress-caption">${this._transfer}</p>` : nothing}`;
  }
}

customElements.define('bambu-dashboard-card', BambuDashboardCard);
window.customCards = window.customCards || [];
window.customCards.push({ type: 'bambu-dashboard-card', name: 'Bambu Dashboard', preview: true, description: 'Complete multi-printer workspace for ha-bambulab.' });
console.info('%c BAMBU DASHBOARD %c 0.1.0 ', 'background:#28bb8b;color:#08291f;font-weight:bold;padding:4px', 'background:#15201b;color:#cfe9de;padding:4px');
