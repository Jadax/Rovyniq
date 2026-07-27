# PostgreSQL persistence and migrations

`apps/api/src/postgres.ts` provides tenant-scoped persistence for the document-ingestion service. Every operation runs inside a transaction that sets `app.tenant_id` with transaction-local scope, so the database row-level-security policies provide a second tenant boundary. The application role must not own the tables or have `BYPASSRLS`.

`apps/api/src/migrations.ts` loads numbered SQL migrations, validates their order, obtains a PostgreSQL advisory lock, and records each successful migration in `schema_migrations`. It applies each pending migration in its own transaction.

Run `npm.cmd run migrate --workspace @rovyniq/api` only from an approved deployment environment with `DATABASE_URL` and PostgreSQL TLS configured through a secret manager. Never run migrations from GitHub Pages, developer preview, or against production without reviewed backups and a change window.

The adapter is ready for a PostgreSQL service but has not been pointed at one in this workspace. It does not make document uploads live by itself.
