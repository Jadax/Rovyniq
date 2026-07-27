import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { ObjectStorage } from "../../../packages/storage/src/index.ts";

export interface ObjectStorageConfig { endpoint: string; region: string; bucket: string; accessKeyId: string; secretAccessKey: string; masterKey: Uint8Array; keyVersion: string; forcePathStyle: boolean; }
export interface S3Transport { send(command: object): Promise<any>; }

export function objectStorageConfigFromEnvironment(environment: NodeJS.ProcessEnv): ObjectStorageConfig | null {
  const endpoint = environment.S3_ENDPOINT; const bucket = environment.S3_BUCKET; const accessKeyId = environment.S3_ACCESS_KEY_ID; const secretAccessKey = environment.S3_SECRET_ACCESS_KEY; const encodedMasterKey = environment.STORAGE_MASTER_KEY;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey || !encodedMasterKey) return null;
  const parsed = new URL(endpoint);
  if (environment.NODE_ENV === "production" && parsed.protocol !== "https:") throw new Error("S3 endpoint must use HTTPS in production.");
  const masterKey = Buffer.from(encodedMasterKey, "base64url");
  if (masterKey.byteLength !== 32) throw new Error("STORAGE_MASTER_KEY must be exactly 32 random bytes encoded as base64url.");
  return { endpoint, bucket, accessKeyId, secretAccessKey, masterKey, keyVersion: environment.STORAGE_KEY_VERSION ?? "v1", region: environment.S3_REGION ?? "us-east-1", forcePathStyle: environment.S3_FORCE_PATH_STYLE !== "false" };
}

export class EncryptedS3ObjectStorage implements ObjectStorage {
  private readonly client: S3Transport;
  private readonly configuration: ObjectStorageConfig;
  constructor(configuration: ObjectStorageConfig, client?: S3Transport) { this.configuration = configuration; this.client = client ?? new S3Client({ endpoint: configuration.endpoint, region: configuration.region, forcePathStyle: configuration.forcePathStyle, credentials: { accessKeyId: configuration.accessKeyId, secretAccessKey: configuration.secretAccessKey } }); }

  async putImmutable(input: { key: string; bytes: Uint8Array; contentType: string; sha256: string }): Promise<void> {
    if (await this.exists(input.key)) throw new Error("Immutable object already exists.");
    const encrypted = encrypt(input.bytes, this.configuration.masterKey);
    await this.client.send(new PutObjectCommand({ Bucket: this.configuration.bucket, Key: input.key, Body: encrypted.ciphertext, ContentType: "application/octet-stream", Metadata: { "rovyniq-algorithm": "aes-256-gcm-envelope-v1", "rovyniq-iv": encrypted.iv.toString("base64url"), "rovyniq-tag": encrypted.tag.toString("base64url"), "rovyniq-wrapped-key": encrypted.wrappedKey.toString("base64url"), "rovyniq-wrap-iv": encrypted.wrapIv.toString("base64url"), "rovyniq-wrap-tag": encrypted.wrapTag.toString("base64url"), "rovyniq-key-version": this.configuration.keyVersion, "rovyniq-sha256": input.sha256, "rovyniq-original-content-type": input.contentType }, ServerSideEncryption: "AES256", IfNoneMatch: "*" }));
  }
  async exists(key: string): Promise<boolean> {
    try { await this.client.send(new HeadObjectCommand({ Bucket: this.configuration.bucket, Key: key })); return true; } catch (error: any) { if (error?.$metadata?.httpStatusCode === 404 || error?.name === "NotFound" || error?.name === "NoSuchKey") return false; throw error; }
  }
  async readImmutable(key: string): Promise<Uint8Array> {
    const response = await this.client.send(new GetObjectCommand({ Bucket: this.configuration.bucket, Key: key }));
    const metadata = response.Metadata ?? {};
    if (metadata["rovyniq-algorithm"] !== "aes-256-gcm-envelope-v1" || !metadata["rovyniq-iv"] || !metadata["rovyniq-tag"] || !metadata["rovyniq-wrapped-key"] || !metadata["rovyniq-wrap-iv"] || !metadata["rovyniq-wrap-tag"] || !metadata["rovyniq-sha256"] || !response.Body?.transformToByteArray) throw new Error("Stored object lacks required encryption metadata.");
    const plaintext = decrypt(await response.Body.transformToByteArray(), this.configuration.masterKey, Buffer.from(metadata["rovyniq-iv"], "base64url"), Buffer.from(metadata["rovyniq-tag"], "base64url"), Buffer.from(metadata["rovyniq-wrapped-key"], "base64url"), Buffer.from(metadata["rovyniq-wrap-iv"], "base64url"), Buffer.from(metadata["rovyniq-wrap-tag"], "base64url"));
    if (createHash("sha256").update(plaintext).digest("hex") !== metadata["rovyniq-sha256"]) throw new Error("Stored object integrity check failed.");
    return plaintext;
  }
  async createReadUrl(): Promise<string> { throw new Error("Encrypted originals must be streamed through an authenticated Rovyniq endpoint, never exposed through direct object-storage URLs."); }
}

function encrypt(plaintext: Uint8Array, masterKey: Uint8Array): { ciphertext: Buffer; iv: Buffer; tag: Buffer; wrappedKey: Buffer; wrapIv: Buffer; wrapTag: Buffer } { const dataKey = randomBytes(32); const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", dataKey, iv); const wrapIv = randomBytes(12); const wrapper = createCipheriv("aes-256-gcm", masterKey, wrapIv); return { ciphertext: Buffer.concat([cipher.update(plaintext), cipher.final()]), iv, tag: cipher.getAuthTag(), wrappedKey: Buffer.concat([wrapper.update(dataKey), wrapper.final()]), wrapIv, wrapTag: wrapper.getAuthTag() }; }
function decrypt(ciphertext: Uint8Array, masterKey: Uint8Array, iv: Uint8Array, tag: Uint8Array, wrappedKey: Uint8Array, wrapIv: Uint8Array, wrapTag: Uint8Array): Uint8Array { const unwrapper = createDecipheriv("aes-256-gcm", masterKey, wrapIv); unwrapper.setAuthTag(wrapTag); const dataKey = Buffer.concat([unwrapper.update(wrappedKey), unwrapper.final()]); const decipher = createDecipheriv("aes-256-gcm", dataKey, iv); decipher.setAuthTag(tag); return Buffer.concat([decipher.update(ciphertext), decipher.final()]); }
