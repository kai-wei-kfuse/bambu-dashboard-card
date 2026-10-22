# ADR 006 — full-card dragging with live masonry reordering

Status: accepted, 2026-10-23

## Context

The user requests that the complete information card follow the pointer and that surrounding cards make room before release. ADR 005's label ghost and drop-only update do not provide this interaction.

## Decision

- Supersede only ADR 005's gesture presentation and update timing. Retain its order schema, HA persistence, explicit editor and stable keyed DOM.
- Add a stable inner `.layout-card` containing the original handlebar and live content. During a gesture, display this same element as a manual HTML popover in the browser top layer. Fixed viewport coordinates and the original pointer offset keep its complete content under the pointer; the top layer avoids clipping or containing blocks imposed by HA ancestors. Do not clone or reparent cameras/forms.
- Keep the outer `.layout-item` in the grid as a same-height placeholder. Update the editor's existing draft order during pointer movement, so the placeholder moves and surrounding cards immediately reflow. Animate their inner presentation layers; hit testing uses the unaffected outer grid geometry. Honor reduced-motion preferences.
- A gesture captures the pre-drag draft. Drop accepts its preview; Escape, pointer cancellation, blur, disconnection, resize, topology changes or dropping outside the grid restore that draft. An unrelated printer context must never receive a rollback from an old gesture. Explicit Save remains the only HA write.
- Remove the name ghost and before/after marker. The moving full card and its vacant destination communicate placement directly. Modern browsers with the standard Popover and Web Animations APIs are required for this interaction; no reduced label-only fallback is added.

## Validation

Verify live draft movement before pointerup, unchanged DOM/media identity, full measured card dimensions and grab offset, cancellation and stale-context rollback, and exact cleanup. Real HA smoke tests must cover full-card dragging, layout persistence, no overlaps after drop, and narrow-screen reordering. Keep real installation screenshots local.
