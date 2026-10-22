# Stage 2 — completion notifications and release validation

Version: 1.13

## Current Plan (v1.13)

The prior Stage 2 release-validation-only scope in development order v1.0 is superseded by the user-requested notification scope in [change proposal 002](../initial-changes/002-completion-notifications.md) and [ADR 002](../adr/002-native-completion-notifications.md). Existing release checks remain required.

- [x] Implement pure recipient discovery and managed automation generation/parsing.
- [x] Implement authenticated automation read/save with ownership and explicit error handling.
- [x] Add per-printer recipient, enable/disable and save controls; display saved and loaded runtime state.
- [x] Verify behavior, typing, production build and a real HA configuration smoke test without sending a phone message.
- [x] Add an explicit one-shot phone test button using the selected destination/style without saving or enabling an automation; verify submission and ask the user to confirm sound.
- [x] Add and test an explicit Android alarm-speech style to honor the requirement that ordinary notifications stay silent; see ADR 002's independent alarm speech decision. User confirmed audible speech; saved/loaded enabled automation verified.
- [x] Place each overview camera on the left and its project thumbnail on the right; use a 256px square detail preview (v1.5), scaling only when the available width is smaller, and verify desktop/narrow-screen rendering without content overflow.
- [x] Reorganize detail information as independent content-sized masonry cards, preserving the 256px preview and every existing control/data module. See [ADR 003](../adr/003-detail-masonry.md). Verify four/two/single-column rendering, settings expansion and stable offscreen camera space.
- [x] Add current-time-plus-remaining ETA, separate printer/HA display names and use the official-store green reference. See [ADR 004](../adr/004-printer-identity-and-completion-estimate.md). Verify actual HA labels, `#00AE42`, timezone display and narrow-screen layout.
- [x] Show the reported speed percentage on every overview tile from the speed-profile sensor's `modifier` attribute, without guessing from speed mode names. Verify live HA readings and narrow-screen layout.
- [x] Refine card surfaces using the supplied soft-gradient/translucent reference while retaining Bambu green and dense masonry; group overview filament colors by their actual AMS model or external-spool source. Verify actual HA labels, desktop masonry and narrow layouts.
- [x] Add draggable detail card order with edit/save/cancel/reset, per-user/per-printer HA persistence and touch/keyboard alternatives. See [ADR 005](../adr/005-draggable-detail-layout.md). All 94 tests, typing/build, real HA mouse drag/save/reload and narrow-screen keyboard sorting pass; measured row spans survive reordering.
- [x] Replace the name ghost with the original full card and live masonry reordering during drag, with gesture cancellation restoring the pre-drag draft. See [ADR 006](../adr/006-full-card-live-reordering.md), superseding ADR 005's gesture presentation/timing (v1.11). All 101 tests, types/build and real HA full-card/live-reflow/save/reload/narrow checks pass.
- [x] Stabilize drag targets at card/grid edges (v1.12): gaps retain the current position, hover intent survives masonry reflow, and a spatial hysteresis band derived from the existing grid gap rejects fine jitter. Skip no-op moves/animations; retain deliberate reversal and scrolling. This is an implementation correction within ADR 006. All 105 tests, typing/build and real HA gap/edge/reversal checks pass.
- [x] Add per-printer external HA camera discovery, overview/detail source selection, explicit source/status labels and native user-data persistence (v1.13). See [ADR 007](../adr/007-external-ha-cameras.md). All 117 tests, types/build and real HA overview/detail empty-state and desktop/narrow picker checks pass. External hardware playback remains a follow-up.
- [ ] Verify phone delivery during a real print with the user's chosen destination.
- [ ] Validate physical print/light/speed controls with an operator.
- [ ] Check broader model compatibility, accessibility and clean HACS installation.
- [ ] Publish a versioned release after validation.

## Revision History

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-10-22 | Add native completion notifications to active Stage 2; retain release checks. See ADR 002 and change proposal 002. |
| 1.1 | 2026-10-22 | Record implementation and 41 passing tests; verify disabled automation save/load on real HA. User clarified Android alarm-style alerts; actual sound test remains open. |
| 1.2 | 2026-10-22 | Add the user-requested phone test button with shared notify payloads. All 47 tests pass; real HA accepted one test request. Phone sound awaits user confirmation. |
| 1.3 | 2026-10-22 | Add explicit alarm speech after silent notification receipt; user confirmed audible speech with ordinary notifications silent. All 49 tests pass and enabled saved configuration is verified; see ADR 002. |
| 1.4 | 2026-10-22 | Implement the user-requested overview camera/thumbnail arrangement and 96px detail preview; verify real HA desktop and narrow layouts. Presentation only; existing 49 tests, typing and build pass. |
| 1.5 | 2026-10-22 | User revised the detail preview size to 256px square; allow the project title to wrap below and scale the square only for narrower containers. Supersedes v1.4's 96px detail size. |
| 1.6 | 2026-10-22 | Implement dense detail masonry per ADR 003, compact reminder settings and readable hour/minute estimates. Real HA four/two/single-column checks pass; 54 tests, types and build pass. The paired camera/control layout is superseded. |
| 1.7 | 2026-10-22 | Implement the requested printer/HA-name hierarchy, current-time completion estimate and `#00AE42` green per ADR 004. All 76 tests, typing, build and real HA desktop/narrow checks pass. |
| 1.8 | 2026-10-22 | Implement overview speed percentage from the installed integration's modifier. All 78 tests, typing/build and real HA desktop/narrow checks pass; no control or backend changes. |
| 1.9 | 2026-10-23 | Apply soft-gradient/translucent surfaces, larger radii and diffuse shadows; label actual AMS/external-spool color groups. All 79 tests, types/build and real HA overview/detail/narrow checks pass. Presentation only. |
| 1.10 | 2026-10-23 | Add user-controlled detail card order and HA-backed layout preferences per ADR 005. Retain responsive masonry and preserve card state and measured row spans through property-scoped CSS ordering. All 94 tests, types/build and real HA drag/persistence/narrow checks pass. |
| 1.11 | 2026-10-23 | Implement full-card dragging and immediate surrounding-card reflow. ADR 006 supersedes the label-only ghost and drop-only preview while retaining stored layouts. All 101 tests, types/build and real HA live-drag/persistence/narrow checks pass. |
| 1.12 | 2026-10-23 | Correct geometric feedback in ADR 006's drag hit testing: reflow must not retarget a stationary pointer. Add gap-derived hysteresis, gap retention and no-op suppression without a timing debounce or persistence change. All 105 tests, typing/build and real HA edge checks pass. |
| 1.13 | 2026-10-23 | Add user-requested external HA camera selection per ADR 007. Reuse HA-native media and centralize frontend preference transport; no new backend or direct camera connection. All 117 tests, typing/build and real HA empty-state/desktop/narrow checks pass. |
