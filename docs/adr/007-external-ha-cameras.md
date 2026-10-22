# ADR 007 — per-printer external Home Assistant cameras

Status: accepted, 2026-10-23

## Context

The user wants an overview entry for external cameras already connected to HA. No external camera is currently installed, so discovery, selection and clear setup guidance must work without inventing a camera or adding another backend.

## Decision

- Add an External camera entry on every overview camera and the detail camera panel. A single reusable camera-source component owns its picker, preference and preview in both views. Detail layout retains the stable `camera` card key.
- Discover accessible `camera.*` states and use registry metadata for labels and disabled status. Exclude ha-bambulab's own registered camera entities from the external list; offer the printer's built-in camera explicitly as the default choice. Newly added cameras appear through HA updates. Do not scan the network or accept raw stream URLs/credentials.
- Render the selected entity through the existing authenticated HA native picture-entity wrapper, using HA's reported streaming capability. A visible source label distinguishes built-in and external cameras. Missing, disabled, unknown and unavailable selections remain explicit; never silently switch to a different camera.
- Store `{version: 1, entityId: string | null}` with native frontend user data under `bambu_dashboard.camera_source.v1.<printer-id>`. Null selects the built-in camera. The setting is per authenticated HA user and printer, restored when opening or refreshing a view. Saving needs no admin role. No live cross-tab synchronization is claimed.
- Centralize the shared frontend user-data transport/response validation used by layout and camera preference clients. Keep independent versioned schemas and keys. Save explicitly, cancel without writes, show errors and preserve failed-save drafts. Ignore stale responses after printer/session changes without retargeting submitted saves.
- Use a native modal dialog in the browser top layer so the picker stays readable above overview cards and masonry containers. Camera contents remain inert while editing the detail layout.

## Validation

Cover discovery without external hardware, late camera additions, disabled/offline/missing entities, schema/API errors, independent printer persistence, cancellation and stale responses, overview/detail source reuse, and HA live/image card configuration. Verify the real HA empty state and desktop/narrow-screen picker without sending printer commands or publishing household screenshots. External hardware stream quality remains unverified until a camera is connected.
