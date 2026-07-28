# Cloud Run deployment

Cloud Run is Rovyniq's public application-hosting target. It runs the Node API independently of a developer computer and supplies the `PORT` and `K_SERVICE` environment variables. The server binds to `0.0.0.0` only in that managed environment; the local private pilot remains bound to loopback.

## Before connecting GitHub

1. Use a dedicated Google Cloud project owned by Astraiva and link a billing account with budget alerts.
2. Push the committed `Dockerfile`. It is built remotely by Cloud Build, so Docker Desktop is not required.
3. In Cloud Run, choose **Connect repository**, install the Google Cloud Build GitHub App for `Jadax/Rovyniq`, select the `main` branch and use the repository `Dockerfile`.
4. Deploy to `europe-west3` (Frankfurt) to stay close to the Neon database.
5. Configure these values as Cloud Run secrets/environment variables, never as committed files: OIDC settings, `DATABASE_URL`, `POSTGRES_SSL=true`, `RETURN_ASSESSMENT_YEAR=2026`, and `SESSION_COOKIE_SECRET`.
6. Do not set a minimum instance for the early pilot. Configure a maximum instance count and a billing budget. Cloud Run automatically starts an instance for requests and shuts it down while idle.

## Public-domain cutover

Keep the generated Cloud Run URL private while testing. Before announcing it, add an Astraiva-owned domain, update the exact ZITADEL callback and post-logout URLs, set an HTTPS-only cookie policy, and run the end-to-end registration/isolation checks in `PRODUCTION_READINESS.md`.

## Document safety

The deployed service intentionally returns `503` for document uploads until encrypted R2 storage and an isolated malware-scanning service are configured. Do not work around this with local disk storage or disable scanning.
