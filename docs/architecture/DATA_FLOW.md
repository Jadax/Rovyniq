# Data flow

Upload → quarantine → validate/scan/hash → extract/classify → schema validate → evidence-linked candidate → user/reviewer confirmation → reconcile → deterministic calculation → immutable approval snapshot → manual handoff. Every transition will be permission-checked, idempotent and audited.
