# Current state — 2026-07-27

## Completed

Phase 0 research register, SARS integration finding, compliance/security boundaries, architecture records, source-checked 2026 employment tax configuration, synthetic IRP5 reconciliation, Rovyniq/Astraiva branding, free self-hosted Phase 1 configuration, and a no-Docker GitHub Pages/Cloudflare Workers synthetic-preview path. The public preview has a responsive landing page plus a mobile-first, synthetic-data workspace preview with tax breakdown, review state and activity history; uploads and auto-filing remain explicitly disabled.

The published preview now uses an original CSS-only visual system with no remote fonts, third-party images, icon libraries or competitor assets. See `docs/compliance/ASSET_AND_BRAND_PROVENANCE.md` before introducing any visual asset.

## In progress

Phase 1 foundation. OIDC/JWKS token verification plus hosted login and hosted registration through authorisation-code-with-PKCE are implemented and tested as fail-closed API boundaries. The browser flow uses encrypted short-lived state, S256 PKCE, signed HttpOnly sessions and discards provider tokens. ZITADEL's asserted project-role and resource-owner claims are mapped only to recognised application roles. A verified `taxpayer` role now provisions one Rovyniq-owned tenant and one idempotent 2026 ITR12 workspace per identity subject; identity-provider organisations are not used as the public taxpayer data boundary. A protected raw-PDF upload route, document screen and authenticated return landing screen are implemented; upload remains 503 until identity, PostgreSQL, encrypted storage and isolated scanning are all configured. The Node API now allowlists and serves the same web assets for a Windows + Tailscale private household pilot; GitHub Pages remains no-data. A TLS-only tenant-scoped PostgreSQL adapter and advisory-lock migration runner are implemented but unconnected. An S3-compatible envelope-encrypted object-storage adapter is implemented but unconnected. An isolated ClamAV INSTREAM scanner adapter and tenant-matched scan-worker protocol are implemented but unconnected. Docker is not installed in this workspace, so the local stack is unrun.

The 16-section guided interview flow with PDF auto-fill is complete. A submission summary page (`submission.html`) shows all answers grouped by ITR12 form section with an estimated refund/liability calculation and a print button for eFiling handoff. The tax engine now has a `calculateFullEstimate` function covering employment, business, rental, investment, CGT, retirement, medical, travel, home office, donations, and other deductions. The ITR12 field mapping compliance doc (`docs/compliance/ITR12_FIELD_MAPPING.md`) maps each interview field to its ITR12 form section and SARS source codes.

## Next three tasks

1. Wire the submission page to the backend API so the engine runs server-side instead of duplicating calculation logic in the browser.
2. Add golden tests for each sub-rule in `calculateFullEstimate` (business, rental, CGT, medical, retirement, donation, travel, home office).
3. Build the approval snapshot flow: freeze answers into immutable state, generate a structured handoff package, and present the eFiling handoff guide.

## Decisions and risks

The return is ITR12. No public documented ITR12 submission API was found in the official research recorded below. Use manual eFiling handoff unless an authorised provider channel is documented and approved. No public documented EasyEquities customer tax-data API was located; support secure IT3 statement upload now and pursue a formal provider partnership later. Tax rules require practitioner verification before filing.

## Commands last run

`node --experimental-strip-types --input-type=module -e "…edge API contract…"` — passed (health 200; upload fails closed with 503). `npm.cmd run test:all` — passed: compliance checks plus 28 tests, 0 failures (2026-07-27). Docker was checked and is not installed.

## Repository

Initial foundation commit `3b1fa71` was pushed to `https://github.com/Jadax/Rovyniq` on branch `main` (2026-07-27). GitHub CLI is not installed in this workspace, so enabling the GitHub Pages repository setting remains a user action.
