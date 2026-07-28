# Rovyniq

Evidence-led South African individual income-tax preparation for the **ITR12** return, created with heart by Tushant Sharma at Astraiva. The current milestone is a safe foundation, original no-data preview and a synthetic employment-certificate vertical slice for the 2026 year of assessment (1 March 2025 to 28 February 2026).

## Status

No live SARS integration exists. The product creates controlled manual eFiling handoff material only; the official integration adapter is disabled until SARS supplies an authorised, documented channel and credentials.

## Quick start

Requires Node 24+. Run `npm.cmd run test:all` in PowerShell. The domain/test foundation uses the maintained `jose` package for OIDC verification. The optional free local services require Docker Desktop (not installed in this workspace).

Read [docs/START_HERE.md](docs/START_HERE.md), then [docs/handover/CURRENT_STATE.md](docs/handover/CURRENT_STATE.md).

## Preview hosting

GitHub Pages can deploy the static preview automatically from `main` using `.github/workflows/deploy-pages.yml`. In repository **Settings to Pages**, select **GitHub Actions** as the publishing source. It will publish at `https://jadax.github.io/Rovyniq/` if the repository is public and Pages is enabled. This is strictly a no-data preview, not an upload or filing service.

For a two-person private household pilot without Docker or public compute, see [the Windows + Tailscale guide](docs/operations/PRIVATE_PILOT_TAILSCALE.md) and [its minimal local configuration template](.env.pilot.example). It is not a public deployment.

For an always-on public deployment that does not depend on a local computer, use the managed [Cloud Run deployment guide](docs/operations/CLOUD_RUN_DEPLOYMENT.md). Cloud Build builds the repository Dockerfile remotely; Docker Desktop is not required.

## Architecture

`packages/canonical-tax-model` owns evidence-linked return data. `packages/tax-rules` owns year-versioned statutory configuration. `packages/tax-engine` owns deterministic calculations and reconciliation. Adapters, UI, persistence and extraction depend inward on these packages.

## Safety boundary

This software estimates results from supplied information; it is not tax advice. Never store SARS passwords, OTPs, or production taxpayer documents in this repository.
