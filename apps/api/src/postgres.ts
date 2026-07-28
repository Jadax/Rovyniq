import { Pool, type PoolClient, type QueryResultRow } from "pg";
import type { AuditEvent } from "../../../packages/audit/src/index.ts";
import type { DocumentPersistence, DocumentRecord, WorkspaceAccess } from "../../../packages/document-ingestion/src/service.ts";

export interface Sql { query<T extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }>; }
export interface TenantDatabase { withTenant<T>(tenantId: string, work: (sql: Sql) => Promise<T>): Promise<T>; }
export interface SystemDatabase { withSystem<T>(work: (sql: Sql) => Promise<T>): Promise<T>; }
export interface PostgresConfig { connectionString: string; ssl: { rejectUnauthorized: boolean }; }

export function postgresConfigFromEnvironment(environment: NodeJS.ProcessEnv): PostgresConfig | null {
  const connectionString = environment.DATABASE_URL;
  if (!connectionString) return null;
  new URL(connectionString);
  const sslEnabled = environment.POSTGRES_SSL !== "false";
  if (environment.NODE_ENV === "production" && !sslEnabled) throw new Error("PostgreSQL TLS is required in production.");
  return { connectionString, ssl: { rejectUnauthorized: environment.POSTGRES_SSL_REJECT_UNAUTHORIZED !== "false" } };
}

export class PostgresTenantDatabase implements TenantDatabase, SystemDatabase {
  private readonly pool: Pool;
  constructor(configuration: PostgresConfig) { this.pool = new Pool({ connectionString: configuration.connectionString, ssl: configuration.ssl, max: 10 }); }
  async withTenant<T>(tenantId: string, work: (sql: Sql) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query("begin");
      await client.query("select set_config('app.tenant_id', $1, true)", [tenantId]);
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (error) { await client.query("rollback"); throw error; } finally { client.release(); }
  }
  async withSystem<T>(work: (sql: Sql) => Promise<T>): Promise<T> {
    const client: PoolClient = await this.pool.connect();
    try {
      await client.query("begin");
      const result = await work(client);
      await client.query("commit");
      return result;
    } catch (error) { await client.query("rollback"); throw error; } finally { client.release(); }
  }
  async close(): Promise<void> { await this.pool.end(); }
}

type DocumentRow = { id: string; tenant_id: string; workspace_id: string; object_key: string; sha256: string; mime_type: "application/pdf"; state: "QUARANTINED"; document_type: DocumentRecord["documentType"]; original_filename: string; byte_length: number; idempotency_key: string; };
function recordFromRow(row: DocumentRow): DocumentRecord { return { id: row.id, tenantId: row.tenant_id, workspaceId: row.workspace_id, objectKey: row.object_key, sha256: row.sha256, contentType: row.mime_type, state: row.state, documentType: row.document_type, filename: row.original_filename, byteLength: row.byte_length, idempotencyKey: row.idempotency_key }; }

export class PostgresDocumentPersistence implements DocumentPersistence, WorkspaceAccess {
  private readonly database: TenantDatabase;
  constructor(database: TenantDatabase) { this.database = database; }
  async taxpayerSubject(tenantId: string, workspaceId: string): Promise<string | null> {
    return this.database.withTenant(tenantId, async (sql) => (await sql.query<{ taxpayer_subject: string }>("select taxpayer_subject from return_workspaces where id = $1", [workspaceId])).rows[0]?.taxpayer_subject ?? null);
  }
  async findByIdempotencyKey(tenantId: string, workspaceId: string, idempotencyKey: string): Promise<DocumentRecord | null> {
    return this.database.withTenant(tenantId, async (sql) => { const row = (await sql.query<DocumentRow>("select id, tenant_id, workspace_id, object_key, sha256, mime_type, state, document_type, original_filename, byte_length, idempotency_key from documents where workspace_id = $1 and idempotency_key = $2", [workspaceId, idempotencyKey])).rows[0]; return row ? recordFromRow(row) : null; });
  }
  async listDocuments(tenantId: string, workspaceId: string): Promise<readonly { id: string; documentType: string; filename: string; state: string; scannedAt?: string }[]> {
    return this.database.withTenant(tenantId, async (sql) => (await sql.query<{ id: string; document_type: string; original_filename: string; state: string; scanned_at?: string }>("select id, document_type, original_filename, state, scanned_at from documents where workspace_id = $1 order by created_at desc", [workspaceId])).rows.map((row) => ({ id: row.id, documentType: row.document_type, filename: row.original_filename, state: row.state, scannedAt: row.scanned_at })));
  }
  async saveQuarantined(input: { record: DocumentRecord; audit: AuditEvent }): Promise<void> {
    await this.database.withTenant(input.record.tenantId, async (sql) => {
      await sql.query("insert into documents (id, tenant_id, workspace_id, object_key, sha256, mime_type, state, document_type, original_filename, byte_length, idempotency_key) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [input.record.id, input.record.tenantId, input.record.workspaceId, input.record.objectKey, input.record.sha256, input.record.contentType, input.record.state, input.record.documentType, input.record.filename, input.record.byteLength, input.record.idempotencyKey]);
      await insertAudit(sql, input.audit);
    });
  }
  async recordScanOutcome(input: { tenantId: string; documentId: string; state: "VALIDATED" | "ARCHIVED"; scan: { verdict: string; engine: string; scannedAt: string }; audit: AuditEvent }): Promise<void> {
    await this.database.withTenant(input.tenantId, async (sql) => { await sql.query("update documents set state = $1, scan_engine = $2, scan_verdict = $3, scanned_at = $4 where id = $5", [input.state, input.scan.engine, input.scan.verdict, input.scan.scannedAt, input.documentId]); await insertAudit(sql, input.audit); });
  }
}

export class PostgresWorkspaceAnswers {
  private readonly database: TenantDatabase;
  constructor(database: TenantDatabase) { this.database = database; }
  async list(tenantId: string, workspaceId: string): Promise<readonly { questionKey: string; value: unknown; revision: number; updatedAt: string }[]> {
    return this.database.withTenant(tenantId, async (sql) => (await sql.query<{ question_key: string; value: unknown; revision: number; created_at: string }>("select distinct on (question_key) question_key, value, revision, created_at from workspace_answer_revisions where workspace_id = $1 order by question_key, revision desc", [workspaceId])).rows.map((row) => ({ questionKey: row.question_key, value: row.value, revision: row.revision, updatedAt: row.created_at })));
  }
  async save(input: { tenantId: string; workspaceId: string; questionKey: string; value: unknown; actorId: string; correlationId: string }): Promise<{ revision: number }> {
    return this.database.withTenant(input.tenantId, async (sql) => { const revision = Number((await sql.query<{ revision: number }>("select coalesce(max(revision), 0) + 1 as revision from workspace_answer_revisions where workspace_id = $1 and question_key = $2", [input.workspaceId, input.questionKey])).rows[0]!.revision); await sql.query("insert into workspace_answer_revisions (id, tenant_id, workspace_id, question_key, value, source, revision) values ($1,$2,$3,$4,$5,$6,$7)", [crypto.randomUUID(), input.tenantId, input.workspaceId, input.questionKey, JSON.stringify(input.value), "user", revision]); await insertAudit(sql, { id: crypto.randomUUID(), tenantId: input.tenantId, actorId: input.actorId, action: "workspace.answer_saved", entityType: "workspace_answer", entityId: `${input.workspaceId}:${input.questionKey}:${revision}`, correlationId: input.correlationId, metadata: { workspaceId: input.workspaceId, questionKey: input.questionKey, revision }, occurredAt: new Date().toISOString() }); return { revision }; });
  }
}

async function insertAudit(sql: Sql, audit: AuditEvent): Promise<void> { await sql.query("insert into audit_events (id, tenant_id, actor_id, action, entity_type, entity_id, correlation_id, metadata, occurred_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)", [audit.id, audit.tenantId, audit.actorId, audit.action, audit.entityType, audit.entityId, audit.correlationId, JSON.stringify(audit.metadata), audit.occurredAt]); }
