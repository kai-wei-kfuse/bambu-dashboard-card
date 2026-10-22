# ADR 005 — draggable per-user detail layouts

Status: accepted, 2026-10-23

Gesture presentation and update timing are superseded by [ADR 006](006-full-card-live-reordering.md): full original cards follow the pointer and surrounding cards reflow during the gesture. The persistence and editing decisions below remain active.

The v1-only value schema is superseded by [ADR 009](009-workspace-navigation-and-card-presentation.md), which adds card presentation and legacy migration while retaining the same storage key and explicit editing semantics.

## Context

The user wants to reposition the detail information cards. The existing content-sized masonry should remain responsive, and moving cards must not trigger printer actions or lose camera/reminder state.

## Decision

- Add an explicit Edit layout mode with dedicated pointer/touch drag handles, move-earlier/later buttons, Save, Cancel and Restore default actions. Card contents are inert while editing so positioning cannot activate printer controls.
- Represent position as a stable card order, not fixed screen coordinates. Built-in cards use stable names and filament cards use their registered child device ID. Newly discovered cards append; temporarily absent keys remain in saved preferences.
- Apply the order with CSS `order` on keyed, stable wrappers. Use Lit's property-scoped `styleMap` so updating order preserves masonry's measured `grid-row-end`; replacing the entire style attribute would erase spans and overlap cards. Do not reparent live cards for drag previews or layout updates. Keep measured row spans and responsive masonry, superseding ADR 003 only by adding explicit user order. DOM/keyboard traversal remains stable while visual placement follows the selected order.
- A dedicated pointer controller shows the moving card label and a before/after drop indicator. It uses pointer events for mouse, pen and touch, supports viewport-edge scrolling, and cancels on Escape, pointer cancellation, blur, topology changes or disconnection.
- Store `{version: 1, order: string[]}` using HA `frontend/get_user_data` / `frontend/set_user_data`, under a namespaced per-printer key. HA scopes the data to the authenticated user. Preferences are shared by that user's clients when they open/refresh the detail view; other users are independent. No layout data goes into browser storage, card YAML or notification automations.
- Read failures are visible and disable editing until a successful read. A genuinely missing value uses default order. Save errors keep the draft editable; Cancel never writes. Restore default changes only the draft until Save. Switching printer/connection invalidates old UI responses without retargeting an already submitted save.

## API evidence

[Core 2026.10.2 frontend storage](https://github.com/home-assistant/core/blob/2026.10.2/homeassistant/components/frontend/storage.py) scopes its store via `connection.user.id`. Get returns `{value: ...}` with null for a missing key. Set accepts JSON-compatible values, awaits `store.async_set_item`, then sends an empty success result. User data needs no admin permission. This implementation reads on opening and writes on explicit Save; it does not claim live cross-tab subscription.

## Validation

Test ordering/topology preservation, preference schemas and HA errors, draft/save/cancel/reset flows, stale responses, pointer/touch drop/cancellation and controller cleanup. Verify a real drag changes order, a reload restores it, another printer stays independent, mobile controls work, and no printer or notification action is called. Keep real device IDs and screenshots outside the repository.
