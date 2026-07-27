export interface TaxBracket { upTo?: number; baseTax: number; rate: number; threshold: number; }
export const taxYear2026 = {
  assessmentYear: 2026 as const,
  period: { start: "2025-03-01", end: "2026-02-28" },
  review: { sourceRegisterRuleIds: ["ZA-2026-PIT-RATES", "ZA-2026-REBATES", "ZA-2026-MEDICAL"], verifiedOn: "2026-07-27", reverifyBy: "2026-10-23" },
  brackets: [
    { upTo: 237100, baseTax: 0, rate: 0.18, threshold: 0 },
    { upTo: 370500, baseTax: 42678, rate: 0.26, threshold: 237100 },
    { upTo: 512800, baseTax: 77362, rate: 0.31, threshold: 370500 },
    { upTo: 673000, baseTax: 121475, rate: 0.36, threshold: 512800 },
    { upTo: 857900, baseTax: 179147, rate: 0.39, threshold: 673000 },
    { upTo: 1817000, baseTax: 251188, rate: 0.41, threshold: 857900 },
    { baseTax: 644489, rate: 0.45, threshold: 1817000 }
  ] satisfies readonly TaxBracket[],
  rebates: { primary: 17235, secondary65OrOlder: 9444, tertiary75OrOlder: 3145 },
  medicalSchemeFeesCredit: { firstTwoPeopleMonthly: 364, additionalPersonMonthly: 246 },
  retirementContribution: { percentageOfGreaterOfRemunerationOrTaxableIncome: 0.275, annualCap: 350000 },
  interestExemption: { under65: 23800, age65OrOlder: 34500 }
} as const;
