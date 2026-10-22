# Stage 1 — initial dashboard

Version: 1.0

## Current Plan

- [ ] Implement registry discovery and entity indexing with dynamic printer and child-device support.
- [ ] Implement accurate state/capability models and a complete parameter explorer.
- [ ] Build the responsive multi-printer overview and complete detail workspace.
- [ ] Add HA-native camera rendering and existing light/speed/print controls.
- [ ] Add authenticated cached-project browsing and compatible project start/reprint flows.
- [ ] Supply a visual editor and complete dashboard configuration.
- [ ] Run behavior tests, type checks, build, and a real HA read-only smoke test.
- [ ] Publish the implementation branch and document hardware validation still required.

Physical start/stop tests require an operator to verify the target printer, bed, and filament. Automated tests use explicit test fixtures and never command real printers.

## Revision History

| Version | Date | Change |
| --- | --- | --- |
| 1.0 | 2026-10-22 | Initial implementation plan based on the agreed complete-dashboard scope. |
