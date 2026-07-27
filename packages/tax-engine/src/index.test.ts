import test from "node:test";
import assert from "node:assert/strict";
import { calculateEmploymentEstimate, reconcileEmploymentCertificates } from "./index.ts";
import { irp5PayrollVariant, irp5SarsStandard } from "../../test-fixtures/src/irp5.ts";
test("reconciliation retains separate certificates and excludes 3699/4497", () => {
  const result = reconcileEmploymentCertificates([irp5SarsStandard, irp5PayrollVariant]);
  assert.equal(result.includedIncome, 360000);
  assert.deepEqual(result.excludedIncomeCodes, ["3699", "4497"]);
});
test("duplicate certificate cannot double count", () => {
  const result = reconcileEmploymentCertificates([irp5SarsStandard, irp5SarsStandard]);
  assert.equal(result.includedIncome, 240000);
  assert.equal(result.warnings.length, 1);
});
test("estimate applies 2026 primary rebate", () => {
  const result = calculateEmploymentEstimate({ certificates: [irp5SarsStandard], ageAtYearEnd: 40 });
  assert.equal(result.normalTaxBeforeRebates, 43432);
  assert.equal(result.estimatedNormalTax, 26197);
});
