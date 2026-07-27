# ADR-0005: Delegate public authentication to an OIDC provider

**Date:** 2026-07-27  
**Status:** Accepted

## Context

Rovyniq must authenticate taxpayers without implementing password storage, token issuance or cryptography itself.

## Decision

Use an external OIDC provider. The API verifies access-token issuer, audience, expiry and signature against the provider JWKS using the maintained `jose` library. It maps only recognised roles and fails closed if identity configuration or a bearer token is absent/invalid. Browser sign-in uses the authorisation-code flow with S256 PKCE, encrypted five-minute callback state, and a signed ten-minute HttpOnly session. Provider access and refresh tokens are discarded after identity verification.

## Consequences

The static GitHub Pages preview cannot be an authenticated product. A protected, same-origin web/API deployment and configured OIDC issuer are required before any protected workspace or upload route goes live. Provider setup must enable MFA/passkeys where available, secure redirect URIs, short access-token lifetimes, refresh-token rotation, session/device management and audit logging.
