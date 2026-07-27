# Start here

## Current state

Rovyniq, created with ♥ by Tushant Sharma at Astraiva, is a Phase 0/early Phase 1 foundation. It has a canonical evidence model, tax-year registry, deterministic employment tax estimate, IRP5 reconciliation, submission-provider port, synthetic fixtures and executable tests. It does not yet authenticate users, persist data, accept uploads, render a UI, or submit to SARS.

## Architecture map

- `packages/canonical-tax-model`: stable types, provenance and state transitions.
- `packages/tax-rules`: reviewed, versioned 2026 configuration.
- `packages/tax-engine`: calculations and no-double-count reconciliation.
- `packages/sars-adapters`: manual handoff, disabled official port and mock provider.
- `docs/`: decisions, security, compliance and operational handover.

## Active milestone

Phase 1 platform direction is selected: self-hosted Keycloak (OIDC), PostgreSQL and SeaweedFS (S3-compatible storage), all with free/open-source routes. Docker Desktop remains required to run the local stack. The next working slice is document ingestion for synthetic IRP5 PDFs.

## Key decisions

Use a TypeScript modular monolith. No vendor-specific SARS API is assumed. Use explicit evidence references and immutable approval snapshots before a submission package can exist. All 2026 values remain configuration, not controller/UI constants.

## Known blockers

Human South African tax review is required before production use. An official SARS API/partner specification and legal authority are prerequisites for automated integration. Production supplier/security choices need approval.
