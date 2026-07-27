import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PoolClient, QueryResultRow } from "pg";

export interface Migration { id: string; sql: string; }
interface Sql { query<T extends QueryResultRow = QueryResultRow>(text: string, values?: readonly unknown[]): Promise<{ rows: T[] }>; }
export interface MigrationClient extends Sql { release(): void; }
export interface MigrationPool { connect(): Promise<MigrationClient>; }

export async function loadMigrations(directory: string): Promise<readonly Migration[]> {
  const files = (await readdir(directory)).filter((name) => /^\d{4}_[a-z0-9_]+\.sql$/.test(name)).sort();
  const migrations = await Promise.all(files.map(async (file) => ({ id: file, sql: await readFile(join(directory, file), "utf8") })));
  assertMigrations(migrations);
  return migrations;
}

export function assertMigrations(migrations: readonly Migration[]): void {
  const ids = new Set<string>();
  for (const migration of migrations) {
    if (!/^\d{4}_[a-z0-9_]+\.sql$/.test(migration.id) || !migration.sql.trim() || ids.has(migration.id)) throw new Error("Invalid or duplicate migration.");
    ids.add(migration.id);
  }
  if (migrations.some((migration, index) => index > 0 && migration.id < migrations[index - 1]!.id)) throw new Error("Migrations must be ordered.");
}

export async function runMigrations(pool: MigrationPool, migrations: readonly Migration[]): Promise<readonly string[]> {
  assertMigrations(migrations);
  const client = await pool.connect();
  try {
    await client.query("select pg_advisory_lock(84202601)");
    await client.query("create table if not exists schema_migrations (id text primary key, applied_at timestamptz not null default now())");
    const applied = new Set((await client.query<{ id: string }>("select id from schema_migrations")).rows.map((row) => row.id));
    const completed: string[] = [];
    for (const migration of migrations) {
      if (applied.has(migration.id)) continue;
      await client.query("begin");
      try { await client.query(migration.sql); await client.query("insert into schema_migrations (id) values ($1)", [migration.id]); await client.query("commit"); completed.push(migration.id); } catch (error) { await client.query("rollback"); throw error; }
    }
    return completed;
  } finally { await client.query("select pg_advisory_unlock(84202601)"); client.release(); }
}

export type PostgresMigrationClient = PoolClient;
