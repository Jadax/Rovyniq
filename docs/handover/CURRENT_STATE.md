# Current state — 2026-07-27

## Completed

Phase 0 research register, SARS integration finding, compliance/security boundaries, architecture records, source-checked 2026 employment tax configuration, synthetic IRP5 reconciliation, Rovyniq/Astraiva branding, free self-hosted Phase 1 configuration, and a no-Docker GitHub Pages/Cloudflare Workers synthetic-preview path. The public preview has a responsive landing page plus a mobile-first, synthetic-data workspace preview with tax breakdown, review state and activity history; uploads and auto-filing remain explicitly disabled.

The published preview now uses an original CSS-only visual system with no remote fonts, third-party images, icon libraries or competitor assets. See `docs/compliance/ASSET_AND_BRAND_PROVENANCE.md` before introducing any visual asset.

## In progress

Phase 1 foundation. OIDC/JWKS token verification plus an authorisation-code-with-PKCE browser flow are implemented and tested as fail-closed API boundaries. The browser flow uses encrypted short-lived state, S256 PKCE, signed HttpOnly sessions and discards provider tokens. A protected raw-PDF upload route and matching document screen are implemented; the route remains 503 until identity, PostgreSQL, encrypted storage and isolated scanning are all configured. A TLS-only tenant-scoped PostgreSQL adapter and advisory-lock migration runner are implemented but unconnected. An S3-compatible envelope-encrypted object-storage adapter is implemented but unconnected. An isolated ClamAV INSTREAM scanner adapter and tenant-matched scan-worker protocol are implemented but unconnected. An authenticated return workspace is intentionally not yet implemented. Docker is not installed in this workspace, so the local stack is unrun.

## Next three tasks

1. In `Jadax/Rovyniq` Settings → Pages, select GitHub Actions to deploy the synthetic preview (`apps/web`).
2. Obtain legal/practitioner and production data-hosting approval before accepting any real documents.
3. Configure a production OIDC provider and same-origin application deployment, run reviewed PostgreSQL migrations, configure encrypted storage and isolated scanner, then connect the protected upload route and implement a full authenticated return-review workspace; replace the synthetic workspace data only after those controls pass.

## Decisions and risks

The return is ITR12. No public documented ITR12 submission API was found in the official research recorded below. Use manual eFiling handoff unless an authorised provider channel is documented and approved. No public documented EasyEquities customer tax-data API was located; support secure IT3 statement upload now and pursue a formal provider partnership later. Tax rules require practitioner verification before filing.

## Commands last run

`node --experimental-strip-types --input-type=module -e "…edge API contract…"` — passed (health 200; upload fails closed with 503). `npm.cmd run test:all` — passed: compliance checks plus 28 tests, 0 failures (2026-07-27). Docker was checked and is not installed.

## Repository

Initial foundation commit `3b1fa71` was pushed to `https://github.com/Jadax/Rovyniq` on branch `main` (2026-07-27). GitHub CLI is not installed in this workspace, so enabling the GitHub Pages repository setting remains a user action.
