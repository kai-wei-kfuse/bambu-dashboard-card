# Bambu Dashboard Card

A complete multi-printer dashboard for Home Assistant, built with TypeScript and Lit and powered by the existing [ha-bambulab](https://github.com/greghesp/ha-bambulab) integration.

**Current release: [v0.1.0](https://github.com/kai-wei-kfuse/bambu-dashboard-card/releases/tag/v0.1.0)** — the first public milestone for early use and feedback. Tested with HA 2026.10.2 and ha-bambulab 2.2.26 on A1 / AMS Lite. Physical printer controls, real external-camera playback and broader models still need validation.

[简体中文](README.zh-CN.md) · [Install with HACS](https://my.home-assistant.io/redirect/hacs_repository/?owner=kai-wei-kfuse&repository=bambu-dashboard-card&category=plugin) · [Report an issue](https://github.com/kai-wei-kfuse/bambu-dashboard-card/issues/new/choose)

HACS installation currently uses a **custom repository**. Global HACS search requires separate default-store review; publishing a release does not automatically add the project there. See [installation](docs/installation.md) and [distribution status](docs/distribution.md).

![Multi-printer development preview](docs/images/overview.jpg)

The screenshot uses explicitly labeled synthetic devices and camera illustrations. It does not expose a real installation.

The deliverable includes both the custom frontend component and a complete dashboard configuration. Device discovery is dynamic; printer IDs, addresses, credentials, and a fixed printer count are not embedded in the source.

## Implemented initial version

- Multi-printer overview and a responsive masonry detail workspace with independent camera, job, control, parameter and filament cards.
- Alert center with HMS/print-error details and official troubleshooting links; device/connection readings, translated task stages and hotend fan speed.
- Filter the overview by active jobs, faults, idle or offline status; open a printer's alerts directly, even if its alert block is hidden.
- Interactive 1/6/24-hour nozzle/bed temperature trends, series toggles and mouse/touch/keyboard readings, plus a 24-hour state-change timeline from HA History.
- Drag complete detail cards while neighboring cards make room, or use arrow buttons. Save order, visibility, collapsed defaults and normal/wide presentation independently per printer in your HA account.
- Complete entity and attribute explorer.
- Camera, light, speed, pause, resume, stop, and sliced-project printing.
- Per-printer external HA camera selection from the overview or detail, with source labels and explicit offline/missing states. Connect the camera to HA first; no direct stream credentials are stored in the card.
- AMS and external-spool visualization based on registered devices.
- Source-labeled filament color groups on overview tiles, with soft translucent card surfaces and theme-aware gradients.
- Cached project browser, downloads, metadata checks, and reprinting through the integration's authenticated APIs.
- Responsive layout, Home Assistant themes, and a visual configuration editor.
- Per-printer completion reminders backed by native HA automations, including Android alarm-stream alerts and standard notification destinations.

## Development

```sh
npm ci
npm run test
npm run typecheck
npm run build
```

The build produces `dist/bambu-dashboard-card.js`. Runtime data and commands use the Home Assistant session. There is no separate MQTT client or service to deploy.

Run `npm run dev` for a labeled, read-only development preview with synthetic data. Commands are rejected in this preview; it cannot connect to a printer.

See the [installation guide](docs/installation.md) and [complete dashboard configuration](dashboards/bambu-dashboard.yaml). Releases include the built JavaScript, dashboard YAML and SHA256 checksums. The default branch also retains a development build.

Completion reminders are configured in a printer's detail view by an HA administrator. Select a phone, choose a reminder style, enable it and save. **Test phone reminder** immediately sends one message using the current choices, without saving or enabling the automation. HA runs the reminder after the dashboard closes. Android offers alarm-style notifications and alarm speech; both use alarm audio while ordinary notification settings remain unchanged. They do not create a Clock-app alarm or continuously repeat. See [phone setup and delivery limits](docs/installation.md#completion-reminders).

## Scope and compatibility

Requires Home Assistant and ha-bambulab. Initial hardware validation targets A1 printers and AMS Lite. Support for additional models is derived from their registered entities and capabilities, with model-specific behavior documented as it is tested.

The integration's `print_history` endpoint lists **cached project files**, not a complete record of completed prints. The UI must preserve that distinction. Historical cloud task storage is outside the initial release.

Temperature trends and recent events require HA History/Recorder to record the selected printer entities. They read existing HA history; they do not create a complete print archive or change Recorder configuration. See [diagnostics and history](docs/installation.md#diagnostics-and-recorded-history) for data scope and refresh behavior.

## License

MIT. This is a community project, not an official Bambu Lab product.
