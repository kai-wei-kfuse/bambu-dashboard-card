# Installation

## Requirements

- Home Assistant with authenticated frontend file requests and the device/entity registries. The initial implementation is tested on HA 2026.10.2; older versions have not been verified rather than being blocked by an arbitrary version gate.
- [ha-bambulab](https://github.com/greghesp/ha-bambulab) with your printers already configured.
- Permission to read the device/entity registries and invoke the required HA services.

The first implementation targets the entity and file API contracts inspected in ha-bambulab v2.2.26. A1 and AMS Lite are the initial hardware targets. Other models require verification; do not assume identical controls or slicing compatibility.

## HACS custom repository

1. In HACS, open **Custom repositories**.
2. Add `https://github.com/kai-wei-kfuse/bambu-dashboard-card`, type **Dashboard**.
3. Download the component. Until a release is available, choose the default branch.
4. Check that the resource `/hacsfiles/bambu-dashboard-card/bambu-dashboard-card.js` is registered as a JavaScript module.
5. Refresh the HA frontend and add **Bambu Dashboard** through the card picker.

HACS default-store inclusion has not been requested. This repository can be used as a custom repository once the built artifact is published.

## Complete dashboard

Create a new blank dashboard in Home Assistant, open its raw configuration editor, and paste [the complete dashboard configuration](../dashboards/bambu-dashboard.yaml). This creates a full-width multi-printer workspace with built-in navigation, not a collection of cards to assemble manually.

Automatic discovery includes all registered Bambu printers. The visual editor can select a subset, change the title/language, and reorder selected devices. Adding a printer through ha-bambulab updates the directory without editing entity IDs.

The main printer label uses ha-bambulab's **Printer name** sensor. Its HA device name appears as secondary identity; if that sensor is absent, disabled or unavailable, the HA name remains the main label. Parameter search accepts both names. The dashboard does not rename HA devices or alter command targets.

During printing/preparation, the overview and detail show **Estimated finish** below remaining time, calculated from the current clock plus the remaining duration. Dates/times use HA's configured timezone. A paused print needs resuming before a running estimate is shown. This is a changing estimate, not a completed-print timestamp.

## Manual installation / local development

Build with `npm ci` and `npm run build`. Copy `dist/bambu-dashboard-card.js` into `<HA config>/www/bambu-dashboard/`, then register `/local/bambu-dashboard/bambu-dashboard-card.js` as a JavaScript module. A query parameter such as `?v=0.1.0` can identify a new build after deployment.

Do not register both the HACS resource and a manual resource at the same time: both register the same custom element.

## Existing integration behavior

- A1 cameras use the integration's image camera. The component delegates rendering and authentication to HA's picture-entity card.
- A registered light does not prove the physical printer has a working controllable lamp. This is explicitly a hardware validation item.
- Speed options come from the actual select entity and are available while printing.
- The cached-file list is not a complete print log. Missing file APIs produce an explicit compatibility/error message.
- Cached projects are inspected for sliced plates, printer model and nozzle before reprinting. Known SD paths require explicit operator verification.
- New print commands and stop operations use a confirmation dialog. A command response is displayed as submitted until a matching HA state is observed.

No printer credentials, HA tokens, PVE access, or Samba service are required in this component's configuration.

## Completion reminders

1. Connect your phone using the Home Assistant Companion App and allow its notifications.
2. Open a printer's detail view as an HA administrator, then find **Print completion reminders**.
   In the compact detail workspace, expand **Settings & test** to reveal the form. Its saved status and recipient remain visible while collapsed; errors expand it automatically.
3. Select **Alarm-style sound (Android)**, **Alarm speech (Android)** or **Standard notification**, and explicitly choose a destination.
4. Enable the reminder and choose **Save reminder**. Wait for **Saved and enabled in HA**. Each printer has its own settings.

Use **Test phone reminder** to immediately send one clearly labeled test message using the current phone and reminder style. You can test before saving settings or enabling the automation. The button does not write or toggle the automation. It is disabled while its request is in flight; a completed request can be tested again. **HA accepted the test request** confirms submission, not that the phone displayed it or made a sound. Check the phone to verify delivery, volume and permissions. Notification service errors remain visible in the panel.

The backend is a native HA automation. Settings survive page closure and HA restart. The saved startup setting and actual runtime state are checked separately; **saved** alone does not mean HA loaded it. A runtime switch changed elsewhere may differ from the startup setting. Save again in the dashboard to reapply it, or change the managed configuration deliberately.

For Android alarm-style sound, choose the specific phone App destination. HA's modern `notify.send_message` entity action supports only message/title in the verified version, so it cannot carry the required alarm channel options. The dashboard uses the phone's `notify.mobile_app_*` action with the documented `channel: alarm_stream`, `priority: high`, and `ttl: 0` payload. The phone uses alarm volume even in silent/vibrate ringer modes. Set an audible alarm volume, allow the HA notification channel, and configure Do Not Disturb bypass on the phone if desired. Phone OS battery restrictions can affect delivery. The channel is created when its first notification arrives.

This is an alarm-style notification, not a scheduled Clock-app alarm, and it does not promise continuous ringing or force maximum volume. The immediate-delivery `ttl: 0` setting follows the Companion documentation: an Android cloud message that cannot be delivered immediately may be dropped instead of ringing later when the phone reconnects.

If a test arrives without sound, inspect only that notification's channel/category and alarm volume. Ordinary notification sounds can remain silent. Android retains user-modified channel settings; sending another payload does not override them. Changing the global notification sound is not required by this component.

**Alarm speech (Android)** reads the reminder using the phone's text-to-speech engine and `media_stream: alarm_stream`, at the current alarm volume. It does not rely on the notification channel's sound, change ordinary notification settings or force a volume change. A working TTS engine and audible alarm volume are required. This is an explicit style that must be selected and saved; the dashboard never silently switches styles. It has been verified by a user's audible phone test while ordinary notifications remained silent. That evidence does not establish the cause of a silent alarm-channel notification on another device.

HA must observe `running` or `pause` changing to `finish`. Startup/reconnect states and failed/stopped prints do not trigger a completion reminder. Completion while HA is stopped or the printer is disconnected is not replayed. Delivery still depends on HA, the phone's connectivity and App permissions. Configure a real print test separately to verify the automatic completion trigger; saving settings never sends a test notification.

Managed automations appear in HA's Automations interface with a `Bambu Dashboard` alias. Use the native trace to inspect runs and notification errors. The dashboard refuses to overwrite unrelated or customized automation actions; duplicate the managed automation if you want to customize it. Deleting a card or dashboard does not delete the backend automation. Disable its reminder or remove it through HA if it is no longer wanted.

Automatic recipient guessing, generic broadcast notification actions, and browser-local completion timers are not used.
