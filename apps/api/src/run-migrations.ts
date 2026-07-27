import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import { loadMigrations, runMigrations } from "./migrations.ts";
import { postgresConfigFromEnvironment } from "./postgres.ts";

const configuration = postgresConfigFromEnvironment(process.env);
if (!configuration) throw new Error("DATABASE_URL is required to run migrations.");
const pool = new Pool({ connectionString: configuration.connectionString, ssl: configuration.ssl });
try {
  const directory = fileURLToPath(new URL("../../../infra/postgres/migrations/", import.meta.url));
  const completed = await runMigrations(pool, await loadMigrations(directory));
  console.log(`Applied ${completed.length} migration(s): ${completed.join(", ") || "none"}`);
} finally { await pool.end(); }
