import test from "node:test";
import assert from "node:assert/strict";
import { IdentityWorkspaceOnboarding } from "./identity-onboarding.ts";

test("a taxpayer receives an isolated Rovyniq tenant and one idempotent ITR12 workspace", async () => {
  const tenants = new Map<string, string>(); const workspaces = new Map<string, string>(); const scoped: string[] = [];
  const database = {
    withSystem: async <T>(work: (sql: any) => Promise<T>) => work({ query: async (text: string, values: readonly unknown[]) => {
      if (text.startsWith("insert into identity_tenants")) { const subject = values[1] as string; const id = tenants.get(subject) ?? values[0] as string; tenants.set(subject, id); return { rows: [{ id }] }; }
      if (text.startsWith("select id from identity_tenants")) return { rows: tenants.has(values[0] as string) ? [{ id: tenants.get(values[0] as string)! }] : [] };
      throw new Error(`Unexpected system query: ${text}`);
    } }),
    withTenant: async <T>(tenantId: string, work: (sql: any) => Promise<T>) => { scoped.push(tenantId); return work({ query: async (text: string, values: readonly unknown[] = []) => {
      const key = `${tenantId}:${values[0]}:${values[1]}`;
      if (text.startsWith("select id from return_workspaces")) return { rows: workspaces.has(key) ? [{ id: workspaces.get(key)! }] : [] };
      if (text.startsWith("insert into return_workspaces")) { workspaces.set(`${tenantId}:${values[2]}:${values[3]}`, values[0] as string); return { rows: [] }; }
      throw new Error(`Unexpected tenant query: ${text}`);
    } }); }
  };
  const onboarding = new IdentityWorkspaceOnboarding(database, 2026);
  const first = await onboarding.ensureForTaxpayer({ subject: "taxpayer-a", organisationId: "shared-org" });
  const again = await onboarding.ensureForTaxpayer({ subject: "taxpayer-a", organisationId: "shared-org" });
  const other = await onboarding.ensureForTaxpayer({ subject: "taxpayer-b", organisationId: "shared-org" });
  assert.equal(first.workspaceId, again.workspaceId);
  assert.notEqual(first.tenantId, other.tenantId);
  assert.equal((await onboarding.findForSubject("taxpayer-a"))?.tenantId, first.tenantId);
  assert.ok(scoped.every((id) => id === first.tenantId || id === other.tenantId));
});
