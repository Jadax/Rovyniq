# Source register

**Retrieved:** 2026-07-27. Rules below require a South African tax practitioner review before production release. The 2026 assessment year is 2025-03-01 to 2026-02-28; do not substitute the 2027 (2026/27) values.

| Rule ID | Year | Primary source / section | Published/updated | Retrieved | Implementation | Tests | Status / reverify |
|---|---:|---|---|---|---|---|---|
| ZA-2026-FILING | 2026 | [SARS Filing Season](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/) | 2026 page | 2026-07-27 | filing config (planned) | planned | Verified; 2026-10-23 |
| ZA-2026-PIT-RATES | 2026 | [SARS 2026 employees’ tax tables](https://www.sars.gov.za/latest-news/2026-employees-tax-deduction-tables/) | 2025-03-12 | 2026-07-27 | `tax-rules/src/2026.ts` | `2026.test.ts`, engine tests | Provisional technical verification; 2026-10-23 |
| ZA-2026-REBATES | 2026 | [SARS Personal Income Tax](https://www.sars.gov.za/types-of-tax/personal-income-tax/) | current page | 2026-07-27 | `tax-rules/src/2026.ts` | engine tests | Provisional technical verification; 2026-10-23 |
| ZA-2026-MEDICAL | 2026 | [SARS Medical Credit Rates](https://www.sars.gov.za/tax-rates/medical-tax-credit-rates/) | 2026-02-25 | 2026-07-27 | `tax-rules/src/2026.ts` | planned medical golden tests | Provisional technical verification; 2026-10-23 |
| ZA-2026-ITR12 | 2026 | [Updated guides for Filing Season 2026](https://www.sars.gov.za/latest-news/updated-guides-for-filing-season-2026/) / IT-AE-36-G05 | 2026-06-29 | 2026-07-27 | question/mapping (planned) | planned | Verified index; retrieve guide PDF/page refs before implementation |
| ZA-2026-CGT-EXCLUSION | 2026 | [SARS Capital Gains Tax](https://www.sars.gov.za/types-of-tax/capital-gains-tax/) | current page | 2026-07-27 | `tax-rules/src/2026.ts` | planned | Provisional; 2026-10-23 |
| ZA-2026-MEDICAL-QME | 2026 | [SARS Medical Credit Rates](https://www.sars.gov.za/tax-rates/medical-tax-credit-rates/) | 2026-02-25 | 2026-07-27 | `tax-engine/src/index.ts` | planned | Provisional; 2026-10-23 |
| ZA-2026-DONATION-CAP | 2026 | [SARS Donations Deduction](https://www.sars.gov.za/types-of-tax/personal-income-tax/donations-deduction/) | current page | 2026-07-27 | `tax-rules/src/2026.ts` | planned | Provisional; 2026-10-23 |
| ZA-2026-FULL-ESTIMATE | 2026 | Internal aggregation of PIT rates, rebates, medical credits, CGT, and deduction rules | - | 2026-07-27 | `tax-engine/src/index.ts` | planned | Provisional; 2026-10-23 |

The current implementation covers employment estimate/reconciliation plus an expanded full-estimate function that aggregates employment, business, rental, investment, CGT, retirement, medical, travel, home office, donation, and other deduction rules. Each sub-rule requires independent golden tests before production release.
