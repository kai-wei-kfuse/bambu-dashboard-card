# Stage 2 — completion notifications and release validation

Version: 1.5

## Current Plan (v1.5)

The prior Stage 2 release-validation-only scope in development order v1.0 is superseded by the user-requested notification scope in [change proposal 002](../initial-changes/002-completion-notifications.md) and [ADR 002](../adr/002-native-completion-notifications.md). Existing release checks remain required.

- [x] Implement pure recipient discovery and managed automation generation/parsing.
- [x] Implement authenticated automation read/save with ownership and explicit error handling.
- [x] Add per-printer recipient, enable/disable and save controls; display saved and loaded runtime state.
- [x] Verify behavior, typing, production build and a real HA configuration smoke test without sending a phone message.
- [x] Add an explicit one-shot phone test button using the selected destination/style without saving or enabling an automation; verify submission and ask the user to confirm sound.
- [x] Add and test an explicit Android alarm-speech style to honor the requirement that ordinary notifications stay silent; see ADR 002's independent alarm speech decision. User confirmed audible speech; saved/loaded enabled automation verified.
- [x] Place each overview camera on the left and its project thumbnail on the right; use a 256px square detail preview (v1.5), scaling only when the available width is smaller, and verify desktop/narrow-screen rendering without content overflow.
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
