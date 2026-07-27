import test from "node:test";
import assert from "node:assert/strict";
import { DocumentIngestionService, type DocumentRecord } from "./service.ts";

const principal = { subject: "taxpayer-1", organisationId: "tenant-1", roles: ["taxpayer"] as const, verifiedBy: "oidc" as const };
const candidate = { filename: "it3b.pdf", contentType: "application/pdf", bytes: new TextEncoder().encode("%PDF-1.7 synthetic fixture") };

function dependencies() {
  const records = new Map<string, DocumentRecord>();
  const objects = new Map<string, Uint8Array>();
  const outcomes: string[] = [];
  return {
    records, objects, outcomes,
    service: new DocumentIngestionService({
      storage: { putImmutable: async ({ key, bytes }) => { if (objects.has(key)) throw new Error("immutable collision"); objects.set(key, bytes); }, createReadUrl: async () => "", exists: async (key) => objects.has(key) },
      persistence: { findByIdempotencyKey: async (_tenant, _workspace, key) => records.get(key) ?? null, saveQuarantined: async ({ record, audit }) => { records.set(record.idempotencyKey, record); assert.equal(audit.action, "document.quarantined"); }, recordScanOutcome: async ({ state, audit }) => { outcomes.push(`${state}:${audit.action}`); } },
      workspaces: { taxpayerSubject: async () => "taxpayer-1" }, now: () => new Date("2026-07-27T00:00:00Z")
    })
  };
}

test("staging requires matching tenant, owner and an idempotency key before immutable quarantine storage", async () => {
  const setup = dependencies();
  const rejected = await setup.service.stage({ principal: { ...principal, organisationId: "tenant-2" }, tenantId: "tenant-1", workspaceId: "workspace-1", idempotencyKey: "a".repeat(16), documentType: "IT3B", candidate, correlationId: "c-1" });
  assert.deepEqual(rejected, { accepted: false, failure: "forbidden" });
  const staged = await setup.service.stage({ principal, tenantId: "tenant-1", workspaceId: "workspace-1", idempotencyKey: "a".repeat(16), documentType: "IT3B", candidate, correlationId: "c-2" });
  assert.equal(staged.accepted, true);
  assert.equal(staged.document?.state, "QUARANTINED");
  assert.equal(setup.objects.size, 1);
  const replay = await setup.service.stage({ principal, tenantId: "tenant-1", workspaceId: "workspace-1", idempotencyKey: "a".repeat(16), documentType: "IT3B", candidate, correlationId: "c-3" });
  assert.equal(replay.replayed, true);
  assert.equal(setup.objects.size, 1);
});

test("scan reads only the quarantined immutable object and retains malicious originals", async () => {
  const setup = dependencies();
  const staged = await setup.service.stage({ principal, tenantId: "tenant-1", workspaceId: "workspace-1", idempotencyKey: "b".repeat(16), documentType: "IT3B", candidate, correlationId: "c-1" });
  const result = await setup.service.scan({ principal, record: staged.document!, reader: { readImmutable: async (key) => setup.objects.get(key)! }, scanner: { scan: async () => ({ verdict: "malicious", engine: "test-scanner", scannedAt: "2026-07-27T00:00:00Z" }) }, correlationId: "c-2" });
  assert.deepEqual(result, { completed: true, state: "ARCHIVED" });
  assert.deepEqual(setup.outcomes, ["ARCHIVED:document.scan_malicious"]);
  assert.equal(setup.objects.size, 1);
});
