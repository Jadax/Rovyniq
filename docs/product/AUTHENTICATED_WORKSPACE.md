# Authenticated workspace surface

`apps/web/app.html` is the protected return landing screen. It checks the same-origin session endpoint and starts the configured OIDC sign-in flow only when required. It contains no synthetic taxpayer data and no browser-persisted return data.

The screen deliberately displays an honest connection state until a tenant workspace, document list and deterministic tax breakdown are available through protected API routes. It links to the protected PDF document screen only when the caller supplies a valid workspace identifier.

GitHub Pages remains a static, no-data preview. Serve this screen only behind the same protected application origin as the API.
