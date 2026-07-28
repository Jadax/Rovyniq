import { sections } from "./sections.js";

const answers = (() => {
  try {
    return JSON.parse(sessionStorage.getItem("rovyniq_answers") || "{}");
  } catch {
    return {};
  }
})();

const taxRules = {
  brackets: [
    { upTo: 237100, baseTax: 0, threshold: 0, rate: 0.18 },
    { upTo: 370500, baseTax: 42678, threshold: 237100, rate: 0.26 },
    { upTo: 512800, baseTax: 77362, threshold: 370500, rate: 0.31 },
    { upTo: 673000, baseTax: 121475, threshold: 512800, rate: 0.36 },
    { upTo: 857900, baseTax: 179147, threshold: 673000, rate: 0.39 },
    { upTo: 1817000, baseTax: 251188, threshold: 857900, rate: 0.41 },
    { upTo: null, baseTax: 644489, threshold: 1817000, rate: 0.45 }
  ],
  rebates: { primary: 17235, secondary65: 9444, tertiary75: 3145 },
  medicalCredits: { firstTwoMonthly: 364, additionalMonthly: 246 },
  retirementLimit: { percentage: 0.275, cap: 350000 },
  interestExemption: { under65: 23800, over65: 34500 },
  cgtAnnualExclusion: 40000,
  cgtPrimaryResidenceExclusion: 2000000,
  cgtInclusionRate: 0.4,
  donationCapPercentage: 0.1
};

function getAnswer(key) {
  return answers[key] ?? null;
}

function isGateYes(sectionId) {
  const s = sections.find((s) => s.id === sectionId);
  const gateId = s?.gateQuestion?.id ?? `${sectionId}_gate`;
  return answers[gateId] === true || answers[gateId] === "true" || answers[gateId] === "yes";
}

function isGateAnswered(sectionId) {
  const s = sections.find((s) => s.id === sectionId);
  const gateId = s?.gateQuestion?.id ?? `${sectionId}_gate`;
  return answers[gateId] !== undefined && answers[gateId] !== null;
}

function getKey(sectionId, instance, fieldId) {
  if (fieldId !== undefined && fieldId !== null) {
    if (fieldId === "") {
      return instance > 0 ? `${sectionId}_${instance}_` : `${sectionId}_`;
    }
    return instance > 0 ? `${sectionId}_${instance}_${fieldId}` : `${sectionId}_${fieldId}`;
  }
  return instance > 0 ? `${sectionId}_${instance}` : sectionId;
}

function currency(n) {
  if (n === null || n === undefined || isNaN(n)) return "R 0";
  return `R ${Number(n).toLocaleString("en-ZA", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function numVal(v) {
  if (v === null || v === undefined) return 0;
  const n = typeof v === "string" ? parseFloat(v.replace(/[R\s,]/g, "")) : Number(v);
  return isNaN(n) ? 0 : n;
}

function maxInst(section) {
  if (!section.allowMultiple) return 0;
  for (let i = 10; i >= 0; i--) {
    const key = getKey(section.id, i, "");
    if (Object.keys(answers).some((k) => k.startsWith(key))) return i;
  }
  return 0;
}

// ITR12 section references for each interview section
const itr12Refs = {
  about_you: { ref: "Part A", label: "Taxpayer Details" },
  marital_status: { ref: "Part A", label: "Personal Details" },
  employment: { ref: "Part B", label: "IRP5/IT3(a) Certificates" },
  business_income: { ref: "Part E", label: "Business & Professional Income" },
  investments: { ref: "Part C", label: "Investment Income" },
  tax_free_savings: { ref: "Part C", label: "Tax Free Investments" },
  rental_income: { ref: "Part D", label: "Rental Income" },
  other_income: { ref: "Part F/H", label: "Other Income" },
  capital_gains: { ref: "Part G", label: "Capital Gains / Loss" },
  retirement_contributions: { ref: "Part I", label: "Retirement Deductions" },
  medical: { ref: "Part J", label: "Medical" },
  travel_expenses: { ref: "Part I", label: "Travel Deductions" },
  work_expenses: { ref: "Part I", label: "Home Office Deductions" },
  donations: { ref: "Part I", label: "Donations" },
  other_deductions: { ref: "Part I", label: "Other Deductions" }
};

// ----- Estimate calculation -----

function calcEstimate() {
  const income = { salary: 0, business: 0, rental: 0, localInterest: 0, foreignInterest: 0, localDividends: 0, foreignDividends: 0, reit: 0, other: 0, capitalGain: 0, capitalLoss: 0 };
  const deductions = { retirement: 0, travel: 0, homeOffice: 0, donations: 0, otherWorkDeductions: 0, legal: 0, badDebts: 0 };
  const paye: number[] = [];
  let medicalSchemeContribs = 0;
  let qualifyingMedicalExpenses = 0;
  let disabilityExpenses = 0;
  let membersCountMonthly: number[] = [];

  // Employment / salary
  if (isGateYes("employment")) {
    const maxE = maxInst(sections.find((s) => s.id === "employment")!);
    for (let inst = 0; inst <= maxE; inst++) {
      const p = getKey("employment", inst, "");
      income.salary += numVal(getAnswer(p + "income_salary"));
      income.salary += numVal(getAnswer(p + "income_pension"));
      income.salary += numVal(getAnswer(p + "income_annual_payment"));
      income.salary += numVal(getAnswer(p + "income_non_taxable"));
      paye.push(numVal(getAnswer(p + "paye_deducted")));
      medicalSchemeContribs += numVal(getAnswer(p + "medical_credit_on_irp5"));
    }
  }

  // Business
  if (isGateYes("business_income")) {
    income.business = numVal(getAnswer("business_income_total_income")) - numVal(getAnswer("business_income_total_expenses"));
  }

  // Investments
  if (isGateYes("investments")) {
    income.localInterest = numVal(getAnswer("investments_local_interest"));
    income.foreignInterest = numVal(getAnswer("investments_foreign_interest"));
    income.localDividends = numVal(getAnswer("investments_local_dividends"));
    income.foreignDividends = numVal(getAnswer("investments_foreign_dividends"));
    income.reit = numVal(getAnswer("investments_reit_distributions"));
  }

  // TFSA - contributions are tracked but not taxable
  // Rental
  if (isGateYes("rental_income")) {
    income.rental = numVal(getAnswer("rental_income_rental_income_total")) - numVal(getAnswer("rental_income_rental_expenses"));
  }

  // Other income
  if (isGateYes("other_income")) {
    income.other += numVal(getAnswer("other_income_alimony_received"));
    income.other += numVal(getAnswer("other_income_trust_income"));
    income.other += numVal(getAnswer("other_income_foreign_employment_income"));
    income.other += numVal(getAnswer("other_income_lump_sum_pension"));
    income.other += numVal(getAnswer("other_income_other_income_amount"));
  }

  // Capital gains
  if (isGateYes("capital_gains")) {
    income.capitalGain = numVal(getAnswer("capital_gains_capital_gain"));
    income.capitalLoss = numVal(getAnswer("capital_gains_capital_loss"));
  }

  // Retirement contributions
  if (isGateYes("retirement_contributions")) {
    const maxR = maxInst(sections.find((s) => s.id === "retirement_contributions")!);
    for (let inst = 0; inst <= maxR; inst++) {
      const p = getKey("retirement_contributions", inst, "");
      deductions.retirement += numVal(getAnswer(p + "total_contribution"));
    }
  }

  // Medical
  if (isGateYes("medical")) {
    const maxM = maxInst(sections.find((s) => s.id === "medical")!);
    for (let inst = 0; inst <= maxM; inst++) {
      const p = getKey("medical", inst, "");
      medicalSchemeContribs += numVal(getAnswer(p + "total_contributions_paid"));
      qualifyingMedicalExpenses += numVal(getAnswer(p + "qualifying_expenses"));
      if (getAnswer(p + "disability_expenses") === true || getAnswer(p + "disability_expenses") === "true" || getAnswer(p + "disability_expenses") === "yes") {
        disabilityExpenses += numVal(getAnswer(p + "disability_expenses_amount"));
      }
    }
  }

  // Travel
  if (isGateYes("travel_expenses")) {
    deductions.travel = numVal(getAnswer("travel_expenses_travel_allowance_amount"));
  }

  // Work expenses
  if (isGateYes("work_expenses")) {
    deductions.homeOffice = numVal(getAnswer("work_expenses_home_office_expenses")) + numVal(getAnswer("work_expenses_equipment_costs"));
    deductions.otherWorkDeductions = numVal(getAnswer("work_expenses_uniform_costs")) + numVal(getAnswer("work_expenses_other_work_expenses"));
  }

  // Donations
  if (isGateYes("donations")) {
    const maxD = maxInst(sections.find((s) => s.id === "donations")!);
    for (let inst = 0; inst <= maxD; inst++) {
      const p = getKey("donations", inst, "");
      deductions.donations += numVal(getAnswer(p + "donation_amount"));
    }
  }

  // Other deductions
  if (isGateYes("other_deductions")) {
    deductions.legal = numVal(getAnswer("other_deductions_legal_fees"));
    deductions.badDebts = numVal(getAnswer("other_deductions_bad_debts"));
  }

  // ----- Compute totals -----
  const grossEmploymentIncome = income.salary;
  const netBusinessIncome = Math.max(0, income.business);
  const netRentalIncome = Math.max(0, income.rental);

  // Interest exemption
  const age = guessAge();
  const interestExemption = age >= 65 ? taxRules.interestExemption.over65 : taxRules.interestExemption.under65;
  const taxableLocalInterest = Math.max(0, income.localInterest - interestExemption);
  const netInvestmentIncome = taxableLocalInterest + income.foreignInterest + income.localDividends + income.foreignDividends + income.reit;

  // CGT
  const netCapitalGain = Math.max(0, income.capitalGain - income.capitalLoss - taxRules.cgtAnnualExclusion);
  const taxableCapitalGain = netCapitalGain * taxRules.cgtInclusionRate;

  const totalGrossIncome = grossEmploymentIncome + netBusinessIncome + netRentalIncome + netInvestmentIncome + income.other + taxableCapitalGain;

  // Cap retirement contributions at 27.5% of total income
  const maxRetirementDeduction = Math.min(totalGrossIncome * taxRules.retirementLimit.percentage, taxRules.retirementLimit.cap);
  const allowedRetirementDeduction = Math.min(deductions.retirement, maxRetirementDeduction);

  // Cap donations at 10% of taxable income (before donations)
  const incomeBeforeDonations = totalGrossIncome - allowedRetirementDeduction;
  const maxDonationDeduction = incomeBeforeDonations * taxRules.donationCapPercentage;
  const allowedDonationDeduction = Math.min(deductions.donations, maxDonationDeduction);

  const totalDeductions = allowedRetirementDeduction + deductions.travel + deductions.homeOffice + deductions.otherWorkDeductions + allowedDonationDeduction + deductions.legal + deductions.badDebts;

  const taxableIncome = Math.max(0, totalGrossIncome - totalDeductions);

  // Normal tax
  const bracket = taxRules.brackets.find((b) => b.upTo === null || taxableIncome <= b.upTo)!;
  const normalTaxBeforeRebates = bracket.baseTax + (taxableIncome - bracket.threshold) * bracket.rate;

  // Rebates
  let rebates = taxRules.rebates.primary;
  if (age >= 65) rebates += taxRules.rebates.secondary65;
  if (age >= 75) rebates += taxRules.rebates.tertiary75;

  // Medical tax credits
  const months = 12;
  const principalPlusDependants = Math.max(1, membersCountMonthly.reduce((a: number, b: number) => a + b, 0) / (membersCountMonthly.length || 1));
  const medicalCredits = taxRules.medicalCredits.firstTwoMonthly * 2 * months + taxRules.medicalCredits.additionalMonthly * Math.max(0, principalPlusDependants - 2) * months;

  // Additional medical expenses credit (3 x credits or 7.5% of income threshold)
  const medicalThreshold = age >= 65 || disabilityExpenses > 0 ? 0.075 : 0.075;
  const excessMedical = Math.max(0, qualifyingMedicalExpenses + disabilityExpenses - (totalGrossIncome * medicalThreshold));
  const additionalMedicalCredit = excessMedical * 0.25;

  const totalCredits = medicalCredits + additionalMedicalCredit;
  const normalTaxAfterCredits = Math.max(0, normalTaxBeforeRebates - rebates - totalCredits);
  const totalPaye = paye.reduce((s: number, v: number) => s + v, 0);
  const balance = normalTaxAfterCredits - totalPaye;

  return {
    grossEmploymentIncome,
    netBusinessIncome,
    netRentalIncome,
    netInvestmentIncome,
    taxableLocalInterest,
    incomeOther: income.other,
    taxableCapitalGain,
    totalGrossIncome,
    allowedRetirementDeduction,
    allowedDonationDeduction,
    totalDeductions,
    taxableIncome,
    normalTaxBeforeRebates,
    rebates,
    medicalCredits,
    additionalMedicalCredit,
    totalCredits,
    normalTaxAfterCredits,
    totalPaye,
    balance,
    age
  };
}

function guessAge() {
  const dob = getAnswer("about_you_date_of_birth");
  if (dob) {
    const parts = dob.split(/[/-]/);
    if (parts.length === 3) {
      const year = parts.length === 3 && parts[2].length === 4 ? parseInt(parts[2]) : parseInt("19" + parts[2]);
      return 2026 - year;
    }
  }
  // Guess from ID number
  const idNum = getAnswer("about_you_id_number");
  if (idNum && idNum.length >= 6) {
    const yearPrefix = parseInt(idNum.substring(0, 2));
    const year = yearPrefix <= 26 ? 2000 + yearPrefix : 1900 + yearPrefix;
    return 2026 - year;
  }
  return 35; // default
}

// ----- Render -----

function render() {
  const estimateArea = document.getElementById("estimate-area");
  const sectionsArea = document.getElementById("sections-area");
  if (!sectionsArea) return;

  // Estimate card
  const est = calcEstimate();
  if (estimateArea) {
    const isRefund = est.balance < 0;
    const cls = isRefund ? "estimate-refund" : "estimate-payable";
    const label = isRefund ? "Estimated refund" : "Estimated amount payable";
    estimateArea.innerHTML = `
      <div class="estimate-card">
        <h2>${label}</h2>
        <div class="estimate-amount ${cls}">${currency(Math.abs(est.balance))}</div>
        <div class="estimate-details">
          <span>Total income <span class="val">${currency(est.totalGrossIncome)}</span></span>
          <span>Total deductions <span class="val">${currency(est.totalDeductions)}</span></span>
          <span>Taxable income <span class="val">${currency(est.taxableIncome)}</span></span>
          <span>Normal tax <span class="val">${currency(est.normalTaxBeforeRebates)}</span></span>
          <span>Rebates <span class="val">${currency(est.rebates)}</span></span>
          <span>Medical credits <span class="val">${currency(est.medicalCredits)}</span></span>
          <span>PAYE already paid <span class="val">${currency(est.totalPaye)}</span></span>
        </div>
      </div>`;
  }

  // Progress label
  const progLabel = document.getElementById("progress-label");
  if (progLabel) {
    const completed = sections.filter((s) => isGateAnswered(s.id)).length;
    progLabel.textContent = `${completed} of ${sections.length} sections answered`;
  }

  // Sections
  let html = "";
  for (const section of sections) {
    if (!isGateAnswered(section.id)) continue;
    const gateYes = isGateYes(section.id);
    const ref = itr12Refs[section.id as keyof typeof itr12Refs];

    html += `<div class="section-group">`;
    html += `<h3>${section.icon || ""} ${section.title} <span class="itr12-ref">${ref ? ref.ref + ": " + ref.label : ""}</span></h3>`;
    html += `<span class="gate-answer ${gateYes ? "yes" : "no"}">${gateYes ? "Yes" : "No / Not applicable"}</span>`;

    if (gateYes) {
      const maxI = section.allowMultiple ? maxInst(section) : 0;
      for (let inst = 0; inst <= maxI; inst++) {
        if (section.allowMultiple && maxI > 0) {
          html += `<div class="sub-section"><h4>${section.multipleLabel || ""} #${inst + 1}</h4>`;
        }
        const prefix = getKey(section.id, inst, "");
        const rows: string[] = [];
        for (const field of section.fields) {
          const val = getAnswer(prefix + field.id);
          if (field.type === "info") continue; // skip tips
          if (val !== null && val !== undefined && val !== "") {
            const displayVal = typeof val === "boolean" ? (val ? "Yes" : "No") : String(val);
            const sourceRef = field.sourceCodes?.length ? field.sourceCodes.join(", ") : "";
            rows.push(`<tr><td>${shortLabel(field.text)}${sourceRef ? `<span class="field-ref">Code ${sourceRef}</span>` : ""}</td><td>${currencyIfNeeded(field, displayVal)}</td></tr>`);
          }
        }
        if (rows.length > 0) {
          html += `<table>${rows.join("")}</table>`;
        }
        if (section.allowMultiple && maxI > 0) {
          html += `</div>`;
        }
      }
    }

    html += `</div>`;
  }

  sectionsArea.innerHTML = html;
}

function shortLabel(text: string): string {
  return text.length > 80 ? text.slice(0, 80) + "..." : text;
}

function currencyIfNeeded(field: { type?: string; suffix?: string }, val: string): string {
  if (field.type === "currency") return currency(parseFloat(val.replace(/[R\s,]/g, "")));
  if (field.suffix) return `${val} ${field.suffix}`;
  return val;
}

render();
