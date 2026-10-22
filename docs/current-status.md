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
