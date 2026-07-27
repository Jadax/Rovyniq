# Threat model

| Threat | Primary controls |
|---|---|
| Account takeover / identity theft | Mature identity provider, passkeys where feasible, re-auth for export/submission/bank changes, session/device management |
| Malicious file | MIME/content validation, quarantine, malware scan, isolated rendering, immutable originals |
| Prompt injection / model hallucination | Treat documents as untrusted, structured schemas, no tool authority from model output, human confirmation |
| Cross-tenant leak / insider access | Tenant predicates at database layer, RBAC/ABAC, redacted support views, audit logs |
| Refund manipulation / certificate tampering | Evidence links, hashes, immutable snapshots, audit history, reviewer escalation |
| Submission replay | Idempotency keys, state machine, approved snapshot hash |
| Supply chain / excess retention | locked dependencies, scans/SBOM, environment separation, retention/deletion policy |
| Unsupported SARS automation | disabled provider, written-authorisation gate, no credential/OTP storage |
