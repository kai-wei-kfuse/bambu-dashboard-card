# ADR 009 — fleet navigation, card presentation and interactive history

Status: accepted, 2026-10-23

## Context

The user approved the first three recommendations: overview alert/status navigation, per-card visibility/collapse/width and interactive temperature charts. Existing layout preferences represent order only, and charts have a fixed one-hour window. This is a scoped Stage 2 extension within the existing HA-only architecture.

## Decision

- Reuse the diagnostic domain as the source for overview fault/offline counts and tile badges. Provide All, Printing, Attention, Idle and Offline filters without reordering printers. Printing includes preparation and pause; Idle includes completed jobs. Faults and offline states remain distinct, and uncertain diagnostics are not described as healthy.
- Include an explicitly reported Failed print status in the same alert summary, with a visible explanation in the alert block; a failed print cannot link to a green all-clear heading.
- Clicking a printer alert opens its detail overview and temporarily reveals/expands/focuses its alert card, including when saved as hidden or collapsed. This never writes or resets saved layout settings.
- Upgrade layout values to `{version: 2, order, cards}`, where each card has explicit hidden/collapsed/normal-or-wide presentation. Read legacy v1 values into v2 without writing until Save. Retain the existing per-user/per-printer storage key so there is one source of truth. Preserve unavailable card preferences, validate schemas at the boundary and keep Save/Cancel/default-reset/error semantics.
- Editing shows every available card, including hidden cards, with visibility/collapse/width controls. Outside editing, hidden cards are omitted; collapsed cards show an expandable summary. Hidden/collapsed content is unmounted to stop media/history work. Reordering alone keeps original live nodes. Temporary expansion is session-only; editing defines the saved default. Wide cards span two actual columns, reduced to one when only one is available. Masonry remains the sole owner of measured row spans. Presentation controls cannot change geometry during an active gesture.
- Temperature charts offer 1/6/24-hour ranges, independent series toggles and mouse/touch/keyboard inspection. Inspection shows the last recorded state at the selected time and its actual sample timestamp, without interpolation or bridging unknown readings. All-series-hidden is explicit. Keep entity filters, unit conversion, Recorder scope, minute/manual refresh and explicit error states from ADR 008. Range changes invalidate stale requests. No new backend, retention limit or polling timer.
- Chart inspection is an absolute, pointer-transparent overlay within the plot, preventing hover from moving the legend or changing masonry heights. A ResizeObserver matches SVG coordinates to the actual width at a constant plot height, so wide cards gain plot resolution without enlarging labels.

## Validation

Cover legacy migration and malformed preferences, per-card persistence/cancel/reset/errors and late saves, wide-card measurement/dragging, hidden and collapsed content lifecycle, temporary alert reveal, fleet filtering and HA-driven counts, chart ranges/races/gaps/toggles and pointer/keyboard readouts. Run targeted behavior tests, types, build and real HA desktop/narrow checks without printer or phone actions. Keep household screenshots outside the repository.
