# ADR 002 — native HA completion notifications

Status: accepted, 2026-10-22

## Context

Users need a phone reminder after a print completes, including when the dashboard is closed. Existing HA notification entities and mobile-app services already provide message delivery.

## Decision

- Persist one automation with a stable namespaced ID per printer device ID through `/api/config/automation/config/{id}`. Configuration requires an HA administrator.
- Discover available `notify` entities and specific legacy `notify.mobile_app_*` services. Require explicit recipient selection; never choose the generic `notify.notify` service.
- Support standard messages and Android alarm-stream alerts. Alarm alerts require a specific `notify.mobile_app_*` service because HA 2026.10.2's modern mobile notify entity accepts only message/title, not advanced notification data. Send the documented `channel: alarm_stream`, `priority: high`, `ttl: 0` payload. This uses the phone's alarm audio stream; it does not create a Clock-app alarm or promise continuous ringing.
- Trigger only when the printer's registered print-status sensor changes from `running` or `pause` to `finish`. Do not trigger from `unknown` or `unavailable`, and do not add a progress or cooldown gate.
- Generate templates using validated device/entity identifiers, never executable interpolation of device names.
- Save `initial_state` explicitly. HA applies it when loading the automation, including on restart. A manual runtime toggle elsewhere can differ from the saved startup setting; display both and allow reapplying the saved state.
- Treat the saved automation as the sole persistent source of settings. Do not add notification settings to card YAML or browser storage.
- Check the ownership marker and supported configuration before overwriting. Refuse to replace unrelated or manually customized automations.
- POST success confirms the file write. Confirm the loaded configuration through `automation/config` after `automation_reloaded`, and display actual runtime state separately. Errors remain visible.
- No browser timer, always-open page or custom HA integration is required. Saving settings never sends a test notification.

### Explicit phone test — 2026-10-22

The user requested a button that immediately tests the selected phone and reminder style. Use the same notification action/payload builder for automatic and test messages. Tests send plain text directly through HA's notify action; they do not evaluate automation templates, write settings or enable automations. One click submits one notification, with repeat submissions blocked only while the request is in flight. HA accepting a request is distinct from the user hearing a sound; report the former and ask the user to verify the latter.

## Consequences

HA must be running, connected to the printer, and able to reach the notification destination. A completion that occurs entirely while HA is stopped or the printer is disconnected is not replayed. Notify action success does not guarantee the operating system displays the message; phone notification permissions and battery restrictions still apply.

Managed automations appear in HA's Automations interface. To customize their actions, duplicate them and use the copy; the dashboard rejects incompatible edits rather than discarding them. Native automation traces provide delivery errors and execution history. Removing the frontend card does not remove its backend automations.

The user clarified that an alarm-like phone alert is desired. Android alarm volume and HA notification-channel permissions must be enabled on the phone; Do Not Disturb bypass depends on channel settings. No forced volume change is sent.

## Evidence

Verified against HA Core 2026.10.2: [configuration API](https://github.com/home-assistant/core/blob/2026.10.2/homeassistant/components/config/automation.py), [configuration view](https://github.com/home-assistant/core/blob/2026.10.2/homeassistant/components/config/view.py), and [automation runtime](https://github.com/home-assistant/core/blob/2026.10.2/homeassistant/components/automation/__init__.py). The runtime overrides restored state with explicit `initial_state` and emits `automation_reloaded` after processing configuration. [Notify entity action](https://www.home-assistant.io/actions/notify.send_message/) and [Companion notifications](https://companion.home-assistant.io/docs/notifications/notifications-basic/) define the delivery contracts.

Advanced Android data is verified against [mobile app notify implementation](https://github.com/home-assistant/core/blob/2026.10.2/homeassistant/components/mobile_app/notify.py) and [Companion alarm-stream documentation](https://companion.home-assistant.io/docs/notifications/critical-notifications/#android-alarm-stream).
