# Secure document ingestion boundary

## Implemented policy

`packages/document-ingestion` accepts only PDF candidates up to 10 MiB that declare `application/pdf` and begin with the `%PDF-` signature. It sanitises the display filename, calculates a SHA-256 evidence hash, and records the item as `QUARANTINED` before it may be used by any extraction or tax workflow.

The scanner is a required port. A malicious verdict or an unavailable scanner is a hard failure. A clean verdict does not classify or extract information; it only allows a future trusted worker to perform the next state transition.

`DocumentIngestionService` adds the server-side orchestration boundary. It requires a verified principal whose organisation matches the tenant, checks the taxpayer workspace owner, applies document-upload permission, enforces a strong idempotency key, writes the immutable quarantine object, and persists a `document.quarantined` audit event. The scan worker reads only the quarantine object and records `VALIDATED` for a clean result or `ARCHIVED` for a malicious result while retaining the original for evidence and investigation.

## Required production sequence

1. Authenticate and authorise the workspace owner or permitted contributor server-side.
2. Enforce request size before reading the body; repeat content and PDF validation after upload.
3. Store the original immutably under the tenant's quarantine key with envelope encryption.
4. Persist document metadata, hash, tenant/workspace linkage and an audit event in one transaction.
5. Submit the quarantined object to an isolated malware scanner. Do not render, parse, OCR, index, download or send it to AI first.
6. On a clean result, retain the immutable original and enqueue a separate isolated classification/extraction job. Keep all extracted values as unapproved field candidates.

## Release gate

The API intentionally exposes no upload route yet. Enable one only after encrypted object storage, a transaction-capable database adapter, a malware-scanning implementation, rate limits, retention/deletion policy, security review and production data-hosting approval are complete.
