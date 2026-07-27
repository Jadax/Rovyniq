import test from "node:test";
import assert from "node:assert/strict";
import { can, requirePermission, type Principal } from "./index.ts";
const taxpayer: Principal = { subject: "taxpayer-1", roles: ["taxpayer"], verifiedBy: "oidc" };
test("only the workspace taxpayer can approve or submit", () => {
  assert.equal(can(taxpayer, "return:approve", "taxpayer-1"), true);
  assert.equal(can(taxpayer, "return:submit", "somebody-else"), false);
});
test("unauthorised operations fail closed", () => assert.throws(() => requirePermission(taxpayer, "audit:read"), /Forbidden/));
