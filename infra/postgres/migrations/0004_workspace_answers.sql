-- Immutable answer revisions; a later answer never overwrites the audit record.
create table if not exists workspace_answer_revisions (
  id uuid primary key,
  tenant_id uuid not null,
  workspace_id uuid not null references return_workspaces(id),
  question_key text not null,
  value jsonb not null,
  source text not null check (source in ('user','reviewer')),
  revision integer not null check (revision > 0),
  created_at timestamptz not null default now(),
  unique (workspace_id, question_key, revision)
);
alter table workspace_answer_revisions enable row level security;
create policy workspace_answer_tenant_scope on workspace_answer_revisions using (tenant_id::text = current_setting('app.tenant_id', true));
