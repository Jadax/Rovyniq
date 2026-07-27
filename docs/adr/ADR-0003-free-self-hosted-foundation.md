# ADR-0003: Use free, self-hostable foundation services

**Date:** 2026-07-27  
**Status:** Accepted

## Context

Rovyniq needs a cost-free starting platform without embedding tax data in a proprietary integration.

## Decision

Use PostgreSQL for relational persistence, Keycloak as the external OIDC provider, and SeaweedFS behind an S3-compatible storage port. The local development stack is Compose-based. Keycloak publishes OIDC discovery/JWKS endpoints; PostgreSQL is freely usable under its permissive licence; SeaweedFS has an Apache-2.0 community repository and S3-compatible API. [Keycloak OIDC](https://www.keycloak.org/securing-apps/oidc-layers), [PostgreSQL](https://www.postgresql.org/docs/current/intro-whatis.html), [SeaweedFS](https://github.com/seaweedfs/seaweedfs)

## Consequences

No paid SaaS account is required for development. Docker Desktop or an equivalent container runtime is required locally. Deployment must pin image digests, move secrets to a manager, replace development Keycloak startup and complete backup/restore/security testing.
