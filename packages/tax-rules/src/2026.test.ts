import test from "node:test";
import assert from "node:assert/strict";
import { taxYear2026 } from "./2026.ts";
test("2026 assessment period and bracket boundaries are internally consistent", () => {
  assert.equal(taxYear2026.period.start, "2025-03-01");
  assert.equal(taxYear2026.period.end, "2026-02-28");
  assert.equal(taxYear2026.brackets[1].baseTax, 237100 * 0.18);
  assert.equal(taxYear2026.brackets.at(-1)?.threshold, 1817000);
});
