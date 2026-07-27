-- Adds only non-tax document metadata required by the quarantine and scanning workflow.
alter table documents add column if not exists document_type text not null default 'OTHER';
alter table documents add column if not exists original_filename text not null default 'document.pdf';
alter table documents add column if not exists byte_length integer not null default 0 check (byte_length >= 0);
alter table documents add column if not exists idempotency_key text;
alter table documents add column if not exists scan_engine text;
alter table documents add column if not exists scan_verdict text;
alter table documents add column if not exists scanned_at timestamptz;
create unique index if not exists documents_tenant_workspace_idempotency_key on documents (tenant_id, workspace_id, idempotency_key) where idempotency_key is not null;
