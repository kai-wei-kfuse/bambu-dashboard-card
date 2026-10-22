# Development order

Version: 1.1

1. **Stage 1 — usable initial dashboard:** device discovery, all parameters, multi-printer interface, existing controls, AMS, camera, cached projects, complete dashboard configuration, automated checks, read-only HA smoke verification.
2. **Stage 2 — completion notifications and release validation (v1.1):** persistent per-printer phone reminders, followed by controlled hardware tests, more printer models, accessibility and installation testing, HACS release validation. See [current stage plan](stages/stage-2.md).
3. **Stage 3 — additional history capabilities:** only when explicitly requested and backed by a supported backend contract.

Current stage: Stage 2. Stage 1 implementation and read-only HA verification are complete; physical controls and release installation remain to be verified. See `current-status.md` and `stage-follow-ups.md`.

## Revision History

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-10-22 | Original three-stage development order. |
| 1.1 | 2026-10-22 | Supersede release-only Stage 2 with notification scope plus retained validation; see ADR 002. |
