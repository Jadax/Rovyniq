import type { EmploymentCertificate, TaxBreakdownLine, FullEstimateInput, FullEstimate } from "../../canonical-tax-model/src/index.ts";
import { taxYear2026 } from "../../tax-rules/src/2026.ts";

export interface CalculationTrace { ruleId: string; input: number; output: number; }
export interface EmploymentEstimate { grossEmploymentIncome: number; allowedDeductions: number; taxableIncome: number; payeWithheld: number; normalTaxBeforeRebates: number; rebates: number; estimatedNormalTax: number; estimatedBalance: number; breakdown: readonly TaxBreakdownLine[]; trace: readonly CalculationTrace[]; }
export interface Reconciliation { includedIncome: number; excludedIncomeCodes: readonly string[]; warnings: readonly string[]; }
const excludedIncomeCodes = new Set(["3699", "4497"]);
const amount = (entry: { amount: number }) => entry.amount;

export function reconcileEmploymentCertificates(certificates: readonly EmploymentCertificate[]): Reconciliation {
  const warnings: string[] = [];
  const seen = new Set<string>();
  let includedIncome = 0;
  for (const certificate of certificates) {
    if (seen.has(certificate.id)) { warnings.push(`Duplicate certificate ignored: ${certificate.id}`); continue; }
    seen.add(certificate.id);
    for (const row of certificate.income) if (!excludedIncomeCodes.has(row.code)) includedIncome += row.amount;
  }
  return { includedIncome, excludedIncomeCodes: [...excludedIncomeCodes], warnings };
}
export function calculateEmploymentEstimate(input: { certificates: readonly EmploymentCertificate[]; ageAtYearEnd: number }): EmploymentEstimate {
  const reconciliation = reconcileEmploymentCertificates(input.certificates);
  const taxableIncome = Math.max(0, reconciliation.includedIncome);
  const bracket = taxYear2026.brackets.find((item) => item.upTo === undefined || taxableIncome <= item.upTo)!;
  const normalTaxBeforeRebates = bracket.baseTax + ((taxableIncome - bracket.threshold) * bracket.rate);
  const rebates = taxYear2026.rebates.primary + (input.ageAtYearEnd >= 65 ? taxYear2026.rebates.secondary65OrOlder : 0) + (input.ageAtYearEnd >= 75 ? taxYear2026.rebates.tertiary75OrOlder : 0);
  const estimatedNormalTax = Math.max(0, normalTaxBeforeRebates - rebates);
  const payeWithheld = input.certificates.flatMap((certificate) => certificate.paye ? [certificate.paye] : []).map(amount).reduce((sum, value) => sum + value, 0);
  const estimatedBalance = estimatedNormalTax - payeWithheld;
  const breakdown: readonly TaxBreakdownLine[] = [
    { id: "income", label: "Employment income", amount: taxableIncome, direction: "increase", source: "document", evidenceRequired: true },
    { id: "deductions", label: "Allowed deductions", amount: 0, direction: "reduce", source: "calculated", evidenceRequired: true },
    { id: "taxable_income", label: "Taxable income", amount: taxableIncome, direction: "result", source: "mixed", evidenceRequired: true },
    { id: "normal_tax", label: "Normal tax", amount: normalTaxBeforeRebates, direction: "increase", source: "calculated", evidenceRequired: false },
    { id: "rebates_and_credits", label: "Rebates and credits", amount: rebates, direction: "reduce", source: "calculated", evidenceRequired: false },
    { id: "paye", label: "PAYE already withheld", amount: payeWithheld, direction: "reduce", source: "document", evidenceRequired: true },
    { id: "estimated_balance", label: "Estimated balance", amount: estimatedBalance, direction: "result", source: "calculated", evidenceRequired: false }
  ];
  return { grossEmploymentIncome: taxableIncome, allowedDeductions: 0, taxableIncome, payeWithheld, normalTaxBeforeRebates, rebates, estimatedNormalTax, estimatedBalance, breakdown, trace: [{ ruleId: "ZA-2026-PIT-RATES", input: taxableIncome, output: normalTaxBeforeRebates }, { ruleId: "ZA-2026-REBATES", input: input.ageAtYearEnd, output: rebates }] };
}

function bracketFor(taxableIncome: number): { baseTax: number; threshold: number; rate: number } {
  const bracket = taxYear2026.brackets.find((b) => b.upTo === undefined || taxableIncome <= b.upTo)!;
  return { baseTax: bracket.baseTax, threshold: bracket.threshold, rate: bracket.rate };
}

function normalTax(taxableIncome: number): number {
  const b = bracketFor(taxableIncome);
  return b.baseTax + ((taxableIncome - b.threshold) * b.rate);
}

function calcRebates(ageAtYearEnd: number): number {
  let r = taxYear2026.rebates.primary;
  if (ageAtYearEnd >= 65) r += taxYear2026.rebates.secondary65OrOlder;
  if (ageAtYearEnd >= 75) r += taxYear2026.rebates.tertiary75OrOlder;
  return r;
}

function calcMedicalCredits(dependantsCount: number, months: number): number {
  const firstTwo = Math.min(dependantsCount + 1, 2);
  const additional = Math.max(0, dependantsCount + 1 - 2);
  return (taxYear2026.medicalSchemeFeesCredit.firstTwoPeopleMonthly * firstTwo + taxYear2026.medicalSchemeFeesCredit.additionalPersonMonthly * additional) * months;
}

function calcAdditionalMedicalCredit(qualifyingExpenses: number, disabilityExpenses: number, totalIncome: number, ageAtYearEnd: number): number {
  const threshold = qualifyingExpenses > 0 || ageAtYearEnd >= 65 ? 0.075 : 0.075;
  const excess = Math.max(0, qualifyingExpenses + disabilityExpenses - (totalIncome * threshold));
  return excess * 0.25;
}

export function calculateFullEstimate(input: FullEstimateInput): FullEstimate {
  const { ageAtYearEnd, certificates, localInterest, foreignInterest, localDividends, foreignDividends, reitDistributions, businessIncome, businessExpenses, rentalIncome, rentalExpenses, otherIncome, capitalGain, capitalLoss, retirementContributions, medicalSchemeContributions, qualifyingMedicalExpenses, disabilityExpenses, dependantsOnMedical, travelAllowance, homeOfficeExpenses, equipmentCosts, donations, legalFees, badDebts } = input;

  const trace: { ruleId: string; input: number; output: number }[] = [];

  // Employment income
  const reconciliation = reconcileEmploymentCertificates(certificates);
  const employmentIncome = reconciliation.includedIncome;
  trace.push({ ruleId: "ZA-2026-PIT-EMPLOYMENT", input: certificates.length, output: employmentIncome });

  // Business income
  const netBusinessIncome = Math.max(0, businessIncome - businessExpenses);
  trace.push({ ruleId: "ZA-2026-PIT-BUSINESS", input: businessIncome, output: netBusinessIncome });

  // Rental income
  const netRentalIncome = Math.max(0, rentalIncome - rentalExpenses);
  trace.push({ ruleId: "ZA-2026-PIT-RENTAL", input: rentalIncome, output: netRentalIncome });

  // Interest exemption
  const interestExemption = ageAtYearEnd >= 65 ? taxYear2026.interestExemption.age65OrOlder : taxYear2026.interestExemption.under65;
  const taxableLocalInterest = Math.max(0, localInterest - interestExemption);
  const investmentIncome = taxableLocalInterest + foreignInterest + localDividends + foreignDividends + reitDistributions;
  trace.push({ ruleId: "ZA-2026-PIT-INTEREST-EXEMPTION", input: localInterest, output: taxableLocalInterest });

  // Capital gains
  const cgtExclusion = taxYear2026.cgtAnnualExclusion;
  const netCapitalGain = Math.max(0, capitalGain - capitalLoss - cgtExclusion);
  const taxableCapitalGain = netCapitalGain * (taxYear2026.cgtInclusionRate ?? 0.4);
  trace.push({ ruleId: "ZA-2026-PIT-CGT", input: capitalGain, output: taxableCapitalGain });

  // Total gross income
  const totalGrossIncome = employmentIncome + netBusinessIncome + netRentalIncome + investmentIncome + otherIncome + taxableCapitalGain;
  trace.push({ ruleId: "ZA-2026-PIT-TOTAL-INCOME", input: totalGrossIncome, output: totalGrossIncome });

  // Retirement deduction (capped at 27.5% of total income, max R350k)
  const retirementLimit = Math.min(totalGrossIncome * taxYear2026.retirementFundLimit.percentage, taxYear2026.retirementFundLimit.annualCap);
  const allowedRetirement = Math.min(retirementContributions, retirementLimit);
  trace.push({ ruleId: "ZA-2026-PIT-RETIREMENT-LIMIT", input: retirementContributions, output: allowedRetirement });

  // Donation deduction (capped at 10% of taxable income before donations)
  const donationCap = (totalGrossIncome - allowedRetirement) * taxYear2026.donationCapPercentage;
  const allowedDonations = Math.min(donations, donationCap);
  trace.push({ ruleId: "ZA-2026-PIT-DONATION-CAP", input: donations, output: allowedDonations });

  // Total deductions
  const totalDeductions = allowedRetirement + travelAllowance + homeOfficeExpenses + equipmentCosts + allowedDonations + legalFees + badDebts;
  trace.push({ ruleId: "ZA-2026-PIT-TOTAL-DEDUCTIONS", input: totalDeductions, output: totalDeductions });

  const taxableIncome = Math.max(0, totalGrossIncome - totalDeductions);

  // Normal tax
  const normalTaxBeforeRebates = normalTax(taxableIncome);
  trace.push({ ruleId: "ZA-2026-PIT-RATES", input: taxableIncome, output: normalTaxBeforeRebates });

  // Rebates
  const rebates = calcRebates(ageAtYearEnd);
  trace.push({ ruleId: "ZA-2026-REBATES", input: ageAtYearEnd, output: rebates });

  // Medical credits
  const months = 12;
  const medicalTaxCredits = calcMedicalCredits(dependantsOnMedical, months);
  const additionalMedicalCredit = calcAdditionalMedicalCredit(qualifyingMedicalExpenses, disabilityExpenses, totalGrossIncome, ageAtYearEnd);
  const totalCredits = medicalTaxCredits + additionalMedicalCredit;
  trace.push({ ruleId: "ZA-2026-MEDICAL", input: medicalSchemeContributions, output: medicalTaxCredits });

  // Final tax
  const normalTaxAfterCredits = Math.max(0, normalTaxBeforeRebates - rebates - totalCredits);
  const payeWithheld = certificates.flatMap((c) => c.paye ? [c.paye] : []).map(amount).reduce((s, v) => s + v, 0);
  const estimatedBalance = normalTaxAfterCredits - payeWithheld;

  const breakdown: TaxBreakdownLine[] = [
    { id: "employment_income" as any, label: "Employment income", amount: employmentIncome, direction: "increase", source: "document", evidenceRequired: true },
    { id: "business_income" as any, label: "Business / freelance income", amount: netBusinessIncome, direction: "increase", source: "user", evidenceRequired: true },
    { id: "rental_income" as any, label: "Rental income", amount: netRentalIncome, direction: "increase", source: "user", evidenceRequired: true },
    { id: "investment_income" as any, label: "Investment income", amount: investmentIncome, direction: "increase", source: "user", evidenceRequired: true },
    { id: "other_income" as any, label: "Other income", amount: otherIncome, direction: "increase", source: "user", evidenceRequired: true },
    { id: "taxable_capital_gain" as any, label: "Taxable capital gain", amount: taxableCapitalGain, direction: "increase", source: "user", evidenceRequired: true },
    { id: "deductions", label: "Total deductions", amount: totalDeductions, direction: "reduce", source: "mixed", evidenceRequired: true },
    { id: "taxable_income", label: "Taxable income", amount: taxableIncome, direction: "result", source: "mixed", evidenceRequired: true },
    { id: "normal_tax", label: "Normal tax", amount: normalTaxBeforeRebates, direction: "increase", source: "calculated", evidenceRequired: false },
    { id: "rebates_and_credits", label: "Rebates and credits", amount: rebates + totalCredits, direction: "reduce", source: "calculated", evidenceRequired: false },
    { id: "paye", label: "PAYE already withheld", amount: payeWithheld, direction: "reduce", source: "document", evidenceRequired: true },
    { id: "estimated_balance", label: "Estimated balance", amount: estimatedBalance, direction: "result", source: "calculated", evidenceRequired: false }
  ];

  return {
    totalIncome: totalGrossIncome,
    totalDeductions,
    taxableIncome,
    normalTaxBeforeRebates,
    rebates,
    medicalTaxCredits,
    additionalMedicalCredit,
    normalTaxAfterCredits,
    payeWithheld,
    estimatedBalance,
    breakdown,
    trace
  };
}
