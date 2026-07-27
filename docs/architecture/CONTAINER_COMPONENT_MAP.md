# Container/component map

Planned containers: web, TypeScript API/modular monolith, worker, PostgreSQL, SeaweedFS S3-compatible object storage, Keycloak OIDC and Redis-compatible queue when justified. `compose.yaml` supplies the free local service foundation; Docker is unavailable in this workspace. Dependencies flow: web/API/worker → adapters → canonical model/tax engine/tax rules.
