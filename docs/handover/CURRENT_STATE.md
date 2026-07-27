# Current state — 2026-07-27

## Completed

Phase 0 research register, SARS integration finding, compliance/security boundaries, architecture records, source-checked 2026 employment tax configuration, synthetic IRP5 reconciliation, Rovyniq/Astraiva branding, free self-hosted Phase 1 configuration, and a no-Docker GitHub Pages/Cloudflare Workers synthetic-preview path. The public preview has a responsive, accessibility-conscious Rovyniq landing page with an illustrative tax-breakdown surface and explicitly disables uploads and auto-filing.

## In progress

Phase 1 foundation. Database adapter/migration runner, OIDC/JWKS validation, encrypted object storage adapter, malware scanning and interactive web UI are intentionally not yet implemented. Docker is not installed in this workspace, so the local stack is unrun.

## Next three tasks

1. In `Jadax/Rovyniq` Settings → Pages, select GitHub Actions to deploy the synthetic preview (`apps/web`).
2. Obtain legal/practitioner and production data-hosting approval before accepting any real documents.
3. Add a maintained OIDC/JWKS validator, secure persistence/ingestion, and authenticated document review UI.

## Decisions and risks

The return is ITR12. No public documented ITR12 submission API was found in the official research recorded below. Use manual eFiling handoff unless an authorised provider channel is documented and approved. No public documented EasyEquities customer tax-data API was located; support secure IT3 statement upload now and pursue a formal provider partnership later. Tax rules require practitioner verification before filing.

## Commands last run

`node --experimental-strip-types --input-type=module -e "…edge API contract…"` — passed (health 200; upload fails closed with 503). `npm.cmd run test:all` — passed: compliance checks plus 8 tests, 0 failures (2026-07-27). Docker was checked and is not installed.

## Repository

Initial foundation commit `3b1fa71` was pushed to `https://github.com/Jadax/Rovyniq` on branch `main` (2026-07-27). GitHub CLI is not installed in this workspace, so enabling the GitHub Pages repository setting remains a user action.
