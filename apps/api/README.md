# Rovyniq API

The API exposes a health endpoint and a fail-closed OIDC `/v1/me` foundation. It uses the maintained `jose` library to verify issuer, audience, expiry and signature against a configured JWKS; it never accepts a user identity directly from the browser. Configure `OIDC_ISSUER`, `OIDC_AUDIENCE`, and optionally `OIDC_JWKS_URI` only through deployment secrets. It exposes no taxpayer data and has no upload/return routes.
