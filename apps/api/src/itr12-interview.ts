export interface InterviewQuestion { key: string; section: string; prompt: string; kind: "yes_no" | "text" | "currency"; evidenceTypes?: readonly string[]; }

/** Rovyniq-owned wording; values are saved separately and never inferred as approved. */
export const itr12Interview: readonly InterviewQuestion[] = [
  { key: "has_irp5", section: "Employment", prompt: "Did you receive an IRP5 or IT3(a) during the assessment year?", kind: "yes_no", evidenceTypes: ["IRP5_IT3A"] },
  { key: "has_it3b", section: "Interest and investments", prompt: "Did you receive an IT3(b) interest or investment certificate?", kind: "yes_no", evidenceTypes: ["IT3B"] },
  { key: "has_medical", section: "Medical", prompt: "Were you the main member of a medical scheme or did you pay qualifying medical expenses?", kind: "yes_no", evidenceTypes: ["MEDICAL_CERTIFICATE"] },
  { key: "has_retirement_annuity", section: "Retirement", prompt: "Did you contribute to a retirement annuity fund outside ordinary payroll deductions?", kind: "yes_no", evidenceTypes: ["IT3F"] },
  { key: "has_tfsa", section: "Tax-free savings", prompt: "Did you contribute to or withdraw from a tax-free savings account?", kind: "yes_no", evidenceTypes: ["IT3S"] },
  { key: "has_capital_gains", section: "Capital gains", prompt: "Did you sell investments, cryptocurrency, property, or another capital asset?", kind: "yes_no", evidenceTypes: ["IT3C"] },
  { key: "has_other_income", section: "Other income", prompt: "Did you earn rental, freelance, business, trust, or foreign income?", kind: "yes_no" },
  { key: "has_donations", section: "Deductions", prompt: "Do you have a qualifying donation certificate from an approved public-benefit organisation?", kind: "yes_no" }
  ,{ key: "has_travel_allowance", section: "Travel", prompt: "Did your employer provide a travel allowance and do you have a logbook?", kind: "yes_no" }
  ,{ key: "has_home_office", section: "Deductions", prompt: "Do you have evidence for qualifying home-office or other employment expenses?", kind: "yes_no" }
  ,{ key: "has_trust_income", section: "Other income", prompt: "Did income vest in you as a beneficiary of a trust?", kind: "yes_no" }
  ,{ key: "has_exempt_income", section: "Exempt income", prompt: "Did you receive income that may be exempt from normal tax?", kind: "yes_no" }
  ,{ key: "has_foreign_income", section: "Foreign income", prompt: "Did you earn foreign income or pay foreign tax?", kind: "yes_no" }
  ,{ key: "has_business_income", section: "Business and freelance", prompt: "Were you self-employed, an independent contractor, or a director/member of a private entity?", kind: "yes_no" }
  ,{ key: "married_in_community", section: "Personal details", prompt: "Were you married in community of property during the assessment year?", kind: "yes_no" }
  ,{ key: "has_unemployment_period", section: "Employment", prompt: "Were you unemployed for any part of the assessment year?", kind: "yes_no" }
];
