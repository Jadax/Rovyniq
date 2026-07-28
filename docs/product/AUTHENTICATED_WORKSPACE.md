# Authenticated workspace surface

`apps/web/app.html` is the protected return landing screen. It checks the same-origin session endpoint and starts the configured OIDC sign-in flow only when required. It contains no synthetic taxpayer data and no browser-persisted return data.

When a verified ZITADEL principal carries the `taxpayer` role, `GET /v1/session` idempotently creates a Rovyniq-owned tenant and its first 2026 ITR12 workspace. The browser receives only the opaque workspace identifier. A ZITADEL organisation is deliberately not used as the data boundary because a public consumer identity organisation can contain unrelated taxpayers.

The document routes resolve the principal back to that owned tenant and reject any workspace identifier that is not the caller's workspace. The screen then links to the protected PDF document page. It never trusts a client-supplied tenant ID.

GitHub Pages remains a static, no-data preview. Serve this screen only behind the same protected application origin as the API.
