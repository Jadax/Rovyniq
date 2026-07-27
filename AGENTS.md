# Working agreement

Start with `README.md`, `docs/START_HERE.md`, `docs/handover/CURRENT_STATE.md`, then the relevant `docs/REPO_INDEX.yaml` entry. Do not scan the entire repository by default.

## Rules

- The official individual return is **ITR12**, never “ITR2”.
- Tax values belong only in `packages/tax-rules/src`; cite/review them in `docs/compliance/SOURCE_REGISTER.md`.
- The tax engine is deterministic. AI/extraction output is only a field candidate and cannot mutate an approved return.
- Do not invent SARS APIs, automate live eFiling, bypass security controls, retain passwords/OTPs, or add real taxpayer data.
- Preserve immutable originals; use synthetic fixtures only.
- Add/adjust tests for every rule or state transition, run `npm.cmd run test:all`, and update the handover/source register when changing a rule.

## Authoritative files

Domain types: `packages/canonical-tax-model/src/index.ts`; tax-year config: `packages/tax-rules/src/2026.ts`; engine: `packages/tax-engine/src/index.ts`; compliance evidence: `docs/compliance/SOURCE_REGISTER.md`; submission boundary: `docs/integrations/SARS_INTEGRATION_RESEARCH.md`.
