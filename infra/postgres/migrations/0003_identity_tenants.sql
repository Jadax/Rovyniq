-- A ZITADEL organisation is not a tax-data boundary. Each authenticated taxpayer
-- receives one Rovyniq-owned tenant, preventing unrelated public users from
-- sharing a tenant merely because their identity provider uses a common project.
create table if not exists identity_tenants (
  id uuid primary key,
  identity_subject text not null unique,
  identity_organisation_id text,
  created_at timestamptz not null default now()
);
