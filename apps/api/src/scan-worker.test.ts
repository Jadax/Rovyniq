import test from "node:test";
import assert from "node:assert/strict";
import { runDocumentScanJob } from "./scan-worker.ts";

test("scan worker rejects a principal without the isolated worker role", async () => {
  const result = await runDocumentScanJob({ service: {} as never, scanner: {} as never, reader: {} as never, record: { id: "doc-1", tenantId: "tenant-1" } as never, worker: { subject: "worker", organisationId: "tenant-1", roles: ["taxpayer"], verifiedBy: "oidc" }, correlationId: "c-1" });
  assert.deepEqual(result, { completed: false });
});
