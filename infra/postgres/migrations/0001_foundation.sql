-- Apply through a migration runner; never execute manually against production.
create table if not exists return_workspaces (
  id uuid primary key,
  tenant_id uuid not null,
  taxpayer_subject text not null,
  assessment_year smallint not null check (assessment_year >= 2026),
  state text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, taxpayer_subject, assessment_year)
);
create table if not exists documents (
  id uuid primary key,
  tenant_id uuid not null,
  workspace_id uuid not null references return_workspaces(id),
  object_key text not null unique,
  sha256 char(64) not null,
  mime_type text not null,
  state text not null,
  created_at timestamptz not null default now()
);
create table if not exists audit_events (
  id uuid primary key,
  tenant_id uuid not null,
  actor_id text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  correlation_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null
);
create table if not exists outbox_events (
  id uuid primary key,
  aggregate_id uuid not null,
  event_type text not null,
  payload jsonb not null,
  occurred_at timestamptz not null,
  published_at timestamptz
);
alter table return_workspaces enable row level security;
alter table documents enable row level security;
alter table audit_events enable row level security;
create policy workspace_tenant_scope on return_workspaces using (tenant_id::text = current_setting('app.tenant_id', true));
create policy document_tenant_scope on documents using (tenant_id::text = current_setting('app.tenant_id', true));
create policy audit_tenant_scope on audit_events using (tenant_id::text = current_setting('app.tenant_id', true));
