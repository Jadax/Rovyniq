import { randomUUID } from "node:crypto";
import type { SystemDatabase, TenantDatabase } from "./postgres.ts";

export interface PersonalWorkspace { tenantId: string; workspaceId: string; assessmentYear: number; }

/**
 * Maps a verified identity subject to a Rovyniq-owned tenant.  An identity
 * provider organisation is deliberately not used as the data boundary: a
 * public consumer identity tenant can contain many unrelated taxpayers.
 */
export class IdentityWorkspaceOnboarding {
  private readonly database: TenantDatabase & SystemDatabase;
  private readonly assessmentYear: number;
  constructor(database: TenantDatabase & SystemDatabase, assessmentYear = 2026) { this.database = database; this.assessmentYear = assessmentYear; }

  async ensureForTaxpayer(input: { subject: string; organisationId?: string }): Promise<PersonalWorkspace> {
    const tenantId = await this.database.withSystem(async (sql) => {
      const result = await sql.query<{ id: string }>(
        "insert into identity_tenants (id, identity_subject, identity_organisation_id) values ($1, $2, $3) on conflict (identity_subject) do update set identity_organisation_id = excluded.identity_organisation_id returning id",
        [randomUUID(), input.subject, input.organisationId ?? null]
      );
      return result.rows[0]!.id;
    });
    return this.database.withTenant(tenantId, async (sql) => {
      const existing = await sql.query<{ id: string }>("select id from return_workspaces where taxpayer_subject = $1 and assessment_year = $2", [input.subject, this.assessmentYear]);
      const workspaceId = existing.rows[0]?.id ?? randomUUID();
      if (!existing.rows[0]) await sql.query("insert into return_workspaces (id, tenant_id, taxpayer_subject, assessment_year, state) values ($1, $2, $3, $4, $5)", [workspaceId, tenantId, input.subject, this.assessmentYear, "DATA_COLLECTION"]);
      return { tenantId, workspaceId, assessmentYear: this.assessmentYear };
    });
  }

  async findForSubject(subject: string): Promise<PersonalWorkspace | null> {
    return this.database.withSystem(async (sql) => {
      const tenant = await sql.query<{ id: string }>("select id from identity_tenants where identity_subject = $1", [subject]);
      if (!tenant.rows[0]) return null;
      const tenantId = tenant.rows[0].id;
      return this.database.withTenant(tenantId, async (tenantSql) => {
        const workspace = await tenantSql.query<{ id: string }>("select id from return_workspaces where taxpayer_subject = $1 and assessment_year = $2", [subject, this.assessmentYear]);
        return workspace.rows[0] ? { tenantId, workspaceId: workspace.rows[0].id, assessmentYear: this.assessmentYear } : null;
      });
    });
  }
}
