# Changelog

## 0.1.0 — 2026-10-23

First public milestone for early use. This release freezes the implemented dashboard scope; household-device automation remains a later proposal.

- Complete HA-native multi-printer dashboard with dynamic discovery, all-parameter search, visual editor and full-width dashboard YAML.
- Dense detail cards with full-card live dragging, stable edge targets, visibility, default collapse and normal/wide widths saved per HA user and printer. Legacy order-only layouts migrate on load.
- Overview status filters and diagnostic navigation, HMS/print-error details and official troubleshooting links, device/connection data and task stages.
- Interactive 1/6/24-hour nozzle/bed temperatures and 24-hour recorded state events, with explicit empty/error states, sample timestamps, series toggles and keyboard/touch inspection.
- Built-in cameras and per-printer external HA camera selection, AMS/external-spool visualization, project previews, actual reported speed and completion estimates.
- Existing integration controls, authenticated cached-project downloads and 3MF checks with explicit print targets and confirmations. Cached files are not a complete print archive.
- Native HA completion reminders, one-shot tests and Android alarm speech, independent of the open dashboard.
- Built JavaScript, complete dashboard YAML and SHA256 checksums as release assets; bilingual installation and feedback documentation.
- Validation: 145 behavior tests, TypeScript, production build and GitHub HACS validation pass. Real HA checks cover two A1 printers, AMS Lite, recorded history and desktop/narrow layouts.

Known validation gaps: physical print/light/speed controls, completion-trigger delivery during a real print, physical touchscreen interaction, real external-camera playback, clean HACS installation and additional models. Alarm speech was confirmed audible in a phone test; this does not guarantee background delivery on every phone.

### Initial development baseline — 2026-10-22

- Complete HA-native multi-printer workspace with automatic discovery and a visual editor.
- Camera, current project, temperature, progress, controls, AMS, files, and all-parameter views.
- Authenticated cached-project downloads, 3MF compatibility checks, and explicit target-specific print flows.
- Complete dashboard configuration, HACS metadata, installable build, MIT license, and bilingual documentation.
- 23 automated tests and real HA read-only smoke verification. Physical printer control testing is pending.
