import type { EmploymentCertificate } from "../../canonical-tax-model/src/index.ts";
import { taxYear2026 } from "../../tax-rules/src/2026.ts";

export interface CalculationTrace { ruleId: string; input: number; output: number; }
export interface EmploymentEstimate { grossEmploymentIncome: number; payeWithheld: number; normalTaxBeforeRebates: number; rebates: number; estimatedNormalTax: number; estimatedBalance: number; trace: readonly CalculationTrace[]; }
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
  return { grossEmploymentIncome: taxableIncome, payeWithheld, normalTaxBeforeRebates, rebates, estimatedNormalTax, estimatedBalance: estimatedNormalTax - payeWithheld, trace: [{ ruleId: "ZA-2026-PIT-RATES", input: taxableIncome, output: normalTaxBeforeRebates }, { ruleId: "ZA-2026-REBATES", input: input.ageAtYearEnd, output: rebates }] };
}
