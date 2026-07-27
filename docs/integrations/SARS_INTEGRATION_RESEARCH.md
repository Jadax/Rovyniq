# SARS integration research — 2026-07-27

## Finding

No public, documented SARS ITR12 submission API, software-vendor API specification, or official OAuth-style integration documentation was located in the official SARS sources reviewed on 2026-07-27. SARS documents individual self-service via eFiling/MobiApp and publishes ITR12/eFiling guides, not a public vendor transport contract. This is evidence of **no public documented API found**, not proof that no restricted arrangement exists.

## Evidence

- [SARS Filing Season](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/) specifies individual filing channels and dates.
- [SARS Updated Guides for Filing Season 2026](https://www.sars.gov.za/latest-news/updated-guides-for-filing-season-2026/) links the ITR12 comprehensive and eFiling submission guides.
- [SARS Auto-Assessment](https://www.sars.gov.za/types-of-tax/personal-income-tax/filing-season/how-does-auto-assessment-work/) describes individual eFiling user interaction and third-party prepopulation.

## Channel distinction

| Channel | Status in product |
|---|---|
| Public documented ITR12 API | Not found; unsupported |
| Restricted partner/vendor interface | Unknown; require SARS written specification/approval |
| Practitioner eFiling access | Human authorised workflow only; not an API claim |
| User-authorised manual eFiling | Supported through controlled handoff package |
| Browser automation of live eFiling | Prohibited |

## Controls

Never bypass CAPTCHA, MFA, OTP, biometrics or device controls. Never request/store a SARS password or OTP. `OfficialSarsIntegrationProvider` remains disabled until written authorisation, credential design, terms review, security assessment and contract tests are complete.
