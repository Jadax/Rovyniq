# ADR-0002: Version tax rules by assessment year

**Date:** 2026-07-27  
**Status:** Accepted

## Context

The 2026 assessment year is 1 March 2025–28 February 2026, while filing occurs in 2026; later tax years have different values.

## Decision

Expose immutable tax-year configurations from `packages/tax-rules`, selected by assessment year. Rule records link to the source register and have a revalidation date.

## Consequences

No tax rate may be embedded in UI/controllers. Expired review must block a production release.
