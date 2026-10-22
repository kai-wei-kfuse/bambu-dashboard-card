# ADR 003 — content-sized detail masonry

Status: accepted, 2026-10-22

## Context

The detail camera and job/control panel occupy a shared grid row. The taller control panel stretches the camera's outer panel, leaving a large blank area. A 256px project preview increases the mismatch. The user requested an information-dense masonry layout.

## Decision

Split current job, camera, controls, live parameters, each AMS/spool unit, and notification settings into independent content-sized cards. Use a responsive CSS Grid with measured row spans: a small layout element observes direct child heights with ResizeObserver and updates their grid-row spans. CSS dense placement fills gaps without recreating or reparenting cards. A MutationObserver registers added/removed cards; both observers detach on disconnect.

Use automatic column sizing with a 320px preferred minimum and a one-column narrow layout. Row sizes and gaps are layout tokens, not data caps. Preserve DOM order for keyboard navigation. Keep camera rendering delegated to HA and let the native card determine its height rather than stretching its container. Preserve the 256px project preview, scaling only for narrower containers.

Before unloading an offscreen native camera, remember its visible frame ratio on the wrapper. This reserves the same proportional space during lazy unloading and responsive resizing, avoiding scroll jumps. Clear the reserved ratio when the camera entity changes.

Group the five existing live metrics in one compact panel. Keep controls and notification behavior unchanged. Reduce spacing within the detail layout, while keeping field labels, errors, supported actions, AMS state and secondary help accessible.

Display the integration's fractional-hour remaining-time estimate as whole hours/minutes in the detail summary, rounded to the nearest minute to remove floating-point noise. Preserve unknown/unavailable or differently typed values and the raw complete-parameter view.

In the detail masonry, notification settings default to a compact status/recipient summary with an explicit Settings & test disclosure. Expanding it reveals the same form and actions; configuration errors expand it automatically. The form remains expanded for existing standalone consumers. Height changes are handled by the masonry observer without moving the notification component.

## Alternatives

Only adding `align-items: start` removes panel stretching but still reserves the whole grid row, so lower modules cannot use the resulting gap. CSS multicolumn flow is simpler but places cards vertically before continuing across, which can bury the active job or controls below unrelated cards. Measured grid spans retain the intended initial row and pack subsequent cards into available space.

## Validation

Verify row-span calculations and observer cleanup, run existing behavior tests/type checks/build, and inspect actual HA desktop and narrow layouts. Confirm the camera panel follows its content, the preview remains 256px on desktop, all modules and controls remain present, and no horizontal overflow occurs. Do not send physical printer or notification commands for layout validation.
