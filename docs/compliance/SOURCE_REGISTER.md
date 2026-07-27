# Source register

**Retrieved:** 2026-07-27. Rules below require a South African tax practitioner review before production release. The 2026 assessment year is 2025-03-01 to 2026-02-28; do not substitute the 2027 (2026/27) values.

| Rule ID | Year | Primary source / section | Published/updated | Retrieved | Implementation | Tests | Status / reverify |
|---|---:|---|---|---|---|---|---|
| ZA-2026-FILING | 2026 | [SARS Filing Season](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/) | 2026 page | 2026-07-27 | filing config (planned) | planned | Verified; 2026-10-23 |
| ZA-2026-PIT-RATES | 2026 | [SARS 2026 employees’ tax tables](https://www.sars.gov.za/latest-news/2026-employees-tax-deduction-tables/) | 2025-03-12 | 2026-07-27 | `tax-rules/src/2026.ts` | `2026.test.ts`, engine tests | Provisional technical verification; 2026-10-23 |
| ZA-2026-REBATES | 2026 | [SARS Personal Income Tax](https://www.sars.gov.za/types-of-tax/personal-income-tax/) | current page | 2026-07-27 | `tax-rules/src/2026.ts` | engine tests | Provisional technical verification; 2026-10-23 |
| ZA-2026-MEDICAL | 2026 | [SARS Medical Credit Rates](https://www.sars.gov.za/tax-rates/medical-tax-credit-rates/) | 2026-02-25 | 2026-07-27 | `tax-rules/src/2026.ts` | planned medical golden tests | Provisional technical verification; 2026-10-23 |
| ZA-2026-ITR12 | 2026 | [Updated guides for Filing Season 2026](https://www.sars.gov.za/latest-news/updated-guides-for-filing-season-2026/) / IT-AE-36-G05 | 2026-06-29 | 2026-07-27 | question/mapping (planned) | planned | Verified index; retrieve guide PDF/page refs before implementation |

The current implementation deliberately covers only basic employment estimate/reconciliation. Retirement, CGT, medical calculation, TFI, source-code mapping and ITR12 validation remain unimplemented; adding them requires a source row and tests first.
