import type { QuestionSection } from "../../canonical-tax-model/src/index.ts";

export const sections: QuestionSection[] = [
  {
    id: "employment",
    title: "Employment & Salary",
    description: "IRP5 / IT3(a) employment certificates",
    icon: "💼",
    gateQuestion: {
      id: "has_irp5",
      text: "Did you receive an IRP5 or IT3(a)? Answer Yes if you earned a salary, wages, commission, pension, annuity or received payments from an employer or retirement fund during the 2026 tax year.",
      helpText: "Have you received an IRP5 / IT3(a) tax certificate for this income / payment from your employer or fund?"
    },
    allowMultiple: true,
    multipleLabel: "IRP5 / IT3(a) certificate",
    fields: [
      { id: "employer_name", type: "text", text: "Please enter the name of your employer or fund, as it appears on your IRP5 / IT3(a).", placeholder: "e.g. North Highland South Africa Pty Ltd", helpText: "If it is not displayed, or you can't find it, just type in the company name." },
      { id: "certificate_number", type: "text", text: "Please enter the certificate number as displayed on the IRP5/IT3(a).", placeholder: "e.g. 770080188120260221000000000027" },
      { id: "paye_reference", type: "text", text: "Please enter the employer's PAYE number as displayed on the IRP5 / IT3(a). This number begins with a 7 and is 10 digits in length.", placeholder: "e.g. 7700801881", helpText: "Can't find it? Click here for help", validation: { pattern: "^[0-9]{10}$", message: "Digits only. Letters and symbols are not allowed." } },
      { id: "income_codes", type: "codes", text: "Please enter your income amounts, along with their source codes.", sourceCodes: ["3601","3602","3603","3604","3605"], helpText: "Incomes have a source code that starts with a 3. Don't enter source code 3696, 3699 yet.", placeholder: "e.g. 708333 3601" },
      { id: "non_taxable_income", type: "currency", text: "Please enter the amount for Non-taxable income - source code 3696.", sourceCodes: ["3696"], helpText: "This may appear under a section called \"Income Received Continued\"." },
      { id: "gross_employment_income", type: "currency", text: "Please enter the amount for Gross Employment Income (Taxable) - source code 3699.", sourceCodes: ["3699"], helpText: "If there is no amount there, please look again. Most taxpayers will have an amount next to this source code on their IRP5s." },
      { id: "deduction_codes", type: "codes", text: "On your IRP5 / IT3(a), under Deductions / Contributions, please enter all amounts along with their source codes. ONLY enter source codes beginning with 4.", sourceCodes: ["4001","4003","4005","4006","4473","4474","4475"], helpText: "Do NOT enter amounts for source codes 4102, 4141, 4142, 4149 & 4116 here." },
      { id: "paye_amount", type: "currency", text: "Please enter your PAYE (Pay-as-you-earn): source code 4102.", sourceCodes: ["4102"], helpText: "PAYE is also known as Employees Tax. On your IRP5 / IT3(a), it reflects under a section called Tax Paid." },
      { id: "paye_lump_sum", type: "currency", text: "Please enter your PAYE tax on lump sum benefit: source code 4115.", sourceCodes: ["4115"] },
      { id: "uif_contribution", type: "currency", text: "Please enter your employee and employer UIF contribution: source code 4141.", sourceCodes: ["4141"] },
      { id: "sdl_contribution", type: "currency", text: "Please enter your employer SDL contribution: source code 4142.", sourceCodes: ["4142"] },
      { id: "total_tax_sdl_uif", type: "currency", text: "Please enter your total tax, SDL and UIF: source code 4149.", sourceCodes: ["4149"] },
      { id: "medical_tax_credit", type: "currency", text: "Please enter your Medical Scheme Tax credit, as reflected on your IRP5. This would be next to source code 4116.", sourceCodes: ["4116"], helpText: "Do NOT enter amounts from your medical aid tax certificate, this must be completed under the medical section." },
      { id: "source_code_4120", type: "currency", text: "Please enter the amount next to source code 4120.", sourceCodes: ["4120"] },
      { id: "reason_4150", type: "select", text: "Do you have a two digit code displayed next to the source code 4150 (reason for non-deduction of employee's tax)?", sourceCodes: ["4150"], options: [{ label: "None", value: "" }, { label: "Yes", value: "yes" }, { label: "No", value: "no" }] },
      { id: "voluntary_paye_over_deduction", type: "yesno", text: "Was there a voluntary over-deduction of PAYE from your income?", helpText: "This applies if you asked your employer to deduct additional PAYE from your salary each month." },
      { id: "periods_in_year", type: "number", text: "In your Pay Periods section, enter the number next to Periods in Year of Assessment, Periods in Tax Year, Assessment Year Periods or similar.", sourceCodes: ["periods"], helpText: "SARS requires you to enter the dates you worked, as reflected on your IRP5 tax certificate." },
      { id: "periods_worked", type: "number", text: "On your IRP5 / IT3(a), near the previous entry is Number of Periods Worked or just Periods Worked. Please enter this number now." },
      { id: "start_date", type: "date", text: "Please enter the earliest date within the 2026 tax year that you were employed from as per your IRP5/IT3(a).", placeholder: "DD/MM/YYYY", helpText: "This is likely on or after 1 March 2025." },
      { id: "end_date", type: "date", text: "Please enter the latest date within the 2026 tax year that you were employed until, as per your IRP5/IT3(a).", placeholder: "DD/MM/YYYY", helpText: "This is likely 28th February 2026." },
      { id: "directive_number", type: "text", text: "You may see a block at the bottom right or left of your IRP5 / IT3(a) saying Directive Number. If there is a directive number, please enter it.", helpText: "Please complete the tax directive numbers one at a time for the applicable IRP5 tax certificate." }
    ]
  },
  {
    id: "interest_investments",
    title: "Interest & Investments",
    description: "IT3(b) interest and dividend certificates",
    icon: "📈",
    gateQuestion: {
      id: "has_interest_investments",
      text: "Did you earn any local or foreign interest, or foreign dividends from shares, or get a distribution payment from a REIT?",
      helpText: "If yes, you should have received an IT3(b). Local interest from a Tax Free Savings Account does not go in this section."
    },
    allowMultiple: false,
    fields: [
      { id: "local_interest", type: "currency", text: "Please enter local interest earned during the 2026 tax year.", sourceCodes: ["4201","4202"], helpText: "Local interest from a Tax Free Savings Account does not go in this section." },
      { id: "foreign_interest", type: "currency", text: "Please enter foreign interest earned during the 2026 tax year.", sourceCodes: ["4203"] },
      { id: "foreign_dividends", type: "currency", text: "Please enter foreign dividends received from shares.", sourceCodes: ["4205"] },
      { id: "reit_distribution", type: "currency", text: "Please enter distribution payments received from a REIT (Real Estate Investment Trust).", sourceCodes: ["4207"] },
      { id: "local_dividends", type: "currency", text: "Please enter local dividends received.", sourceCodes: ["4204"] }
    ]
  },
  {
    id: "non_taxable_income",
    title: "Non-Taxable Income",
    description: "Exempt income, inheritances, donations",
    icon: "🛡️",
    gateQuestion: {
      id: "has_non_taxable_income",
      text: "Did you receive any income that is exempt from tax?",
      helpText: "This includes foreign pensions, inheritances, donations, exempt local and foreign dividends, insurance payouts, and scholarships or bursaries. It excludes income earned from a South African company."
    },
    allowMultiple: false,
    fields: [
      { id: "foreign_pension", type: "currency", text: "Please enter foreign pension income received (exempt from tax).", sourceCodes: ["3693"] },
      { id: "inheritance_amount", type: "currency", text: "Please enter inheritance or donation amounts received." },
      { id: "scholarship_amount", type: "currency", text: "Please enter scholarship or bursary amounts received.", sourceCodes: ["3602"] },
      { id: "insurance_payout", type: "currency", text: "Please enter insurance payout amounts received." }
    ]
  },
  {
    id: "trust_income",
    title: "Trust Beneficiary Income",
    description: "Income vested from a trust",
    icon: "🤝",
    gateQuestion: {
      id: "has_trust_income",
      text: "Did you receive income as a beneficiary of a trust or because the income vests in your name?"
    },
    allowMultiple: false,
    fields: [
      { id: "trust_income_amount", type: "currency", text: "Please enter the total trust beneficiary income received.", sourceCodes: ["4208","4210"] },
      { id: "trust_name", type: "text", text: "Please enter the name of the trust." },
      { id: "trust_sars_reg_number", type: "text", text: "Please enter the trust's SARS registration number if available." }
    ]
  },
  {
    id: "medical",
    title: "Medical Expenses",
    description: "Medical aid, contributions, qualifying expenses",
    icon: "🏥",
    gateQuestion: {
      id: "has_medical_expenses",
      text: "Did you have any medical expenses for the 2026 tax year?",
      helpText: "This includes payments to a medical aid or hospital plan, as well as other Qualifying Medical Expenses paid by yourself for you or an immediate family member. It does not include medical insurance e.g. Gap cover."
    },
    allowMultiple: true,
    multipleLabel: "Medical certificate",
    fields: [
      { id: "medical_scheme_name", type: "select", text: "Please select your medical scheme name from the drop-down list.", sourceCodes: ["scheme_name"], helpText: "SARS document requirements: Medical aid contributions certificate from medical provider / scheme.", options: [
        { label: "CHARTERED ACCOUNTANTS (SA) MEDICAL AID FUND (CAMAF)", value: "CAMAF" },
        { label: "DISCOVERY HEALTH MEDICAL SCHEME", value: "DISCOVERY" },
        { label: "BONITAS MEDICAL SCHEME", value: "BONITAS" },
        { label: "MOMENTUM HEALTH MEDICAL SCHEME", value: "MOMENTUM" },
        { label: "MEDSCHEME MEDICAL SCHEME", value: "MEDSCHEME" },
        { label: "GEMS", value: "GEMS" },
        { label: "LIBERTY MEDICAL SCHEME", value: "LIBERTY" },
        { label: "Other", value: "OTHER" }
      ] },
      { id: "medical_membership_number", type: "text", text: "Please state the Medical Scheme Membership Number.", helpText: "Can't find it? Click here for help.", validation: { pattern: "^.{5,36}$", message: "Use 5-36 characters." } },
      { id: "medical_members_mar", type: "number", text: "Please enter the number of members covered by this medical aid in March 2025.", validation: { pattern: "^[0-9]+$", message: "Digits only. Letters and symbols are not allowed." } },
      { id: "medical_members_apr", type: "number", text: "Please enter the number of members for April 2025." },
      { id: "medical_members_may", type: "number", text: "Please enter the number of members for May 2025." },
      { id: "medical_members_jun", type: "number", text: "Please enter the number of members for June 2025." },
      { id: "medical_members_jul", type: "number", text: "Please enter the number of members for July 2025." },
      { id: "medical_members_aug", type: "number", text: "Please enter the number of members for August 2025." },
      { id: "medical_members_sep", type: "number", text: "Please enter the number of members for September 2025." },
      { id: "medical_members_oct", type: "number", text: "Please enter the number of members for October 2025." },
      { id: "medical_members_nov", type: "number", text: "Please enter the number of members for November 2025." },
      { id: "medical_members_dec", type: "number", text: "Please enter the number of members for December 2025." },
      { id: "medical_members_jan", type: "number", text: "Please enter the number of members for January 2026." },
      { id: "medical_members_feb", type: "number", text: "Please enter the number of members for February 2026." },
      { id: "medical_contributions", type: "currency", text: "Have a look at the Tax Certificate your medical scheme sent you. Do you see an amount for Contributions? Enter the total amount you paid for the tax year (total contributions).", sourceCodes: ["4005","4116"], helpText: "If there is no amount on your Medical Aid Certificate for contributions, have a look at your IRP5 for amounts next to source code 4005. Enter that amount now." },
      { id: "medical_uncovered_claims", type: "currency", text: "Have a look at your Medical Aid Certificate, did you have any claims which your Medical Aid would not cover, but you paid for yourself?", helpText: "Can't find it? Click here for help." }
    ]
  },
  {
    id: "retirement_contributions",
    title: "Retirement Contributions",
    description: "RAF, pension and provident fund contributions",
    icon: "🏦",
    gateQuestion: {
      id: "has_retirement_contributions",
      text: "Did you contribute to a Retirement Annuity Fund (RAF)? Or, did you make additional contributions on your own to a Pension/Provident fund which were not processed by your employer as salary deductions?",
      helpText: "Not sure? If your IRP5 shows source code 4006, click Yes."
    },
    allowMultiple: true,
    multipleLabel: "Retirement contribution",
    fields: [
      { id: "fund_name", type: "text", text: "Please enter the name of the Fund. You will find this on the IT3(f) Tax Certificate received from your fund.", helpText: "Please make sure this is a Retirement Annuity Fund. Funds at Work is NOT a RAF." },
      { id: "fund_membership_number", type: "text", text: "Please enter the Policy/Membership Number of the fund. You will find this on the IT3(f) Tax Certificate received from your fund." },
      { id: "total_contribution", type: "currency", text: "Please enter the total contribution in RANDS made to this Retirement Annuity Fund for the 2026 tax year as per the IT3(f) tax certificate.", sourceCodes: ["4006"], helpText: "SARS document requirements: Retirement Annuity Fund / RAF certificate." },
      { id: "additional_pension_contributions", type: "currency", text: "Did you make additional contributions to your Pension and/or Provident fund? These would be voluntary contributions you made, in addition to your normal salary deductions." }
    ]
  },
  {
    id: "home_office_deductions",
    title: "Home Office & Other Deductions",
    description: "Commission earner or independent contractor expenses",
    icon: "🏠",
    gateQuestion: {
      id: "has_home_office_deductions",
      text: "Do you have any other expenses that might be claimed as a tax deduction such as depreciation or home office expenses?",
      helpText: "If you are a Commission Earner or Independent Contractor then click No to this section, you will be asked later."
    },
    allowMultiple: false,
    fields: [
      { id: "home_office_area", type: "number", text: "What is the area of your home office in square metres?", suffix: "m²" },
      { id: "total_home_area", type: "number", text: "What is the total area of your home in square metres?", suffix: "m²" },
      { id: "home_office_rent", type: "currency", text: "Please enter the total rent paid for the year (if applicable)." },
      { id: "home_office_electricity", type: "currency", text: "Please enter the total electricity costs for the year." },
      { id: "home_office_internet", type: "currency", text: "Please enter the total internet costs for the year." },
      { id: "home_office_consumables", type: "currency", text: "Please enter the total costs for consumables (stationery, printer ink, etc.)." },
      { id: "depreciation_asset", type: "text", text: "Describe any assets you are claiming depreciation on (e.g. laptop, printer)." },
      { id: "depreciation_amount", type: "currency", text: "Please enter the total depreciation amount you wish to claim." }
    ]
  },
  {
    id: "donations",
    title: "Donations to Charity",
    description: "PBO donations and tax certificates",
    icon: "🎗️",
    gateQuestion: {
      id: "has_donations",
      text: "Did you make any donations during the year to a Public Benefit Organisation (PBO) or charity as reflected on a tax certificate received from them?",
      helpText: "The certificate must show a PBO number. The NPO number is NOT the PBO number."
    },
    allowMultiple: true,
    multipleLabel: "Donation",
    fields: [
      { id: "donation_amount", type: "currency", text: "Please enter the total donation amount.", sourceCodes: ["4218"] },
      { id: "pbo_number", type: "text", text: "Please enter the PBO number as shown on the tax certificate.", validation: { pattern: "^[0-9]{5,}$", message: "PBO numbers are numeric." } },
      { id: "charity_name", type: "text", text: "Please enter the name of the organisation." }
    ]
  },
  {
    id: "travel_allowance",
    title: "Travel Allowance",
    description: "Employer-paid travel or vehicle allowance",
    icon: "🚗",
    gateQuestion: {
      id: "has_travel_allowance",
      text: "Do you receive a travel allowance from your employer which is coded to source code 3701 or 3702 on your IRP5?",
      helpText: "Click Yes if you have an IRP5 displaying source codes 3802 or 3816, and if you kept a vehicle logbook."
    },
    allowMultiple: false,
    fields: [
      { id: "travel_allowance_amount", type: "currency", text: "Please enter the total travel allowance received.", sourceCodes: ["3701","3702"] },
      { id: "vehicle_make_model", type: "text", text: "Please enter the make and model of the vehicle." },
      { id: "vehicle_cost", type: "currency", text: "Please enter the original cost of the vehicle (including VAT)." },
      { id: "total_km_travelled", type: "number", text: "Please enter the total kilometres travelled during the tax year.", suffix: "km" },
      { id: "business_km", type: "number", text: "Please enter the business kilometres travelled.", suffix: "km" },
      { id: "logbook_maintained", type: "yesno", text: "Did you maintain a logbook throughout the year?" }
    ]
  },
  {
    id: "capital_gains",
    title: "Capital Gains / Losses",
    description: "Sale of assets, shares, crypto or property",
    icon: "📊",
    gateQuestion: {
      id: "has_capital_gains",
      text: "Did you sell any assets including investments, shares, cryptocurrency or property during the tax year?",
      helpText: "If you sold shares you will have an IT3(c) certificate which may have gain/loss codes 4250 or 4251 on it."
    },
    allowMultiple: false,
    fields: [
      { id: "total_capital_gain", type: "currency", text: "Please enter the total capital gain for the year.", sourceCodes: ["4250"] },
      { id: "total_capital_loss", type: "currency", text: "Please enter the total capital loss for the year.", sourceCodes: ["4251"] },
      { id: "asset_description", type: "text", text: "Please describe the main asset(s) sold." },
      { id: "proceeds_amount", type: "currency", text: "Please enter the total proceeds from the sale." },
      { id: "cost_amount", type: "currency", text: "Please enter the total cost / base cost of the assets sold." }
    ]
  },
  {
    id: "director_self_employed",
    title: "Director / Self-Employed",
    description: "Business, freelance, foreign income",
    icon: "👔",
    gateQuestion: {
      id: "is_director_self_employed",
      text: "Are you the director of a Private Company or a member of a Close Corporation? Are you self-employed, freelancing, a sole-proprietor or do you earn money as an Independent Contractor or earn foreign income?"
    },
    allowMultiple: false,
    fields: [
      { id: "business_type", type: "select", text: "Please select your business type.", options: [
        { label: "Director of Private Company", value: "director" },
        { label: "Close Corporation member", value: "cc_member" },
        { label: "Sole Proprietor", value: "sole_proprietor" },
        { label: "Independent Contractor", value: "independent_contractor" },
        { label: "Freelancer", value: "freelancer" },
        { label: "Foreign income earner", value: "foreign_income" }
      ] },
      { id: "business_income", type: "currency", text: "Please enter the total business or freelance income received." },
      { id: "business_expenses", type: "currency", text: "Please enter the total business-related expenses." }
    ]
  },
  {
    id: "unemployed_periods",
    title: "Unemployed Periods",
    description: "Periods out of work during the tax year",
    icon: "📅",
    gateQuestion: {
      id: "was_employed_full_year",
      text: "Were you employed for the full 12 months of the 2026 tax year?",
      helpText: "Answer Yes if your IRP5 / IT3(a) covers 12 months, including pensioner income. If you are a South African tax resident working overseas for the full tax year, answer Yes."
    },
    allowMultiple: false,
    fields: [
      { id: "unemployed_start", type: "date", text: "Please enter the start date of your first period of unemployment.", placeholder: "DD/MM/YYYY" },
      { id: "unemployed_end", type: "date", text: "Please enter the end date of your first period of unemployment.", placeholder: "DD/MM/YYYY" },
      { id: "unemployed_reason", type: "text", text: "Please explain the reason for the period of unemployment." }
    ]
  },
  {
    id: "marriage_community_property",
    title: "Marriage in Community of Property",
    description: "Marital property regime",
    icon: "💍",
    gateQuestion: {
      id: "is_married_community_property",
      text: "Are you married in Community of Property?"
    },
    allowMultiple: false,
    fields: [
      { id: "spouse_name", type: "text", text: "Please enter your spouse's full name." },
      { id: "spouse_id_number", type: "text", text: "Please enter your spouse's ID number." },
      { id: "spouse_income", type: "currency", text: "Please enter your spouse's total income for the 2026 tax year." }
    ]
  },
  {
    id: "tax_free_savings",
    title: "Tax Free Savings Account",
    description: "IT3(s) certificate from your TFSA provider",
    icon: "💰",
    gateQuestion: {
      id: "has_tfsa",
      text: "Did you pay into a Tax Free Savings Account during the 2026 tax year?",
      helpText: "A Tax Free Savings Account is not a Retirement Annuity. It is also not a normal bank savings account or a money market account. You must be in possession of an IT3(s) to complete this section."
    },
    allowMultiple: true,
    multipleLabel: "IT3(s)",
    fields: [
      { id: "tfsa_institution", type: "text", text: "Please enter the name of the institution.", sourceCodes: ["institution"] },
      { id: "tfsa_policy_number", type: "text", text: "Please enter the policy number." },
      { id: "tfsa_investment_type", type: "text", text: "Please enter the investment type.", placeholder: "e.g. TFSA" },
      { id: "tfsa_withdrawal", type: "currency", text: "Did you withdraw any amounts out of your Tax Free Savings Account? This should appear next to 4248 on your IT3(s).", sourceCodes: ["4248"] },
      { id: "tfsa_total_contributions", type: "currency", text: "Please enter the total of all the contributions you made to a Tax Free Savings Account for the 2026 tax year. This should appear next to source code 4219 on your certificate(s).", sourceCodes: ["4219"], helpText: "SARS document requirements: Tax Free Savings Certificate - IT3s" },
      { id: "tfsa_profit_loss", type: "select", text: "Did the investment make a profit or loss?", options: [
        { label: "Profit", value: "profit" },
        { label: "Loss", value: "loss" },
        { label: "Neither", value: "neither" }
      ] },
      { id: "tfsa_interest_earned", type: "currency", text: "Please enter the interest earned on the Tax Free Savings Account. This should appear next to source code 4241 on your certificate.", sourceCodes: ["4241"] },
      { id: "tfsa_dividends_earned", type: "currency", text: "Please enter the dividends earned on the Tax Free Savings Account. This should appear next to source code 4242 on your certificate.", sourceCodes: ["4242"] },
      { id: "tfsa_capital_gain", type: "select", text: "Did the Tax Free Savings Account make a Capital Gain or Capital Loss?", options: [
        { label: "Capital Gain", value: "gain" },
        { label: "Capital Loss", value: "loss" },
        { label: "Neither", value: "neither" }
      ] },
      { id: "tfsa_other_amounts", type: "currency", text: "Were there any other amounts on the Tax Free Savings Certificate? This should appear next to source code 4257 on your certificate.", sourceCodes: ["4257"] }
    ]
  },
  {
    id: "financial_wellness",
    title: "Financial Wellness",
    description: "Optional personalised financial tips",
    icon: "🧘",
    gateQuestion: {
      id: "wants_financial_tips",
      text: "Would you like personalised financial tips to help you achieve your financial goals?",
      helpText: "This has nothing to do with your tax return - it's completely optional."
    },
    allowMultiple: false,
    fields: [
      { id: "fw_own_home", type: "yesno", text: "Do you own the home that you live in?" },
      { id: "fw_car_insured", type: "yesno", text: "Is the car you drive insured against theft or accidents?" },
      { id: "fw_saving_money", type: "yesno", text: "Are you saving money each month for emergencies, or towards any goals, like education, a holiday, a car or home?" },
      { id: "fw_investing", type: "yesno", text: "Are you investing your money efficiently to grow over time?" },
      { id: "fw_life_cover", type: "yesno", text: "Do you have life cover in case you can't work, get sick / injured, or (worst case) die?" },
      { id: "fw_big_debts", type: "yesno", text: "Do you have any big debts that you need to pay off urgently (excluding a home loan)?" },
      { id: "fw_will", type: "yesno", text: "Do you have an official Will in place? A Will declares who gets what when you die. Without one, your family might not get all of your assets." }
    ]
  }
];
