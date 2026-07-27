import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { EncryptedS3ObjectStorage, objectStorageConfigFromEnvironment } from "./encrypted-storage.ts";

const configuration = { endpoint: "https://s3.example.test", bucket: "rovyniq", accessKeyId: "key", secretAccessKey: "secret", masterKey: new Uint8Array(32).fill(9), keyVersion: "v1", region: "us-east-1", forcePathStyle: true };

test("encrypted storage requires an HTTPS endpoint and an exact master key in production", () => {
  assert.throws(() => objectStorageConfigFromEnvironment({ NODE_ENV: "production", S3_ENDPOINT: "http://s3.example.test", S3_BUCKET: "rovyniq", S3_ACCESS_KEY_ID: "key", S3_SECRET_ACCESS_KEY: "secret", STORAGE_MASTER_KEY: Buffer.alloc(32).toString("base64url") }));
  assert.throws(() => objectStorageConfigFromEnvironment({ S3_ENDPOINT: "https://s3.example.test", S3_BUCKET: "rovyniq", S3_ACCESS_KEY_ID: "key", S3_SECRET_ACCESS_KEY: "secret", STORAGE_MASTER_KEY: Buffer.alloc(31).toString("base64url") }));
});

test("objects are client-side encrypted, immutable and integrity checked before use", async () => {
  let put: PutObjectCommand | undefined;
  const bytes = new TextEncoder().encode("synthetic PDF bytes");
  const transport = { send: async (command: object) => { if (command instanceof HeadObjectCommand) { const error: any = new Error("missing"); error.name = "NotFound"; throw error; } if (command instanceof PutObjectCommand) { put = command; return {}; } if (command instanceof GetObjectCommand) return { Metadata: put!.input.Metadata, Body: { transformToByteArray: async () => put!.input.Body as Uint8Array } }; throw new Error("unexpected command"); } };
  const storage = new EncryptedS3ObjectStorage(configuration, transport);
  await storage.putImmutable({ key: "tenants/t/documents/d/quarantine/original", bytes, contentType: "application/pdf", sha256: createHash("sha256").update(bytes).digest("hex") });
  assert.notDeepEqual(put!.input.Body, bytes);
  assert.equal(put!.input.ServerSideEncryption, "AES256");
  const recovered = await storage.readImmutable("tenants/t/documents/d/quarantine/original");
  assert.deepEqual(new Uint8Array(recovered), bytes);
  await assert.rejects(storage.createReadUrl({ key: "anything", expiresInSeconds: 60 }));
});
