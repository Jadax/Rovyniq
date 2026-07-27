# ADR-0004: Make the tax breakdown a first-class, evidence-led product surface

**Date:** 2026-07-27  
**Status:** Accepted

## Context

Taxpayers need to see how supplied information becomes an estimated result, without mistaking it for a SARS assessment.

## Decision

Expose a tax-year-versioned breakdown of income, deductions, taxable income, normal tax, rebates/credits, PAYE and estimated balance. Each line must carry calculation trace entries and input provenance. UI labels all results as estimates until SARS assesses the return.

## Consequences

The deterministic engine, not UI or AI, supplies the figures. A line with missing/low-confidence material input must show the review state, not a falsely precise total.
