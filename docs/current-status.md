# Current status

## Initial implementation

Implemented: complete multi-printer dashboard, device/entity discovery, complete parameter search, camera rendering, AMS and external spools, current-project cover, light/speed/print service integration, cached files and 3MF preflight, explicit command confirmation, and the visual editor.

## Verification — 2026-10-22

- 23 behavior tests pass, including device additions/removals, registry races, correct control targets, project compatibility, legacy paths, errors, native select state, and media lifecycle.
- TypeScript checks pass; Vite production build passes.
- A real HA 2026.10.2 installation loaded the card as a native panel dashboard.
- Two A1 printers and the associated AMS Lite/external spools were discovered.
- All 129 registered Bambu entities were displayed in the complete parameter workspace.
- Authenticated cache API returned two projects and loaded their thumbnails.
- Real cached 3MF metadata correctly identified its sliced plate number, model, and nozzle without starting a print.
- Authenticated HA project-cover images and native camera entities loaded.
- A narrow-screen check confirmed single-column layout without main-content overflow.
- No start, pause, resume, stop, speed or light command was sent to physical printers during smoke verification.

## Remaining before a stable release

Physical control verification with an operator, broader model coverage, clean HACS installation testing, and a versioned release. The GitHub default branch includes a build for development installations; it is not a claim that the hardware controls have passed physical testing.

Public screenshots contain only clearly labeled synthetic data. Real installation screenshots remain local and are not part of this repository.

## Completion reminders — 2026-10-22

Implemented in Stage 2: independent per-printer settings, explicit notification destination selection, standard messages, Android alarm-stream alerts, and authenticated management of persistent native HA automations. Completion detection runs in HA after the frontend closes. The UI distinguishes saved configuration, loaded runtime configuration, runtime switch mismatches, and errors.

- All 41 behavior tests pass (18 added), including ownership, competing edits, API failures, explicit phone targeting, Android payload, startup/reconnect exclusions, persisted disabling, late loads/saves and stale reload callbacks.
- TypeScript checks and the production build pass.
- A real HA 2026.10.2 instance discovered an existing Companion phone's dedicated notification service.
- The dashboard saved a disabled Android alarm reminder through HA's configuration API, confirmed the matching loaded automation and `off` state, and restored the setting after a full page reload.
- Another printer remained independently unconfigured.
- No phone notification, test alarm or physical printer command was sent during this verification. Actual sound delivery and phone permissions remain to be validated by a real print test.

### One-shot test button — 2026-10-22

Added **Test phone reminder** using the same destination/style payload builder as automatic reminders. It supports unsaved settings and disabled automations, blocks duplicate requests while sending, preserves backend settings, reports service errors, and ignores late results after switching printers.

The initial test-button implementation passed 47 tests. A real HA button click submitted one Android alarm-stream notification, and the user confirmed receipt without sound. The channel still did not sound after phone settings were adjusted; its cause remains unverified. The user requires ordinary notification settings to remain silent.

An explicit **Alarm speech (Android)** style now uses `message: TTS` and `media_stream: alarm_stream`, without changing phone volume or ordinary notification sounds. All 49 tests pass; type checks and production build pass. The user confirmed hearing the real speech test. The dashboard saved that style for the selected printer, confirmed the loaded automation was enabled, and reloaded the saved setting successfully. Completion-trigger verification during a real print remains separate. No printer control was sent.

## Overview media layout — 2026-10-22

Each printer tile now shows its camera on the left and its authenticated project thumbnail on the right. The detail-view thumbnail increased from 64 × 64 to 96 × 96 pixels. Project images retain their proportions and remain fully visible; a missing image has an explicit placeholder.

Existing 49 tests, TypeScript checks and the production build pass. Real HA desktop checks confirmed both cameras and both project previews load with the expected left/right geometry, and the detail thumbnail measures 96 × 96 pixels. A narrow browser check confirmed side-by-side tile media and a 96px detail thumbnail without main-content horizontal overflow. No physical printer or notification command was sent for this layout change. Real screenshots remain local.

The user subsequently requested 256 × 256 detail previews, superseding the 96px detail size. The detail header now wraps its title when needed and scales the square only below 256px of available width. The production build passes; real HA measures 256 × 256 on desktop and an equal-width/height square without main-content overflow in a narrow viewport. This CSS-only revision is covered by build and browser layout verification rather than new unit tests.

## Dense detail masonry — 2026-10-22

The paired camera/control row is superseded by independent content-sized cards for the camera, current job, controls, live metrics, each AMS/spool unit and completion reminders. A small observed Grid layout packs cards without reparenting them. The camera no longer stretches to the height of the controls. Its last frame ratio reserves space while offscreen media is unloaded, avoiding scroll jumps.

The current-job card retains its 256px square preview. Fractional-hour estimates display as hours/minutes in its summary; raw entity values remain available in the parameter view. The reminder card shows status/recipient by default, with the existing settings/test form behind an expandable disclosure. Configuration or runtime errors reveal it automatically.

- All 54 tests pass, including five new cases for masonry lifecycle, compact settings/errors and offscreen camera space. TypeScript checks and production build pass.
- Real HA desktop verification found all six cards on the active printer, a 256 × 256 preview, a camera panel matching its frame/header height, and no overlapping cards after media loaded.
- Switching to the AMS printer displayed seven cards and all five AMS/external slots.
- Expanding reminder settings triggered reflow without overlaps or backend changes.
- A two-column layout at 1280 CSS pixels and a single-column layout at 312 CSS pixels had no overlapping cards. The narrow layout had no main-content horizontal overflow and retained the camera's height after scrolling away.
- No printer control or notification action was sent during layout verification. Screenshots remain local.

## Printer identity, completion estimate and green — 2026-10-22

Primary names now come from each device's registered `printer_name` sensor, while the original HA registry name is retained as secondary identity. Titles, sidebar, tiles and pickers share this model; device IDs remain command keys. Missing/unavailable printer-name sensors retain the HA display name, as documented in ADR 004.

Both overview and detail show current time plus remaining duration under remaining time, using HA's timezone and including the date. A connected minute clock and incoming HA state refresh the calculation; it is removed when the card detaches. Paused/nonprinting/invalid values do not produce an active completion estimate. The accent is now `#00AE42`, directly verified in the official Bambu store's public page.

All 76 tests pass, including 22 new identity, unit conversion, status, midnight/timezone and clock lifecycle cases. Type checks and production build pass. Real HA verification confirmed both printer-name sensors drive labels, the HA name appears below the large detail title, computed progress color is RGB(0, 174, 66), and ETA appears below remaining time in both views. The narrow layout retained both names and ETA without horizontal overflow. No registry rename, printer command or notification configuration change was made. Real screenshots remain local.

## Overview speed percentage — 2026-10-22

Each overview tile now includes print speed as a percentage using `sensor.*_speed_profile`'s `modifier` attribute. Installed ha-bambulab code exposes the printer's `spd_mag` report there; no fixed percentage is inferred from mode names. Missing, unavailable or malformed reports remain explicit instead of becoming 100%. The four metrics wrap responsively.

All 78 tests, type checks and production build pass. Added tests preserve reported 100/124/150/55/0/166 values, reject invalid reports and verify HA-driven UI updates without commands. Real HA showed both printers reporting 100%, and a 312-CSS-pixel viewport had no main-content horizontal overflow. No speed or other physical command was sent. Screenshots remain local.
