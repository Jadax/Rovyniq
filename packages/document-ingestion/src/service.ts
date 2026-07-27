import { createAuditEvent, type AuditEvent } from "../../audit/src/index.ts";
import { requirePermission, type Principal } from "../../authz/src/index.ts";
import type { DocumentState, DocumentType } from "../../canonical-tax-model/src/index.ts";
import { quarantineDocumentKey, type ObjectStorage } from "../../storage/src/index.ts";
import { createQuarantinedDocument, validateUploadCandidate, type QuarantinedDocument, type ScanResult, type UploadCandidate, type UploadFailure } from "./index.ts";

export interface WorkspaceAccess { taxpayerSubject(tenantId: string, workspaceId: string): Promise<string | null>; }
export interface DocumentRecord extends QuarantinedDocument { tenantId: string; workspaceId: string; objectKey: string; idempotencyKey: string; }
export interface DocumentPersistence { findByIdempotencyKey(tenantId: string, workspaceId: string, idempotencyKey: string): Promise<DocumentRecord | null>; saveQuarantined(input: { record: DocumentRecord; audit: AuditEvent }): Promise<void>; recordScanOutcome(input: { tenantId: string; documentId: string; state: Extract<DocumentState, "VALIDATED" | "ARCHIVED">; scan: ScanResult; audit: AuditEvent }): Promise<void>; }
export interface QuarantineReader { readImmutable(key: string): Promise<Uint8Array>; }
export interface StagedUpload { accepted: boolean; document?: DocumentRecord; failure?: UploadFailure | "forbidden" | "invalid_idempotency_key"; replayed?: boolean; }

export class DocumentIngestionService {
  private readonly dependencies: { storage: ObjectStorage; persistence: DocumentPersistence; workspaces: WorkspaceAccess; now?: () => Date };
  constructor(dependencies: { storage: ObjectStorage; persistence: DocumentPersistence; workspaces: WorkspaceAccess; now?: () => Date }) { this.dependencies = dependencies; }

  async stage(input: { principal: Principal; tenantId: string; workspaceId: string; idempotencyKey: string; documentType: DocumentType; candidate: UploadCandidate; correlationId: string }): Promise<StagedUpload> {
    if (!/^[A-Za-z0-9_-]{16,128}$/.test(input.idempotencyKey)) return { accepted: false, failure: "invalid_idempotency_key" };
    if (input.principal.organisationId !== input.tenantId) return { accepted: false, failure: "forbidden" };
    try { requirePermission(input.principal, "document:upload"); } catch { return { accepted: false, failure: "forbidden" }; }
    const owner = await this.dependencies.workspaces.taxpayerSubject(input.tenantId, input.workspaceId);
    if (!owner || (input.principal.roles.includes("taxpayer") && owner !== input.principal.subject)) return { accepted: false, failure: "forbidden" };
    const existing = await this.dependencies.persistence.findByIdempotencyKey(input.tenantId, input.workspaceId, input.idempotencyKey);
    if (existing) return { accepted: true, document: existing, replayed: true };
    const failure = validateUploadCandidate(input.candidate);
    if (failure) return { accepted: false, failure };
    const document = createQuarantinedDocument({ ...input.candidate, documentType: input.documentType, documentId: crypto.randomUUID() });
    const record: DocumentRecord = { ...document, tenantId: input.tenantId, workspaceId: input.workspaceId, idempotencyKey: input.idempotencyKey, objectKey: quarantineDocumentKey(input.tenantId, document.id) };
    await this.dependencies.storage.putImmutable({ key: record.objectKey, bytes: input.candidate.bytes, contentType: record.contentType, sha256: record.sha256 });
    const audit = createAuditEvent({ actorId: input.principal.subject, action: "document.quarantined", entityType: "document", entityId: record.id, tenantId: record.tenantId, correlationId: input.correlationId, metadata: { workspaceId: record.workspaceId, sha256: record.sha256, byteLength: record.byteLength } }, this.dependencies.now?.());
    await this.dependencies.persistence.saveQuarantined({ record, audit });
    return { accepted: true, document: record };
  }

  async scan(input: { principal: Principal; record: DocumentRecord; scanner: { scan(input: { documentId: string; sha256: string; bytes: Uint8Array }): Promise<ScanResult> }; reader: QuarantineReader; correlationId: string }): Promise<{ completed: boolean; state?: "VALIDATED" | "ARCHIVED" }> {
    if (input.principal.organisationId !== input.record.tenantId) return { completed: false };
    const bytes = await input.reader.readImmutable(input.record.objectKey);
    const scan = await input.scanner.scan({ documentId: input.record.id, sha256: input.record.sha256, bytes });
    if (scan.verdict === "unavailable") return { completed: false };
    const state = scan.verdict === "clean" ? "VALIDATED" : "ARCHIVED";
    const audit = createAuditEvent({ actorId: input.principal.subject, action: scan.verdict === "clean" ? "document.scan_clean" : "document.scan_malicious", entityType: "document", entityId: input.record.id, tenantId: input.record.tenantId, correlationId: input.correlationId, metadata: { scanner: scan.engine, verdict: scan.verdict } }, this.dependencies.now?.());
    await this.dependencies.persistence.recordScanOutcome({ tenantId: input.record.tenantId, documentId: input.record.id, state, scan, audit });
    return { completed: true, state };
  }
}
