# Rovyniq API

The API exposes a health endpoint, fail-closed bearer-token `/v1/me` endpoint, browser OIDC PKCE, protected return workspace routes and a document-ingestion boundary. It uses the maintained `jose` library to verify issuer, audience, expiry and signature against a configured JWKS; it never accepts a user identity directly from the browser.

For a protected same-origin web deployment, configure `OIDC_ISSUER`, `OIDC_AUDIENCE`, `OIDC_WEB_CLIENT_ID`, `OIDC_CALLBACK_URL`, `OIDC_AUTHORIZATION_ENDPOINT`, `OIDC_TOKEN_ENDPOINT`, `SESSION_COOKIE_SECRET`, and optionally `OIDC_JWKS_URI` through deployment secrets. `GET /v1/auth/start` starts PKCE; `GET /v1/auth/callback` exchanges the code and creates a ten-minute signed HttpOnly, SameSite session cookie; `GET /v1/session` returns only the verified principal plus the current user's Rovyniq-owned workspace when a verified `taxpayer` role and PostgreSQL are available. Provider access and refresh tokens are discarded.

Run `npm.cmd run migrate:postgres` after placing the TLS-enabled Neon connection string in the ignored `.env`. It applies reviewed migrations under an advisory lock. Document uploads remain fail-closed until PostgreSQL, envelope-encrypted object storage and the isolated ClamAV service are configured. GitHub Pages is a static no-data preview and must not route to this API.
