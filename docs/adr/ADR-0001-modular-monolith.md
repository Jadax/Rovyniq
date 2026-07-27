# ADR-0001: Begin with an evidence-led modular monolith

**Date:** 2026-07-27  
**Status:** Accepted

## Context

The product handles highly sensitive tax records and needs testable boundaries before scale warrants distributed systems.

## Decision

Use TypeScript packages with dependency direction from adapters/UI into canonical domain and rule modules. Evidence provenance is mandatory for imported values.

## Alternatives

Microservices immediately; rejected due to operational and cross-service privacy complexity.

## Consequences

Modules must communicate through typed contracts; an outbox/persistence layer will be added before background jobs. This lowers tenant-leak and audit risk.
