# ADR 004 — display identity and completion estimate

Status: accepted, 2026-10-22

## Context

The integration exposes a printer-name sensor distinct from the HA registry device name. Using only the registry name makes the workspace show serial-based labels. Users also need a wall-clock completion estimate below remaining time and the Bambu green used by the official store.

## Decision

- Keep device IDs as command/discovery keys. `Printer.name` is the nonempty, available `printer_name` sensor value; retain the HA registry display name as `Printer.haName`. If the printer-name sensor is absent, disabled or unavailable, retain the existing HA-name display. No names are invented or written back to HA.
- Use the printer name in main titles, sidebar labels, tiles and printer pickers. Show the HA name as secondary identity, including the large detail title's subtitle. Preserve model and state information.
- Normalize typed remaining-time sensor values to a duration in one pure function shared by remaining-time formatting and ETA calculation. Accept HA hour/minute/second units; invalid, negative or unsupported values remain unavailable for calculation.
- During running/preparing states, estimate completion as current clock time plus remaining duration. Paused/idle/finished states have no running ETA. Format the date/time in HA's configured timezone, including the calendar date so midnight transitions are clear. This is an estimate, not actual completion or the integration's historical end timestamp.
- Refresh the clock when HA supplies state and once per minute while connected because the displayed estimate has minute precision. Clear that timer when detached.
- Replace the prior teal accent with `#00AE42`, directly observed in the [official Bambu store](https://store.bambulab.com) HTML. This is an implementation reference, not a claim of a published brand standards document.

## Consequences and validation

Renaming a display label never retargets a command. Existing notification configuration remains unchanged; its native templates and ownership checks are unaffected. The complete entity view retains raw sensor values. Test name precedence and missing values, unit conversion, nonprinting/invalid estimates, timezone/midnight display and clock cleanup. Verify actual HA names, secondary labels, ETA and computed accent color without sending printer/notification commands.
