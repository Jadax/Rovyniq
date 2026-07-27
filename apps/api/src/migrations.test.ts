import test from "node:test";
import assert from "node:assert/strict";
import { assertMigrations, runMigrations } from "./migrations.ts";

test("migration runner applies each ordered migration once under an advisory lock", async () => {
  const calls: string[] = [];
  const applied = new Set<string>(["0001_foundation.sql"]);
  const client = { query: async (text: string, values?: readonly unknown[]) => { calls.push(text); if (text === "select id from schema_migrations") return { rows: [...applied].map((id) => ({ id })) }; if (text === "insert into schema_migrations (id) values ($1)") { applied.add(String(values?.[0])); } return { rows: [] }; }, release: () => calls.push("release") };
  const completed = await runMigrations({ connect: async () => client }, [{ id: "0001_foundation.sql", sql: "select 1" }, { id: "0002_document_ingestion.sql", sql: "select 2" }]);
  assert.deepEqual(completed, ["0002_document_ingestion.sql"]);
  assert.equal(calls.includes("select pg_advisory_lock(84202601)"), true);
  assert.equal(calls.includes("select pg_advisory_unlock(84202601)"), true);
});

test("migration validation rejects duplicate and unordered files", () => {
  assert.throws(() => assertMigrations([{ id: "0002_b.sql", sql: "select 1" }, { id: "0001_a.sql", sql: "select 1" }]));
  assert.throws(() => assertMigrations([{ id: "0001_a.sql", sql: "select 1" }, { id: "0001_a.sql", sql: "select 1" }]));
});
