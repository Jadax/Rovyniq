# Database direction

Use PostgreSQL with tenant-scoped tables and database constraints. The foundation migration creates workspace, document, audit event and outbox tables, enables row-level security, and requires `app.tenant_id` on every application connection. Core future tables: document_page, extracted_field, evidence_reference, employment_certificate, approval_snapshot and submission_package. Migration/row-level access design must be reviewed before implementation.
