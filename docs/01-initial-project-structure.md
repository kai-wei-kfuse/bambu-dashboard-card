# Initial project structure

## Architecture

The product is a complete Home Assistant dashboard and a reusable native custom card. The frontend uses TypeScript, Lit, CSS Grid, and Vite. Home Assistant and ha-bambulab remain the sole source of printer state and the sole path for printer commands.

The card receives HA state and shares a registry index per HA connection. A printer is identified by its registered Bambu entities, not a hard-coded model list or entity name. Child devices link AMS and external spools to their printer. Device IDs are keys; domain and translation/unique keys distinguish entities with identical names.

## Modules

- `src/ha`: HA types, registry subscriptions, services, authenticated files.
- `src/domain`: pure printer models, capabilities, project metadata and compatibility checks.
- `src/ui`: visual primitives, media wrappers, translations, theme-aware styles.
- `src/card.ts`: complete multi-printer workspace and dialogs.
- `src/editor.ts`: native visual configuration.
- `dashboards`: complete dashboard configuration, not just component examples.
- `test`: sanitized synthetic fixtures and behavior tests.

## Invariants

1. Every action captures and validates its target device. Switching views never retargets an in-flight action.
2. Zero, unknown, unavailable, disabled, and unsupported are distinct.
3. Unmapped entities remain discoverable in the complete parameter view.
4. Cached projects are never described as completed print history.
5. Start-print checks sliced plates, printer model, nozzle, and explicit AMS mapping before using the existing file and print APIs.
6. A successful API call means submitted, not physically completed. The HA state confirms the hardware result.
7. Credentials and authentication attributes are not displayed or committed. HA supplies authenticated requests.
8. A missing or failed API is reported explicitly, never converted to an empty successful result.

## Non-goals for the first release

Cloud history persistence, arbitrary G-code execution, slicing models, and printer firmware management.
