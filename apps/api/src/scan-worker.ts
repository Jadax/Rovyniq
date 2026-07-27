import type { Principal } from "../../../packages/authz/src/index.ts";
import type { ScanResult } from "../../../packages/document-ingestion/src/index.ts";
import type { DocumentIngestionService, DocumentRecord, QuarantineReader } from "../../../packages/document-ingestion/src/service.ts";

export async function runDocumentScanJob(input: { service: DocumentIngestionService; scanner: { scan(input: { documentId: string; sha256: string; bytes: Uint8Array }): Promise<ScanResult> }; reader: QuarantineReader; record: DocumentRecord; worker: Principal; correlationId: string }): Promise<{ completed: boolean; state?: "VALIDATED" | "ARCHIVED" }> {
  if (!input.worker.roles.includes("system_admin") || input.worker.organisationId !== input.record.tenantId) return { completed: false };
  return input.service.scan({ principal: input.worker, record: input.record, scanner: input.scanner, reader: input.reader, correlationId: input.correlationId });
}
