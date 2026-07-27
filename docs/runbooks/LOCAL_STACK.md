# Free local stack

Rovyniq uses a free self-hosted development stack: PostgreSQL, Keycloak and SeaweedFS. Copy `.env.example` to `.env`, replace all development passwords, and start it with `docker compose up -d` once Docker Desktop is installed. Never use `start-dev`, `latest` tags or `.env` passwords in a deployed environment: pin image digests, use TLS and a secret manager, configure a persistent Keycloak database, and perform backup/restore tests.

After startup, configure a `rovyniq` realm and OIDC client in Keycloak. The API must validate issuer, audience, expiry and signature using the realm discovery/JWKS endpoint before it accepts a protected request. Create object-storage credentials with minimum required bucket policy; do not expose the S3 service publicly.
