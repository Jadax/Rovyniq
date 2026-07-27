# Encrypted S3-compatible object storage

`apps/api/src/encrypted-storage.ts` implements the Rovyniq object-storage port for an approved S3-compatible service such as SeaweedFS. It requires a secret-managed endpoint, bucket, access credentials and a 32-byte storage master key. Production endpoints must use HTTPS.

Each original is encrypted in the application before upload with a unique AES-256-GCM data key. That data key is separately AES-256-GCM wrapped by the storage master key; encryption IVs, authentication tags, key version and the evidence SHA-256 are kept as object metadata. The adapter also requests provider-side AES-256 encryption. On reading, it unwraps the data key, authenticates/decrypts the object, and verifies the plaintext SHA-256 before releasing bytes to a trusted service.

The adapter refuses overwrite attempts and does not create direct download URLs for originals. An authenticated application endpoint must authorise and stream any decrypted original; the browser must never receive storage credentials, master keys, plaintext presigned links, or access to quarantine keys.

Before activation, configure an immutable private bucket, versioning/object-lock policy where supported, least-privilege service credentials, encrypted backups, key rotation procedure, retention/deletion policy, alerting, and restore drills. The adapter is unconnected in this workspace and does not make uploads live.
