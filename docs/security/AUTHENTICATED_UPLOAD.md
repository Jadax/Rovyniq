# Authenticated document upload

`POST /v1/workspaces/{workspaceId}/documents` accepts a raw PDF body only on the protected application origin. It reads a maximum 10 MiB body, requires a verified HttpOnly browser session, derives the tenant solely from the verified principal, enforces workspace ownership and upload permission, and requires a client idempotency key. The route is disabled with `503` unless browser identity, PostgreSQL, encrypted object storage and ClamAV configuration are all present.

On an enabled deployment, the endpoint stores the PDF in immutable encrypted quarantine, persists document metadata and audit information, then performs a scan before returning `VALIDATED`, `ARCHIVED`, or `QUARANTINED`. It has no multipart parser, no public CORS policy, no browser storage of sensitive state, and no SARS credentials.

`apps/web/documents.html` is a same-origin protected application screen. It is intentionally not a working upload surface on GitHub Pages; that public site remains a no-data preview.
