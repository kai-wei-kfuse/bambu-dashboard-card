# Stage 2 — completion notifications and release validation

Version: 1.2

## Current Plan (v1.2)

The prior Stage 2 release-validation-only scope in development order v1.0 is superseded by the user-requested notification scope in [change proposal 002](../initial-changes/002-completion-notifications.md) and [ADR 002](../adr/002-native-completion-notifications.md). Existing release checks remain required.

- [x] Implement pure recipient discovery and managed automation generation/parsing.
- [x] Implement authenticated automation read/save with ownership and explicit error handling.
- [x] Add per-printer recipient, enable/disable and save controls; display saved and loaded runtime state.
- [x] Verify behavior, typing, production build and a real HA configuration smoke test without sending a phone message.
- [x] Add an explicit one-shot phone test button using the selected destination/style without saving or enabling an automation; verify submission and ask the user to confirm sound.
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
