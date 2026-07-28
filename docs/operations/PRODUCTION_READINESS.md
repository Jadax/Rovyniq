# Production readiness and customer journey

Rovyniq is designed around a verified identity, an isolated taxpayer tenant and an evidence-led ITR12 review. This is the intended public customer journey once the required infrastructure controls are live.

## What a customer does

1. Visit the Astraiva-owned Rovyniq domain and choose **Create account**.
2. Register through the hosted ZITADEL screen, verify the contact method and sign in.
3. The identity onboarding policy gives a verified self-service user only the base `taxpayer` role. On the first secure session, Rovyniq creates a private tenant and a 2026 ITR12 workspace. This operation is idempotent, so refreshes never create duplicate workspaces.
4. The customer uploads a supported PDF record. Rovyniq checks size and file signature, keeps an immutable encrypted original in quarantine and releases only a clean scan result for review.
5. Extracted information remains a candidate. The customer sees income, deductions, rebates, tax and evidence status separately, reviews the source material and approves changes explicitly.
6. Rovyniq prepares a reviewable ITR12 hand-off. It does not store SARS passwords or OTPs and does not claim to submit through an undocumented SARS API.

## Public-launch gates

Do not describe the service as production-ready to the public or accept public tax records until every gate below has an accountable owner and passing evidence.

- Use an Astraiva-owned domain, managed HTTPS edge, HSTS, WAF/rate limits, bot and abuse controls. Tailscale Serve remains limited to the private household pilot.
- Configure Neon PostgreSQL with TLS and run the reviewed migrations, including `0003_identity_tenants.sql`. Use a least-privilege application database role; never use a broad owner credential at runtime.
- Configure encrypted S3-compatible storage with an independently rotated 32-byte master key and an isolated ClamAV service. Exercise clean, malicious, timeout and replay cases with synthetic PDFs.
- Configure the ZITADEL post-registration role policy only after contact verification. The role is a base taxpayer role, never staff, practitioner or organisation-admin access. Existing users need a one-time role assignment or an approved migration path.
- Enable monitored backups, restore drills, audit-log retention, security alerts, incident response, privacy requests, retention/deletion rules and a POPIA review.
- Complete practitioner, legal and product review for every tax rule and every user-facing filing claim. Recheck official SARS guidance before each filing season.
- Run end-to-end staging tests: register, verify, sign in, automatic workspace creation, cross-user isolation, upload quarantine, malware failure, review, logout and recovery.

## Current pilot boundary

The current `tax-pilot.tailddedd2.ts.net` endpoint is a private Tailscale household pilot. It is useful for testing the real registration and login flow with two invited users, but it is not a commercial public endpoint. Uploads remain intentionally disabled until the database, encrypted storage and isolated malware scanner are configured.
