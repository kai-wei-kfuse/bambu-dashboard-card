# Changelog

## 0.1.1 — 2026-11-23

Patch release with LAN cover preview fallback, single-printer opening view, Danish localization and updated HACS installation docs.

- LAN cover preview fallback (`#3`): fall back to the empty preview state (and hide `.job-cover` in detail view) when Home Assistant's `/api/image_proxy/<entity_id>` returns HTTP 500/404 or empty bytes before `ha-bambulab` populates a `.3mf` cover, recover automatically when a cover arrives, and keep auth (`401`/`403`) and `/api/bambu_lab/file_cache/...` errors visible.
- Single-printer opening view (`#5`): open directly to the sole printer's detail view on initial load when `printers.length === 1` without overriding subsequent manual navigation to **All printers**; add `default_device` (`'auto' | 'overview' | <device_id>`), **Opening view** in the visual editor, and localized `Your print farm` eyebrow across English, Chinese and Danish.
- Danish (`da` / `da-DK`) localization (`#4`, contributed by `@briis`): full UI and completion-reminder translations, narrow-screen `.project-preview` caption ellipsis and empty-state text wrapping, automated Danish locale and notification round-trip tests, and rebuilt distribution bundle.
- Documentation: update HACS installation instructions across `README.md`, `README.zh-CN.md`, `docs/installation.md` and `docs/distribution.md` to reflect HACS default-store inclusion ([hacs/default#12488](https://github.com/hacs/default/pull/12488)), keeping custom-repository setup as a fallback.
- Validation: 152 behavior tests across 20 files, TypeScript, production build, GitHub HACS validation, and Chromium desktop/narrow-screen preview verification pass. Note: LAN cover fallback was verified against `ha-bambulab` v2.2.26 / HA Core source behavior and synthetic tests rather than physical Bambu Lab P2S hardware (local validation hardware is A1 / AMS Lite).

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
