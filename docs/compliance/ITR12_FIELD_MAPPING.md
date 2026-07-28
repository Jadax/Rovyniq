# ITR12 field mapping

**Source:** [SARS IT-AE-36-G05 Comprehensive Guide to the ITR12 Income Tax Return for Individuals](https://www.sars.gov.za/wp-content/uploads/Ops/Guides/IT-AE-36-G05-Comprehensive-Guide-to-the-ITR12-Income-Tax-Return-for-Individuals-External-Guide.pdf)
**Assessment year:** 2026 (2025-03-01 to 2026-02-28)
**Retrieved:** 2026-07-27
**Status:** Draft mapping - verify against current ITR12 form and guide before production use

Maps each Rovyniq interview field to its ITR12 form section, SARS source codes, and the relevant page in the comprehensive guide.

---

## A: Form Wizard (gate questions)

These questions determine which sections of the ITR12 are displayed.

| Interview section | ITR12 wizard question | Guide ref |
|---|---|---|
| `about_you` (residency) | Are you an RSA tax resident? Date residency started/ceased | 4.1.2, 4.1.3 |
| `employment` (gate) | Did you receive income reflected on an IRP5/IT3(a)? | 4.1.5 |
| `investments` (gate) | Did you receive interest, dividends, REIT distributions? | 4.1.6 |
| `rental_income` (gate) | Did you derive income from letting fixed property? | 4.1.7 |
| `business_income` (gate) | Are you a director/member of a CC? | 4.1.9 |
| `other_income` (gate) | Did you receive any other income? | 4.1.14 |
| `capital_gains` (gate) | Did you dispose of any local/foreign assets? | 4.2.2 |
| `medical` (gate) | Did you pay medical expenditure? | 4.1.5(c) |
| `retirement_contributions` (gate) | Did you or your employer contribute to a retirement fund? | 4.1.5(d) |
| `travel_expenses` (gate) | Did you receive a travel/car allowance? | 4.1.5(e) |

---

## B: Taxpayer Details (ITR12 Part A)

| Interview field | ITR12 field / label | Source codes | Guide ref |
|---|---|---|---|
| `full_name` | Taxpayer name and surname | - | 5.1 |
| `id_number` | ID number / passport number | - | 5.1 |
| `tax_reference_number` | Tax reference number | - | 5.1 |
| `date_of_birth` | Date of birth | - | 5.1 |
| `contact_number` | Contact number | - | 5.1 |
| `email_address` | Email address | - | 5.1 |
| `residential_address` | Residential address | - | 5.3.3 |
| `tax_resident_status` | RSA tax resident (Y/N) + dates | - | 4.1.2 |
| `bank_name` | Bank name | - | 5.3 |
| `bank_account_number` | Bank account number | - | 5.3 |
| `bank_branch_code` | Branch code | - | 5.3 |
| `marital_status` | Marital status | - | 5.1 |
| `spouse_full_name` | Spouse full name | - | 5.1 |
| `spouse_id_number` | Spouse ID number | - | 5.1 |
| `dependants_count` | Number of dependants | - | - |

---

## C: Employment / IRP5/IT3(a) (ITR12 Part B)

Each `instance` of the employment section maps to one IRP5 certificate.

| Interview field | IRP5 source code | Description | Guide ref |
|---|---|---|---|
| `employer_name` | - | Employer name | 6 |
| `certificate_number` | - | IRP5 certificate number | 6 |
| `paye_reference` | - | PAYE reference number | 6 |
| `income_salary` | 3601 | Salary / wages | 6.1 |
| `income_non_taxable` | 3602 | Non-taxable income | 6.1 |
| `income_pension` | 3603 | Pension / annuity | 6.1 |
| `income_annual_payment` | 3605 | Bonus / annual payment | 6.1 |
| `gross_income` | 3699 | Total gross income (informational) | 6.1 |
| `paye_deducted` | 4102 | PAYE deducted | 6.3 |
| `uif_deducted` | 4141 | UIF contribution | 6.2 |
| `sdl_deducted` | 4142 | Skills Development Levy | 6.2 |
| `medical_credit_on_irp5` | 4116 | Medical scheme tax credit | 6.3 |
| `retirement_fund_contrib` | 4001 / 4005 | Retirement fund contributions | 6.2 |
| `periods_employed` | - | Periods worked (months) | 6.5 |
| `directive_number` | - | SARS directive number | 6.6 |

---

## D: Investment Income (ITR12 Part C)

| Interview field | Source code | Description | Guide ref |
|---|---|---|---|
| `local_interest` | 4201 / 4202 | Local interest | 7.1.2 |
| `foreign_interest` | 4203 | Foreign interest | 7.1.4 |
| `local_dividends` | 4204 | Local dividends (excluding exempt) | 7.1.7 |
| `foreign_dividends` | 4205 | Foreign dividends | 7.1.5 |
| `reit_distributions` | 4207 | REIT distributions | 7.1.6 |
| `institution_name` (TFSA) | - | TFSA institution | 4.1.12 |
| `total_contributions` (TFSA) | 4219 | TFSA contributions | 4.1.12 |
| `interest_earned` (TFSA) | 4241 | TFSA interest | 4.1.12 |
| `dividends_earned` (TFSA) | 4242 | TFSA dividends | 4.1.12 |

---

## E: Rental Income (ITR12 Part D)

| Interview field | Description | Guide ref |
|---|---|---|
| `property_count` | Number of properties let | 7.5 |
| `rental_income_total` | Gross rental income | 7.5.4 |
| `rental_expenses` | Rental expenses (bond interest, levies, rates, maintenance, agent fees) | 7.5.4 |

---

## F: Business & Freelance Income (ITR12 Part E)

| Interview field | Description | Guide ref |
|---|---|---|
| `business_type` | Nature of business/trade | 7.6 |
| `business_name` | Business/trade name | 7.6.1 |
| `total_income` | Gross business income | 7.6.4 |
| `total_expenses` | Business expenses | 7.6.9-7.6.16 |

---

## G: Capital Gains/Loss (ITR12 Part G)

| Interview field | Source code | Description | Guide ref |
|---|---|---|---|
| `proceeds` | - | Proceeds from disposal | 7.4 |
| `base_cost` | - | Base cost of asset | 7.4 |
| `capital_gain` | 4250 | Total capital gain | 7.4 |
| `capital_loss` | 4251 | Total capital loss | 7.4 |

---

## H: Other Income (ITR12 Part F)

| Interview field | Source code | Description | Guide ref |
|---|---|---|---|
| `alimony_received` | - | Alimony / maintenance | 7.15 |
| `trust_income` | 4208 / 4210 | Trust income | 7.3 |
| `foreign_employment_income` | - | Foreign employment income | 4.2.1 |
| `lump_sum_pension` | 3901 | Lump sum from retirement fund | 7.14 |

---

## I: Deductions (ITR12 Part I)

### I1: Retirement contributions

| Interview field | Source code | Description | Guide ref |
|---|---|---|---|
| `total_contribution` | 4006 | Retirement annuity fund contribution | 10.2 |
| `contribution_type` | - | RAF / Pension / Provident | 10.2 |

### I2: Travel allowance

| Interview field | Source code | Description | Guide ref |
|---|---|---|---|
| `travel_allowance_amount` | 3701 / 3702 | Travel / car allowance | 6.2 |
| `total_kilometers` | - | Total km for year | 10.6 |
| `business_kilometers` | - | Business km | 10.6 |
| `fuel_cost` | - | Fuel cost | 10.6 |
| `maintenance_cost` | - | Maintenance cost | 10.6 |

### I3: Home office

| Interview field | Description | Guide ref |
|---|---|---|
| `home_office_area` | Size of home office (m2) | 10.8 |
| `home_total_area` | Total home size (m2) | 10.8 |
| `home_office_expenses` | Total home office costs | 10.8 |
| `equipment_costs` | Work equipment | 10.8 |

### I4: Donations

| Interview field | Source code | Description | Guide ref |
|---|---|---|---|
| `donation_amount` | 4218 | Donations to PBO | 10.4 |

### I5: Other deductions

| Interview field | Description | Guide ref |
|---|---|---|
| `legal_fees` | Legal fees | 10.11 |
| `bad_debts` | Bad debts | 10.12 |

---

## J: Medical (ITR12 Part J)

| Interview field | Description | Guide ref |
|---|---|---|
| `scheme_name` | Medical scheme name | 10.3 |
| `membership_number` | Membership number | 10.3 |
| `members_count` | Principal + dependants per month | 10.3 |
| `total_contributions_paid` | Total contributions (code 4005) | 10.3 |
| `qualifying_expenses` | Qualifying medical expenses (QMEs) | 10.3 |
| `disability_expenses` | Disability expenses (if SARS-approved) | 10.3 |

---

## Source code summary

| Code | Description | Section |
|---|---|---|
| 3601 | Salary / wages | B |
| 3602 | Non-taxable income | B |
| 3603 | Pension / annuity | B |
| 3605 | Annual payment / bonus | B |
| 3699 | Gross employment income | B |
| 3701 | Travel allowance | I2 |
| 3702 | Car allowance | I2 |
| 3901 | Lump sum from retirement fund | H |
| 4001 | Pension fund contributions | B |
| 4005 | Medical scheme contributions | B / J |
| 4006 | Retirement annuity contributions | I1 |
| 4102 | PAYE | B |
| 4116 | Medical scheme tax credit | B |
| 4141 | UIF | B |
| 4142 | Skills Development Levy | B |
| 4201 | Local interest (exempt) | D |
| 4202 | Local interest (taxable) | D |
| 4203 | Foreign interest | D |
| 4204 | Local dividends | D |
| 4205 | Foreign dividends | D |
| 4207 | REIT distributions | D |
| 4208 | Trust income | H |
| 4210 | Trust income (capital) | H |
| 4218 | Donations | I4 |
| 4219 | TFSA contributions | D |
| 4241 | TFSA interest | D |
| 4242 | TFSA dividends | D |
| 4248 | TFSA withdrawals | D |
| 4250 | Capital gain | G |
| 4251 | Capital loss | G |
