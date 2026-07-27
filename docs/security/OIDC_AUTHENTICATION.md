# OIDC authentication foundation

## Implemented boundary

`apps/api/src/auth.ts` verifies OIDC access tokens with `jose`. It requires a configured issuer and audience, obtains signing keys from an explicit JWKS URI or the issuer's standard JWKS path, verifies token signature, issuer, audience and expiry, and exposes only a verified principal to application code.

## Required deployment configuration

- `OIDC_ISSUER`: trusted HTTPS issuer URL.
- `OIDC_AUDIENCE`: API audience identifier.
- `OIDC_JWKS_URI`: optional explicit JWKS endpoint.

Values belong in a deployment secret manager, never the GitHub Pages preview, repository, browser storage or client bundle.

## Not implemented yet

Authorisation-code-with-PKCE browser flow, callback handling, secure refresh-token strategy, user provisioning, session/device management, account recovery, MFA/passkeys, rate limiting and persistent audit records. No route that handles taxpayer data may be enabled before these controls and a production provider configuration are complete.
