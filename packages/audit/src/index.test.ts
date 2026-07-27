import test from "node:test";
import assert from "node:assert/strict";
import { createAuditEvent } from "./index.ts";
test("audit event has immutable identity and timestamp", () => {
  const event = createAuditEvent({ actorId: "u1", action: "workspace.created", entityType: "workspace", entityId: "w1", tenantId: "t1", correlationId: "c1", metadata: {} }, new Date("2026-07-27T00:00:00Z"));
  assert.match(event.id, /^[0-9a-f-]{36}$/); assert.equal(event.occurredAt, "2026-07-27T00:00:00.000Z");
});
