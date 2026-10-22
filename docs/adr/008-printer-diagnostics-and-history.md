# ADR 008 — diagnostic and historical detail blocks

Status: accepted, 2026-10-23

The fixed one-hour temperature window is superseded by [ADR 009](009-workspace-navigation-and-card-presentation.md): users can select 1/6/24 hours and inspect/toggle series. Its overview navigation also includes explicit print-failure status in diagnostic summaries. Other data/error and history-scope decisions remain active.

## Context

The user approved four additional blocks: alerts, temperature trends, device/connection status and recent events. Registered diagnostics exist on the current A1 installation but previously appeared mainly in the raw parameter list. History must distinguish successful empty queries from transport/schema errors and must not imply a complete print archive.

## Decision

- Add stable `alerts`, `temperature-history`, `device-health` and `recent-events` keys to the existing detail layout. Preserve explicit saved orders; new keys append through the existing layout resolver. Built-in ordering places alerts near the controls. Every block participates in the same full-card drag/masonry system.
- Parse ha-bambulab 2.2.26 HMS attributes (`Count`, `N-Code/Error/Wiki/Severity`) and print-error attributes (`code`, `error`) without inventing details. Keep missing/disabled/unavailable/unknown diagnostics distinct. Offline or unknown connectivity cannot produce a green all-clear summary. Official help links must be HTTPS on `wiki.bambulab.com`; rejected links remain visibly unavailable.
- Show connection mode, online state, Wi-Fi, SD status, nozzle diameter/type, firmware availability and the integration's estimated usage hours. The last item is explicitly an estimate, not an authoritative maintenance lifetime. Add stage text and heatbreak fan speed to their existing task/metric blocks.
- Use HA's authenticated read-only REST history endpoint, with selected entity IDs and explicit time windows: one hour for temperatures and 24 hours for events. Query temperatures with attributes so historical units can be normalized to Celsius per record; drop unrelated attributes at the parser boundary. Event queries use `no_attributes` and `skip_initial_state`, preventing the initial carried state from becoming a fictitious new event. Use `significant_changes_only=0` as defined by HA 2026.10.2.
- Render branded SVG curves and a state-change timeline rather than delegating error/empty handling to opaque native cards. Unknown/unavailable readings break lines. No history yields an explicit Recorder guidance state; API/schema failures yield an error with Retry. Retained last-successful data is labeled with its timestamp during refresh/errors.
- Reuse the workspace's minute clock for automatic history refresh, plus a manual Refresh action. No extra polling timers, fixed request timeout, item truncation or synthetic success fallback. Long event lists remain fully accessible in a scrollable visual region. Stale printer/session responses are ignored; unmount invalidates requests.
- Recent events represent HA-recorded state transitions, not a completed-task archive. No new backend, automation, helper or recorder configuration is created.

## Evidence

- [HA REST API](https://developers.home-assistant.io/docs/api/rest/#get-apihistoryperiodtimestamp)
- [HA 2026.10.2 history view](https://github.com/home-assistant/core/blob/2026.10.2/homeassistant/components/history/__init__.py): required entity filter, `no_attributes`, `skip_initial_state`, and `significant_changes_only` boolean parsing.
- Installed ha-bambulab `pybambu/models.py` HMS/PrintError models and `definitions.py`, inspected read-only without configuration credentials.

## Validation

Cover exact diagnostic schemas and malformed/unknown/offline states, safe links, target ownership, units and gaps, baseline exclusion/deduplication, API query flags/errors, stale contexts and minute refresh. Verify real history content or explicit empty/error states, actual diagnostic values, 10/11 draggable blocks and desktop/narrow geometry. Keep household data/screenshots outside the repository.
