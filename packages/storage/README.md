# Storage port

Documents are addressed through this S3-compatible abstraction. The caller must preserve immutable originals, write derivatives under a separate key, and issue short-lived access links. No concrete provider is committed yet.
