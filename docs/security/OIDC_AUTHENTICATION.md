# OIDC authentication foundation

## Implemented boundary

`apps/api/src/auth.ts` verifies bearer access tokens with `jose`. `apps/api/src/browser-auth.ts` implements the browser authorisation-code flow with PKCE. It requires a configured issuer and audience, obtains signing keys from an explicit JWKS URI or the issuer's standard JWKS path, verifies token signature, issuer, audience and expiry, and exposes only a verified principal to application code.

## Required deployment configuration

- `OIDC_ISSUER`: trusted HTTPS issuer URL.
- `OIDC_AUDIENCE`: API audience identifier.
- `OIDC_JWKS_URI`: optional explicit JWKS endpoint.
- `OIDC_WEB_CLIENT_ID`, `OIDC_CALLBACK_URL`, `OIDC_AUTHORIZATION_ENDPOINT`, `OIDC_TOKEN_ENDPOINT`: browser OIDC client configuration.
- `OIDC_BROWSER_SCOPES`: requested browser scopes. For ZITADEL, include `urn:zitadel:iam:org:project:roles`; the verifier maps only recognised asserted role names and its trusted resource-owner claim.
- `SESSION_COOKIE_SECRET`: at least 32 random bytes, base64url encoded, stored only in the deployment secret manager.

The browser flow creates an encrypted five-minute state cookie and a signed ten-minute HttpOnly, SameSite session cookie. It validates the callback state, uses S256 PKCE, discards the provider tokens after identity verification, and accepts only same-origin relative return paths. Values belong in a deployment secret manager, never the GitHub Pages preview, repository, browser storage or client bundle.

## Not implemented yet

Secure refresh-token strategy, user provisioning, session/device management, account recovery, MFA/passkeys, rate limiting and persistent audit records are not implemented. No route that handles taxpayer data may be enabled before these controls and a production provider configuration are complete.
