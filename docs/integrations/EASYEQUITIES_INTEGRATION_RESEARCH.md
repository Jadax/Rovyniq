# EasyEquities integration research — 2026-07-27

## Finding

No public, documented EasyEquities developer API or OAuth-style customer-data API was located in EasyEquities’ official public help centre, website or developer materials reviewed on 2026-07-27. This is a finding about public documentation, not proof that no restricted partnership programme exists.

## Evidence

- EasyEquities tells customers to obtain IT3(b), IT3(c) and IT3(s) tax statements/certificates from the Statements area of their account. [Tax education: statements](https://blogs.easyequities.co.za/tax-education-101-statements)
- EasyEquities describes APIs used for distribution-channel partnerships (including Capitec, Discovery Bank and Telkom), but does not publish a customer-tax-data integration contract. [Platform evolution](https://blogs.easyequities.co.za/the-evolution-of-the-easyequities-platform)

## Product decision

1. **Now:** accept a taxpayer-provided IT3 statement/certificate through the secure ingestion workflow when implemented; extract source codes and preserve evidence.
2. **Never:** scrape the EasyEquities website/app, imitate a browser login, store an EasyEquities password, request an OTP, or use undocumented endpoints.
3. **Later:** approach EasyEquities for a written, consent-based partnership/API arrangement. Require documented scope, OAuth/authorisation design, data-processing terms, rate limits, security review, revocation and sandbox/contract tests before enabling an adapter.

## Integration status

`OfficialEasyEquitiesIntegrationProvider` is not implemented and must remain feature-disabled until the prerequisites above exist. The manual statement upload path is the supported route.
