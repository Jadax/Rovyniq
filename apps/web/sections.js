export const sections = [
  {
    id: "about_you",
    title: "About You",
    description: "Let's get to know you",
    icon: "👋",
    gateQuestion: {
      id: "ready_personal_info",
      text: "Let's start with the basics. Ready to tell us about yourself? This helps us set up your return correctly and makes sure everything matches what SARS has on file.",
      helpText: "We need your personal details to match what SARS has on record. You'll find these on your ID document and previous tax returns."
    },
    allowMultiple: false,
    fields: [
      { id: "full_name", type: "text", text: "What's your full name as it appears on your ID document?", placeholder: "e.g. Tushant Sharma", helpText: "This must match your South African ID document exactly." },
      { id: "id_number", type: "text", text: "Your South African ID number.", placeholder: "e.g. 900101 1234 089", helpText: "13 digits - you'll find this on your ID book or smart ID card.", validation: { pattern: "^[0-9]{13}$", message: "South African ID numbers are 13 digits long." } },
      { id: "tax_reference_number", type: "text", text: "Your SARS tax reference number.", placeholder: "e.g. 1234567890", helpText: "This is the 8-10 digit number SARS uses to identify you. You'll find it on your IRP5 or previous assessments." },
      { id: "date_of_birth", type: "date", text: "Your date of birth.", placeholder: "DD/MM/YYYY" },
      { id: "contact_number", type: "text", text: "Your cellphone number.", placeholder: "e.g. 082 123 4567", helpText: "SARS will use this to contact you if needed." },
      { id: "email_address", type: "text", text: "Your email address.", placeholder: "e.g. you@email.com", helpText: "For your assessment and refund notifications." },
      { id: "residential_address", type: "text", text: "Where do you live? Your residential address.", placeholder: "Street address, suburb, city, postcode", helpText: "This should be where you actually live, not a postal address." },
      { id: "tax_resident_status", type: "select", text: "Were you a South African tax resident for the full 2026 tax year (1 March 2025 - 28 February 2026)?", options: [
        { label: "Yes, resident for the full year", value: "resident_full" },
        { label: "Yes, but changed during the year", value: "resident_changed" },
        { label: "No, non-resident", value: "non_resident" }
      ] },
      { id: "bank_name", type: "text", text: "Which bank should SARS use for your refund?", placeholder: "e.g. FNB, Standard Bank, Capitec", helpText: "SARS will pay any refund into this account." },
      { id: "bank_account_number", type: "text", text: "Your bank account number.", placeholder: "e.g. 123456789", helpText: "Must be a South African bank account in your name." },
      { id: "bank_branch_code", type: "text", text: "Your bank branch code.", placeholder: "e.g. 255005", helpText: "Also known as the branch code or sort code." }
    ]
  },
  {
    id: "marital_status",
    title: "Your Relationship Status",
    description: "Tell us about your home situation",
    icon: "🏠",
    gateQuestion: {
      id: "ready_marital",
      text: "Let's talk about your home situation. Your marital status affects how SARS sees your income and deductions - shall we fill this in?",
      helpText: "If you got married or divorced during the tax year, we need to know so we can split income correctly."
    },
    allowMultiple: false,
    fields: [
      { id: "marital_status", type: "select", text: "What's your marital status?", options: [
        { label: "Single (never married)", value: "single" },
        { label: "Married in community of property", value: "married_community" },
        { label: "Married out of community of property", value: "married_out" },
        { label: "Divorced", value: "divorced" },
        { label: "Widowed", value: "widowed" }
      ] },
      { id: "marital_status_changed", type: "yesno", text: "Did your marital status change during the 2026 tax year?" },
      { id: "spouse_full_name", type: "text", text: "Your spouse's full name.", helpText: "SARS needs this if you're married." },
      { id: "spouse_id_number", type: "text", text: "Your spouse's ID number.", validation: { pattern: "^[0-9]{13}$", message: "ID numbers are 13 digits." } },
      { id: "spouse_income", type: "currency", text: "Your spouse's total income for the 2026 tax year.", helpText: "If married in community of property, you need to declare half of each other's income." },
      { id: "dependants_count", type: "number", text: "How many people depend on you financially?", placeholder: "e.g. 2", helpText: "Think about children, elderly parents, or anyone you support who doesn't earn their own income." }
    ]
  },
  {
    id: "employment",
    title: "Salary & Employment",
    description: "Your job income and IRP5 certificates",
    icon: "💼",
    gateQuestion: {
      id: "has_employment_income",
      text: "Did you earn a salary, wages, commission, or any payment from an employer during the 2026 tax year? This includes pensions and annuities from a retirement fund.",
      helpText: "Most people have this. If you worked even for one day, got a bonus, or received a pension, say Yes."
    },
    allowMultiple: true,
    multipleLabel: "Employer certificate (IRP5 / IT3(a))",
    fields: [
      { id: "employer_name", type: "text", text: "What's the name of your employer or fund?", placeholder: "e.g. North Highland South Africa", helpText: "Type the company name as it appears on your IRP5 certificate." },
      { id: "certificate_number", type: "text", text: "Certificate number from your IRP5.", placeholder: "e.g. 770080188120260221000000000027", helpText: "A long number near the top of your IRP5." },
      { id: "paye_reference", type: "text", text: "Your employer's PAYE reference number.", placeholder: "e.g. 7700801881", helpText: "Starts with a 7 and is 10 digits. You'll find this on your IRP5.", validation: { pattern: "^[0-9]{10}$", message: "10 digits only, starting with 7." } },
      { id: "income_salary", type: "currency", text: "Your salary or wages (code 3601).", sourceCodes: ["3601"], helpText: "This is your basic salary before tax and deductions." },
      { id: "income_non_taxable", type: "currency", text: "Any non-taxable income (code 3602).", sourceCodes: ["3602"], helpText: "Only if it appears on your IRP5 - most people leave this at R0." },
      { id: "income_pension", type: "currency", text: "Pension income (code 3603) if you're retired.", sourceCodes: ["3603"] },
      { id: "income_annual_payment", type: "currency", text: "Annual payment or bonus (code 3605).", sourceCodes: ["3605"], helpText: "Things like 13th cheques, performance bonuses, or annual payouts." },
      { id: "tip_multiple_employers", type: "info", text: "If you changed jobs during the year, add each employer's IRP5 separately using the \"Add another\" button. SARS needs all of them to calculate your tax properly - missing one could cost you a PAYE refund." },
      { id: "gross_income", type: "currency", text: "Your total gross employment income (code 3699).", sourceCodes: ["3699"], helpText: "This is the big number - your total taxable earnings from this employer." },
      { id: "paye_deducted", type: "currency", text: "PAYE (Employees Tax) deducted (code 4102).", sourceCodes: ["4102"], helpText: "This is the tax your employer already paid to SARS on your behalf." },
      { id: "uif_deducted", type: "currency", text: "UIF contribution (code 4141).", sourceCodes: ["4141"], helpText: "Unemployment Insurance Fund - both you and your employer contribute." },
      { id: "sdl_deducted", type: "currency", text: "Skills Development Levy (code 4142).", sourceCodes: ["4142"], helpText: "Your employer pays this - it's not deducted from your salary." },
      { id: "medical_credit_on_irp5", type: "currency", text: "Medical scheme tax credit from your IRP5 (code 4116).", sourceCodes: ["4116"], helpText: "This amount goes toward your medical credit. We'll ask about medical details later too." },
      { id: "retirement_fund_contrib", type: "currency", text: "Retirement fund contributions from your salary (code 4001 or 4005).", sourceCodes: ["4001","4005"], helpText: "This is what your employer deducted from your pay for pension/provident/medical." },
      { id: "periods_employed", type: "number", text: "How many months did you work for this employer?", placeholder: "e.g. 12", helpText: "Look for 'Periods in Year' or 'Periods Worked' on your IRP5." },
      { id: "start_date", type: "date", text: "When did you start working for this employer?", placeholder: "DD/MM/YYYY", helpText: "The earliest date in the tax year (on or after 1 March 2025)." },
      { id: "end_date", type: "date", text: "When did you finish (or when will you finish)?", placeholder: "DD/MM/YYYY", helpText: "The latest date (up to 28 February 2026)." },
      { id: "directive_number", type: "text", text: "Any directive number on your IRP5?", placeholder: "Leave blank if none", helpText: "Check the bottom of your IRP5 for a Directive Number." }
    ]
  },
  {
    id: "business_income",
    title: "Business & Freelance",
    description: "Your own business, side hustle, or freelance work",
    icon: "🚀",
    gateQuestion: {
      id: "has_business_income",
      text: "Did you run your own business, freelance, do contract work, or earn money outside of a regular job? This includes being a director of your own company, a sole proprietor, or an independent contractor.",
      helpText: "If you earned money from Uber, TikTok, freelancing, consulting, or your own small business - this section is for you."
    },
    allowMultiple: false,
    fields: [
      { id: "business_type", type: "select", text: "What describes your situation best?", options: [
        { label: "Sole proprietor (running your own business)", value: "sole_proprietor" },
        { label: "Independent contractor / freelancer", value: "contractor" },
        { label: "Director of your own private company", value: "director" },
        { label: "Member of a Close Corporation", value: "cc_member" },
        { label: "Earning foreign income from overseas work", value: "foreign_income" }
      ] },
      { id: "business_name", type: "text", text: "Your business or trading name.", placeholder: "e.g. Cool Stuff Trading", helpText: "If you have a registered business name, use that." },
      { id: "business_registration_number", type: "text", text: "Business registration number (if registered).", placeholder: "e.g. 2020/123456/07" },
      { id: "total_income", type: "currency", text: "Total income from your business or freelance work for the year.", helpText: "This is everything you earned before expenses." },
      { id: "total_expenses", type: "currency", text: "Total expenses you incurred to run your business.", helpText: "Things like materials, equipment, software, transport, marketing, and subcontractors." },
      { id: "tip_biz_expenses", type: "info", text: "People often forget to claim things like their business cellphone and internet usage, training courses, accounting fees, bank charges, software subscriptions, and business insurance. If you used it for your business, it's probably deductible." },
      { id: "profit_or_loss", type: "select", text: "Did you make a profit or a loss?", options: [
        { label: "Profit (income was more than expenses)", value: "profit" },
        { label: "Loss (expenses were more than income)", value: "loss" }
      ] },
      { id: "tax_clearance", type: "yesno", text: "Do you have a SARS tax clearance or compliance letter for your business?" }
    ]
  },
  {
    id: "investments",
    title: "Investments & Savings",
    description: "Interest, dividends, and investment income",
    icon: "📈",
    gateQuestion: {
      id: "has_investment_income",
      text: "Did you earn interest on savings, receive dividends from shares, or get any investment payouts during the year? This includes bank account interest, fixed deposits, unit trusts, ETFs, and REITs.",
      helpText: "Interest from a Tax Free Savings Account (TFSA) goes in a separate section - don't include it here."
    },
    allowMultiple: false,
    fields: [
      { id: "tip_interest_exemption", type: "info", text: "The first R23,800 of local interest is tax-free if you're under 65 (R34,500 if you're 65+). Only interest above that threshold actually gets taxed. Declare everything - SARS applies the exemption automatically." },
      { id: "local_interest", type: "currency", text: "Local interest earned (code 4201/4202).", sourceCodes: ["4201","4202"], helpText: "This is interest from your bank accounts, fixed deposits, and savings. You'll get an IT3(b) certificate from your bank." },
      { id: "foreign_interest", type: "currency", text: "Foreign interest earned (code 4203).", sourceCodes: ["4203"], helpText: "Interest from foreign bank accounts or investments." },
      { id: "local_dividends", type: "currency", text: "South African dividends received (code 4204).", sourceCodes: ["4204"], helpText: "Dividends from South African companies you own shares in." },
      { id: "foreign_dividends", type: "currency", text: "Foreign dividends received (code 4205).", sourceCodes: ["4205"], helpText: "Dividends from overseas companies." },
      { id: "reit_distributions", type: "currency", text: "REIT distributions received (code 4207).", sourceCodes: ["4207"], helpText: "If you own property company shares (REITs), their distributions go here." },
      { id: "withholding_tax_interest", type: "currency", text: "Withholding tax already paid on interest (if any).", helpText: "Some foreign interest may have had tax withheld at source." },
      { id: "withholding_tax_dividends", type: "currency", text: "Withholding tax already paid on dividends (if any).", helpText: "Foreign dividends often have withholding tax deducted before they reach you." }
    ]
  },
  {
    id: "tax_free_savings",
    title: "Tax Free Savings Account",
    description: "Your TFSA contributions and earnings",
    icon: "💰",
    gateQuestion: {
      id: "has_tfsa",
      text: "Did you put money into a Tax Free Savings Account (TFSA) this year? These are special accounts where your growth is tax-free - but SARS still needs to track your contributions.",
      helpText: "A TFSA is NOT a retirement annuity or a normal savings account. You should have an IT3(s) certificate from your provider (EasyEquities, Nedbank, etc.)."
    },
    allowMultiple: true,
    multipleLabel: "TFSA account",
    fields: [
      { id: "institution_name", type: "text", text: "Which company holds your TFSA?", placeholder: "e.g. EasyEquities, Nedbank", helpText: "Check your IT3(s) certificate." },
      { id: "account_number", type: "text", text: "Your TFSA account or policy number.", placeholder: "e.g. EE764203-4589673" },
      { id: "investment_type", type: "text", text: "What type of TFSA is it?", placeholder: "e.g. TFSA, Tax Free Investment", helpText: "It should say on your statement." },
      { id: "total_contributions", type: "currency", text: "Total contributions you made this tax year (code 4219).", sourceCodes: ["4219"], helpText: "This is what you put in - SARS limits this to R36,000 per year." },
      { id: "interest_earned", type: "currency", text: "Interest earned inside your TFSA (code 4241).", sourceCodes: ["4241"] },
      { id: "dividends_earned", type: "currency", text: "Dividends earned inside your TFSA (code 4242).", sourceCodes: ["4242"] },
      { id: "withdrawals", type: "currency", text: "Any withdrawals from your TFSA (code 4248).", sourceCodes: ["4248"], helpText: "You can withdraw anytime, but you can't replace it without using your annual limit." },
      { id: "capital_gain", type: "select", text: "Did the account make a capital gain or loss?", options: [
        { label: "Capital gain (investments went up)", value: "gain" },
        { label: "Capital loss (investments went down)", value: "loss" },
        { label: "Neither / not sure", value: "neither" }
      ] }
    ]
  },
  {
    id: "rental_income",
    title: "Rental Income",
    description: "Income from property you rent out",
    icon: "🏘️",
    gateQuestion: {
      id: "has_rental_income",
      text: "Did you earn money from renting out a property? This could be a house, flat, room, or any other property you own and let to someone else.",
      helpText: "Even if you rent out just one room on Airbnb, this section applies."
    },
    allowMultiple: false,
    fields: [
      { id: "property_count", type: "number", text: "How many properties do you rent out?", placeholder: "e.g. 1" },
      { id: "rental_income_total", type: "currency", text: "Total rental income received for the year." },
      { id: "rental_expenses", type: "currency", text: "Total expenses (bond interest, levies, rates, maintenance, agent fees).", helpText: "Things like: home loan interest, property management fees, repairs, insurance, municipal rates." },
      { id: "has_mortgage", type: "yesno", text: "Do you have a home loan on the rental property?" },
      { id: "bond_interest", type: "currency", text: "Interest paid on the rental property bond.", helpText: "Your bank will give you an interest certificate." }
    ]
  },
  {
    id: "other_income",
    title: "Other Income",
    description: "Alimony, trust income, foreign income, and more",
    icon: "📋",
    gateQuestion: {
      id: "has_other_income",
      text: "Did you receive any other income not covered yet? This includes alimony or maintenance, trust income, foreign employment income, lump sums, or insurance payouts.",
      helpText: "If you're not sure, check if you received any money that didn't come from a salary, business, or investment."
    },
    allowMultiple: false,
    fields: [
      { id: "alimony_received", type: "currency", text: "Alimony or maintenance payments received.", helpText: "Regular payments from a former spouse for your support." },
      { id: "trust_income", type: "currency", text: "Income from a trust (code 4208/4210).", sourceCodes: ["4208","4210"], helpText: "If you're a beneficiary of a trust and received income that vests in your name." },
      { id: "foreign_employment_income", type: "currency", text: "Foreign employment income earned while working overseas.", helpText: "If you worked outside South Africa, this is what you earned in foreign currency." },
      { id: "lump_sum_pension", type: "currency", text: "Lump sum from a pension or retirement fund (code 3901).", sourceCodes: ["3901"] },
      { id: "insurance_payout", type: "currency", text: "Insurance or RAF payouts received.", helpText: "Personal liability or Road Accident Fund payouts." },
      { id: "other_income_description", type: "text", text: "Briefly describe any other income not listed above.", placeholder: "e.g. Inheritance, lottery winnings, etc." },
      { id: "other_income_amount", type: "currency", text: "Amount of other income." }
    ]
  },
  {
    id: "capital_gains",
    title: "Capital Gains (Assets Sold)",
    description: "When you sold something for more than you paid",
    icon: "📊",
    gateQuestion: {
      id: "has_capital_gains",
      text: "Did you sell any assets during the year - like shares, crypto, a property, or a business? If you sold something for more than you originally paid, that's a capital gain (or a loss if you sold for less).",
      helpText: "You don't need to include personal stuff like your car or household goods. Think about: shares, ETFs, crypto, investment properties, or a business you sold."
    },
    allowMultiple: false,
    fields: [
      { id: "asset_description", type: "text", text: "What did you sell?", placeholder: "e.g. Shares in Capitec, Ethereum, Investment property", helpText: "Give a brief description of the main assets you sold." },
      { id: "proceeds", type: "currency", text: "Total proceeds from the sale (what you received).", helpText: "The total amount you got from selling." },
      { id: "base_cost", type: "currency", text: "Total base cost (what you originally paid).", helpText: "What you originally paid for the asset, plus any costs to buy and sell it (broker fees, transfer costs, etc.)." },
      { id: "tip_cgt_exclusion", type: "info", text: "The first R40,000 of capital gain is tax-free each year (R2 million if you sold your primary home). You can carry forward losses to offset future gains. If you sold crypto, shares, or an investment property this year, declare it even if you think the gain is tiny - SARS already has data from the platforms." },
      { id: "capital_gain", type: "currency", text: "Total capital gain (code 4250).", sourceCodes: ["4250"], helpText: "If you have an IT3(c) certificate from your broker or investment platform, use the amounts there." },
      { id: "capital_loss", type: "currency", text: "Total capital loss (code 4251).", sourceCodes: ["4251"], helpText: "If you sold some things at a loss, enter the total here." }
    ]
  },
  {
    id: "retirement_contributions",
    title: "Retirement Savings",
    description: "Pension, provident, and retirement annuity contributions",
    icon: "🏦",
    gateQuestion: {
      id: "has_retirement_contributions",
      text: "Did you save for retirement outside of your normal salary deductions? This includes: paying into a Retirement Annuity (RAF), or making extra voluntary contributions to your pension or provident fund.",
      helpText: "If your IRP5 shows code 4006 (Retirement Annuity Fund contribution), say Yes. You'll have an IT3(f) certificate from your fund."
    },
    allowMultiple: true,
    multipleLabel: "Retirement fund",
    fields: [
      { id: "fund_name", type: "text", text: "Which retirement fund did you contribute to?", placeholder: "e.g. Allan Gray Retirement Annuity Fund", helpText: "You'll find this on your IT3(f) tax certificate." },
      { id: "policy_number", type: "text", text: "Your policy or membership number.", placeholder: "e.g. 784943", helpText: "Also on your IT3(f) certificate." },
      { id: "total_contribution", type: "currency", text: "Total you contributed this tax year (code 4006).", sourceCodes: ["4006"], helpText: "The total amount you paid in. SARS will check this against your IT3(f)." },
      { id: "tip_retirement_limit", type: "info", text: "SARS lets you deduct retirement contributions up to 27.5% of your total income (salary, business, and investment income combined), capped at R350,000 per year. If you haven't hit that limit yet, you can still make a last-minute contribution and claim it for this tax year." },
      { id: "contribution_type", type: "select", text: "What kind of contribution is this?", options: [
        { label: "Retirement Annuity Fund (RAF)", value: "raf" },
        { label: "Voluntary pension fund contribution", value: "pension" },
        { label: "Voluntary provident fund contribution", value: "provident" }
      ] },
      { id: "employer_contributions", type: "currency", text: "Additional contributions your employer made on your behalf.", helpText: "Some employers contribute directly to your retirement fund." }
    ]
  },
  {
    id: "medical",
    title: "Medical & Health",
    description: "Medical aid, contributions, and health expenses",
    icon: "🏥",
    gateQuestion: {
      id: "has_medical_expenses",
      text: "Did you have any medical expenses this year? This includes medical aid contributions, hospital plan payments, doctor visits, medicines, dentist, and any other qualifying medical expenses.",
      helpText: "Even if your employer pays your medical aid, you need to tell us about it. Gap cover and medical insurance don't count here."
    },
    allowMultiple: true,
    multipleLabel: "Medical scheme",
    fields: [
      { id: "scheme_name", type: "select", text: "Which medical aid scheme are you on?", options: [
        { label: "Discovery Health Medical Scheme", value: "DISCOVERY" },
        { label: "Bonitas Medical Scheme", value: "BONITAS" },
        { label: "Momentum Health Medical Scheme", value: "MOMENTUM" },
        { label: "Medscheme Medical Scheme", value: "MEDSCHEME" },
        { label: "GEMS (Government Employees)", value: "GEMS" },
        { label: "LIBERTY Medical Scheme", value: "LIBERTY" },
        { label: "CAMAF", value: "CAMAF" },
        { label: "Other", value: "OTHER" }
      ], helpText: "Check your medical aid certificate." },
      { id: "membership_number", type: "text", text: "Your medical aid membership number.", helpText: "You'll find this on your medical aid card or certificate." },
      { id: "members_count", type: "text", text: "Number of people on your plan each month (e.g. just you, you + 1 dependent, or whole family).", placeholder: "Type like: Mar:2, Apr:2, ..., Feb:2", helpText: "SARS needs this for each month to calculate your tax credit correctly." },
      { id: "total_contributions_paid", type: "currency", text: "Total medical aid contributions for the year (code 4005).", sourceCodes: ["4005"], helpText: "The total you (or your employer) paid to the medical scheme for the full year." },
      { id: "employer_paid_contributions", type: "currency", text: "Amount your employer paid toward your medical aid.", helpText: "If your employer pays part or all of your medical aid, enter that amount here (code 4005 on your IRP5)." },
      { id: "tip_qme", type: "info", text: "Qualifying medical expenses are the out-of-pocket costs your medical aid didn't cover - doctor visits, prescribed meds, dentist, glasses, therapy, hospital co-payments, even travel to appointments. These add up fast and you can claim them. Keep your receipts though, SARS may ask to see them." },
      { id: "qualifying_expenses", type: "currency", text: "Out-of-pocket medical expenses not covered by your medical aid.", helpText: "Think about: doctor visits not covered, prescribed medication, dentist, optometrist, therapy, hospital co-payments." },
      { id: "disability_expenses", type: "yesno", text: "Do any of these expenses relate to a physical impairment or disability as approved by SARS?" },
      { id: "disability_expenses_amount", type: "currency", text: "Expenses related to the disability.", helpText: "If you or a family member has a SARS-approved disability, the threshold is lower for claiming." }
    ]
  },
  {
    id: "travel_expenses",
    title: "Travel & Vehicle",
    description: "Travel allowance and vehicle expenses",
    icon: "🚗",
    gateQuestion: {
      id: "has_travel_allowance",
      text: "Did you get a travel allowance or car allowance from your employer? Or do you use your own vehicle for work?",
      helpText: "If your IRP5 shows code 3701 (travel allowance) or 3702 (car allowance), this section is for you. You'll need a logbook."
    },
    allowMultiple: false,
    fields: [
      { id: "travel_allowance_amount", type: "currency", text: "Your travel or car allowance (code 3701/3702).", sourceCodes: ["3701","3702"], helpText: "This is on your IRP5." },
      { id: "vehicle_make", type: "text", text: "What car do you drive?", placeholder: "e.g. Toyota Corolla 2020" },
      { id: "vehicle_cost", type: "currency", text: "Original purchase price of the vehicle (including VAT).", helpText: "Check your purchase agreement or logbook." },
      { id: "total_kilometers", type: "number", text: "Total kilometers driven for the year.", suffix: "km" },
      { id: "business_kilometers", type: "number", text: "Business kilometers (not personal travel).", suffix: "km", helpText: "Only the kilometers you drove for work purposes." },
      { id: "tip_logbook", type: "info", text: "If you kept a logbook you can claim actual costs (fuel, maintenance, insurance, depreciation) based on your business-use percentage. Without a logbook, SARS uses a fixed rate per business kilometer - and the fixed rate usually works out lower. A proper logbook almost always saves you more." },
      { id: "kept_logbook", type: "yesno", text: "Did you keep a logbook of your business travel?" },
      { id: "fuel_cost", type: "currency", text: "Total fuel cost for the year.", helpText: "If you have the records." },
      { id: "maintenance_cost", type: "currency", text: "Total maintenance and repair costs for the year." }
    ]
  },
  {
    id: "work_expenses",
    title: "Work & Home Office",
    description: "Expenses related to your work",
    icon: "🏠",
    gateQuestion: {
      id: "has_work_expenses",
      text: "Do you work from home, or do you have expenses related to your job that your employer didn't pay for? This includes home office costs, tools, equipment, and uniforms.",
      helpText: "If you're a commission earner or independent contractor, you can claim more expenses. If you're a regular employee, you can claim things your employer required you to buy."
    },
    allowMultiple: false,
    fields: [
      { id: "works_from_home", type: "yesno", text: "Do you work from home (even part of the time)?" },
      { id: "home_office_area", type: "number", text: "How big is your home office?", suffix: "m²", helpText: "Measure the room or area you use exclusively for work." },
      { id: "home_total_area", type: "number", text: "How big is your whole home?", suffix: "m²", helpText: "Total floor area so we can work out the business percentage." },
      { id: "tip_home_office", type: "info", text: "You can claim a portion of your rent or bond interest, electricity, water, internet, cleaning, rates and security. The deductible amount is (office size / total home size) x total costs. You need a dedicated room used only for work, and your employer must not already provide a workspace for you." },
      { id: "home_office_expenses", type: "currency", text: "Total home office costs (rent/mortgage interest, electricity, internet, cleaning).", helpText: "We'll work out the business portion based on your office size." },
      { id: "equipment_costs", type: "currency", text: "Cost of work equipment (laptop, printer, phone, software).", helpText: "Things you bought for work that your employer didn't pay for." },
      { id: "uniform_costs", type: "currency", text: "Cost of uniforms or protective clothing.", helpText: "Only if your employer requires you to wear a specific uniform." },
      { id: "other_work_expenses", type: "currency", text: "Any other work-related expenses.", helpText: "Think: trade subscriptions, industry magazines, CPD courses, work-specific insurance." }
    ]
  },
  {
    id: "donations",
    title: "Donations & Charity",
    description: "Giving back and tax deductions",
    icon: "🎗️",
    gateQuestion: {
      id: "has_donations",
      text: "Did you donate money to a registered charity or Public Benefit Organisation (PBO) this year?",
      helpText: "You can claim a deduction for donations to SARS-registered PBOs. You must have a tax certificate from the charity with their PBO number."
    },
    allowMultiple: true,
    multipleLabel: "Donation",
    fields: [
      { id: "charity_name", type: "text", text: "Which organisation did you donate to?", placeholder: "e.g. Gift of the Givers" },
      { id: "pbo_number", type: "text", text: "Their PBO number (from their tax certificate).", placeholder: "e.g. 123456789", helpText: "The NPO number is NOT the same as a PBO number. Look for their SARS tax certificate." },
      { id: "donation_amount", type: "currency", text: "Total amount you donated this year.", sourceCodes: ["4218"], helpText: "You can deduct up to 10% of your taxable income for donations." },
      { id: "has_tax_certificate", type: "yesno", text: "Do you have a section 18A tax certificate from the charity?" }
    ]
  },
  {
    id: "other_deductions",
    title: "Other Deductions",
    description: "Legal fees, bad debts, and other claims",
    icon: "📑",
    gateQuestion: {
      id: "has_other_deductions",
      text: "Do you have any other expenses you think should be tax deductible? Things like legal fees related to your job, bad debts, or contributions to an employee share scheme.",
      helpText: "This is for less common deductions. If you're not sure, skip this section - you can always come back."
    },
    allowMultiple: false,
    fields: [
      { id: "legal_fees", type: "currency", text: "Legal fees related to your work or income.", helpText: "For example, fees to collect outstanding payments or defend your business." },
      { id: "bad_debts", type: "currency", text: "Bad debts you've written off.", helpText: "Money owed to you that you've given up on collecting, and that was previously included in your income." },
      { id: "share_contributions", type: "currency", text: "Contributions to an employee share scheme." },
      { id: "other_deduction_description", type: "text", text: "Any other deductions? Tell us what.", placeholder: "e.g. Insurance on business equipment" },
      { id: "other_deduction_amount", type: "currency", text: "Amount for other deductions." }
    ]
  },
  {
    id: "financial_wellness",
    title: "Financial Health Check",
    description: "Quick pulse check (totally optional)",
    icon: "🧘",
    gateQuestion: {
      id: "wants_checkup",
      text: "Want a quick, no-judgment financial health check? This is completely optional - answer a few quick questions and we'll give you some pointers.",
      helpText: "This has nothing to do with your tax return. Just useful perspective on your financial habits."
    },
    allowMultiple: false,
    fields: [
      { id: "home_ownership", type: "yesno", text: "Do you own the home you live in?" },
      { id: "car_insured", type: "yesno", text: "Is your car insured?" },
      { id: "saving_regularly", type: "yesno", text: "Do you put money into savings or an emergency fund each month?" },
      { id: "investing_growth", type: "yesno", text: "Are you investing money for growth (not just saving)?" },
      { id: "life_cover", type: "yesno", text: "Do you have life cover or disability insurance?" },
      { id: "high_interest_debt", type: "yesno", text: "Are you carrying any high-interest debt (credit cards, personal loans, store accounts)?" },
      { id: "has_will", type: "yesno", text: "Do you have a valid Will?" }
    ]
  }
];
