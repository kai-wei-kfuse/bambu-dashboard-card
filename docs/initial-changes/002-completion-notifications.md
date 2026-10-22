# Change proposal — completion notifications

## Problem

The dashboard cannot configure phone notifications when a printer finishes. The original architecture only configured frontend presentation and printer commands, and Stage 2 only covered release validation.

## Why It Matters

Completion detection must continue after the browser closes. A frontend timer or local setting cannot meet that requirement.

## Options

1. Detect completion in the card: small UI change, but notifications stop when the card closes.
2. Add a custom backend integration: persistent, but duplicates existing HA automation and notification capabilities.
3. Configure native HA automations through the authenticated admin configuration API.

## Decision

Use option 3. The user requested this feature on 2026-10-22. Implement one managed native automation per printer, with explicit recipient selection and persistent enable/disable settings. The automation configuration is the only saved source of notification settings. See [ADR 002](../adr/002-native-completion-notifications.md).

## Impact

Stage 2 now includes completion notification implementation before the remaining release checks. The card gains an authenticated automation configuration client and a per-printer settings component. No new backend service, printer credentials, or card YAML settings are required.

## Follow-up Tasks

- [x] Update initial architecture and development order.
- [x] Create the current Stage 2 plan.
- [x] Record the accepted ADR.
- [x] Update current status and installation instructions after validation.
- [ ] Keep physical phone delivery verification separate from configuration verification.
