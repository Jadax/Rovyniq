import type { EmploymentCertificate, TaxBreakdownLine } from "../../canonical-tax-model/src/index.ts";
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
