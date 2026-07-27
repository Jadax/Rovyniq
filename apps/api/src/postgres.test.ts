import test from "node:test";
import assert from "node:assert/strict";
import { PostgresDocumentPersistence, postgresConfigFromEnvironment } from "./postgres.ts";

test("PostgreSQL configuration requires TLS in production", () => {
  assert.throws(() => postgresConfigFromEnvironment({ DATABASE_URL: "postgres://user:password@db.example/rovyniq", NODE_ENV: "production", POSTGRES_SSL: "false" }));
  assert.equal(postgresConfigFromEnvironment({ DATABASE_URL: "postgres://user:password@db.example/rovyniq", NODE_ENV: "production" })?.ssl.rejectUnauthorized, true);
});

test("document persistence scopes document and audit writes to the tenant transaction", async () => {
  const tenants: string[] = []; const calls: string[] = [];
  const persistence = new PostgresDocumentPersistence({ withTenant: async (tenantId, work) => { tenants.push(tenantId); return work({ query: async (text: string) => { calls.push(text); return { rows: [] }; } }); } });
  await persistence.saveQuarantined({ record: { id: "doc-1", tenantId: "tenant-1", workspaceId: "workspace-1", objectKey: "tenants/tenant-1/documents/doc-1/quarantine/original", sha256: "a".repeat(64), contentType: "application/pdf", state: "QUARANTINED", documentType: "IT3B", filename: "statement.pdf", byteLength: 20, idempotencyKey: "a".repeat(16) }, audit: { id: "audit-1", occurredAt: "2026-07-27T00:00:00Z", actorId: "taxpayer-1", action: "document.quarantined", entityType: "document", entityId: "doc-1", tenantId: "tenant-1", correlationId: "correlation-1", metadata: {} } });
  assert.deepEqual(tenants, ["tenant-1"]);
  assert.match(calls[0]!, /^insert into documents/);
  assert.match(calls[1]!, /^insert into audit_events/);
});
