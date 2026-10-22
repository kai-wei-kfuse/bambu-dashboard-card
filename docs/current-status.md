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

## Soft card surfaces and filament source labels — 2026-10-23

The user's visual reference is reflected in a subtle cool-to-warm workspace gradient, translucent theme-derived card surfaces, 22px card corners, diffuse shadows and softer nested fields/chips. Bambu green remains `#00AE42`. Overview, masonry cards, AMS slots and reminder settings share the surface/radius/shadow tokens; the existing media arrangement and 256px detail preview remain intact.

Overview filament colors are grouped by each registered feeder rather than flattened across devices. Every group shows the actual AMS model, such as AMS Lite, or the localized external-spool label. A user-assigned feeder alias remains available as the group's tooltip instead of replacing its model label.

All 79 tests, TypeScript checks and production build pass. A new behavior test verifies model labeling, color counts and correct printer/source ownership. Real HA showed one printer with separate AMS Lite (four colors) and external-spool groups, and the other with its own external spool. Desktop details retained a 256px preview and had no overlapping cards. Narrow overview and detail views had no main-content horizontal overflow. No physical printer or notification action was sent; real screenshots remain local.

## Draggable detail cards — 2026-10-23

Each printer's detail overview has an explicit layout editor with pointer/touch handles, earlier/later buttons, Save, Cancel and Restore default. Card contents are inert while editing. Stable keyed wrappers keep the camera and reminder drafts intact; order changes preserve the masonry-owned row spans. HA frontend user data persists the order per authenticated user and printer. New cards append, temporarily missing feeders retain their place, and storage errors remain visible without discarding a failed save's draft.

All 94 tests, TypeScript checks and the production build pass. Fifteen added behavior cases cover schemas/API failures, capability changes, mouse/touch gestures and cancellation, stable content and measured spans, save/cancel/reset, and late loads/saves after printer switches. Real HA accepted a mouse drag, restored its saved order after reload, kept the other printer independent, and honored Cancel/default reset. Desktop dragging and keyboard sorting at 312 CSS pixels produced no overlapping cards or horizontal card overflow. The test preference was restored to default. Physical touch-device testing remains unverified; pointer touch events are covered by automated tests. No physical printer or notification action was sent. Screenshots remain local.

## Full-card dragging and live reflow — 2026-10-23

The label-only ghost and drop-only update are superseded by ADR 006. The original card now follows the pointer at its measured size and grab offset in the browser top layer. Its outer grid item retains a same-size placeholder while the existing editor draft updates during movement. Neighboring cards animate into their new positions; hit testing uses their unaffected grid boxes. The camera/form nodes remain in their original DOM. Escape and other gesture cancellations restore the preceding draft, including edits made before the gesture. Save remains the only HA write.

All 101 tests, TypeScript checks and production build pass. Added coverage checks live preview before release, full-card dimensions and offset, existing form identity, cancellation cleanup, animation cleanup, pre-gesture draft restoration and switching printer during a gesture. Real HA samples captured a complete approximately 357 × 574px current-job card floating while its order changed before release and the camera/AMS cards animated to make room. After drop there were no overlapping cards or remaining popovers. Save/reload restored the order; 312-CSS-pixel keyboard sorting had no overlapping cards or horizontal overflow. The test preference was restored to default. No printer or notification action was sent. Real screenshots remain local; physical touchscreen testing remains unverified.

## Stable drag edges — 2026-10-23

Fixed a geometric feedback loop in live reordering: choosing the nearest card in a gap could move a different card under the same pointer, causing the next event to reverse the move and restart multiple animations. Hit testing now retains order in gaps, anchors an entered target's pre-reflow hover rectangle, and derives a spatial hysteresis margin from half the real row/column spacing. Deliberate reversal and actual scrolling still update the destination. The shared order calculation suppresses no-op moves before any reflow animation is queued; the floating card still follows each pointer event immediately.

All 105 tests, TypeScript checks and production build pass. Four regressions cover unequal-height four-column reflow with stationary/one-pixel jitter, center-boundary jitter and deliberate reversal, real scroll offsets, and no-op animation suppression. In real HA, all sampled orders stayed unchanged while dragging to a left-edge gap. Entering the feeder edge changed the camera's order once, without alternating back; dragging it deliberately back restored its original order. The final grid had no overlaps or floating popovers. The test draft was cancelled without saving preferences or sending device/notification actions. Screenshots and order traces remain local.

## External Home Assistant cameras — 2026-10-23

Overview cameras and detail panels share an external-camera picker and preview component. Accessible HA camera states populate the list, excluding ha-bambulab's own camera entities. An empty list provides setup guidance and an HA integrations link. Each printer's selected entity is stored independently in native HA user data for the current account. Source labels identify built-in/external feeds; missing, disabled, unknown and offline sources remain explicit. The existing authenticated HA native renderer handles image/live modes. Layout and camera clients now share the same validated frontend storage transport.

All 117 tests, TypeScript checks and production build pass. Twelve added cases cover camera discovery/additions/removal, status/schema/API handling, failed drafts and cancellation, independent preference persistence, late loads/saves, overview/detail reuse and native live/image rendering. Real HA displays both overview entries and the correct empty external list while retaining the two built-in cameras. The picker opens in the native top layer from both overview and detail. At 312 CSS pixels its form and overview entries fit without horizontal overflow; desktop detail cards have no overlaps. Browser verification did not save camera preferences or send printer/notification actions. Real external hardware playback remains unverified; screenshots stay local.

## Diagnostics and recorded history — 2026-10-23

Four independent draggable blocks expose HMS/print errors with official help links, one-hour actual/target nozzle and bed temperatures, device/connection readings, and 24-hour state events. Current job shows its translated stage; live parameters include hotend fan speed. Missing, disabled, unknown and offline diagnostics remain distinct. Usage hours retain an estimate label. Authenticated HA REST history explicitly selects only the active printer's entities, retains historical temperature units, excludes the initial event baseline and deduplicates repeated states. The workspace minute clock and manual refresh update history without another timer. Empty responses, request/schema failures and retained last-successful data have separate visible states. See ADR 008.

All 136 tests across 19 files, TypeScript checks and the production build pass. Nineteen added cases cover installed diagnostic schemas and malformed details, safe official links, unit conversion/gaps, REST flags, state deduplication, explicit errors, stale printer responses, unmount, minute refresh and integration with layout editing. The build was copied to the development HA resource and its SHA256 matched the local artifact.

Real HA displayed 11 detail cards for the AMS Lite/external-spool printer and 10 for the external-spool-only printer. Both returned four temperature series without history errors and real device readings; recent events contained three and twenty recorded transitions respectively, including preparation/start/completion and reported fault changes on the latter. Automatic minute refresh advanced the displayed timestamp, and manual refresh returned successfully. The new alert block accepted a mouse drag, then Cancel restored its original order without saving. Desktop and a 312-CSS-pixel viewport had no overlapping or horizontally overflowing cards; the narrow chart legend and device fields remained readable. The viewport was restored after verification.

No printer or phone action was sent and no Recorder configuration or user preference was changed during this smoke test. Active-fault/offline/error paths use synthetic verification because the live printers did not exhibit those states. Broader models and physical controls remain release checks. Real screenshots remain local and are excluded from the public repository.

## Fleet navigation, card presentation and chart interaction — 2026-10-23

The overview now shows diagnostic strips and All/Active jobs/Faults/Idle/Offline filters with HA-driven counts, preserving printer order. Alert navigation temporarily reveals, expands and focuses a hidden alert block without saving it. Failed print status is included in the shared diagnostic summary and explains the reported failure in detail. V2 layout values add per-card visibility, default collapse and normal/wide widths; legacy v1 values migrate on read using the same storage key, writing only on Save. Edit mode retains hidden-card settings; hidden/collapsed content unmounts, while reordering preserves live nodes. Wide cards span two available columns and use one on narrow screens.

Temperature charts now offer 1/6/24-hour ranges, independent series toggles and pointer/touch/keyboard state inspection with actual sample timestamps. Unknown gaps are preserved. Changing ranges invalidates earlier requests. A width observer gives wide plots additional horizontal space at a fixed height; an absolute, pointer-transparent readout prevents hover from shifting legends or neighboring cards. Mouse leaving the graph and keyboard blur clear the inspection. No additional polling timer or backend is introduced.

All 145 tests across 20 files, TypeScript checks and production build pass. Nine added cases cover schema migration/presentation, hidden/collapsed lifecycle and restoration, temporary reveal, fleet status changes/navigation, actual-sample inspection, legend switches, range races and width-observer cleanup. Existing graph assertions now explicitly inspect the temperature SVG rather than an icon SVG.

Real HA verified the correct current fleet counts and empty fault filter, direct alert focus, settings Save/reload, temporary expansion of collapsed metrics, and restoration of a hidden alert from its overview strip. A two-column wide temperature card accepted full-card mouse dragging; Cancel restored its order. Actual 1/6/24-hour queries succeeded and both target curves were hidden through the legend. Pointer/keyboard inspection showed recorded values and sample times without moving the legend. Desktop and 312-CSS-pixel layouts had no overlapping or overflowing cards after observer reflow; wide cards became one column and all edit controls fit on narrow screens. Test layout settings were restored to the original default, the other printer's preferences were untouched, and the viewport override was reset. Physical touchscreen interaction remains unverified; synthetic touch events cover inspection. No printer or phone action was sent. Household screenshots remain local.
