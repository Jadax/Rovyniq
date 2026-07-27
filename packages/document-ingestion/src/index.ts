import { createHash } from "node:crypto";
import type { DocumentState, DocumentType } from "../../canonical-tax-model/src/index.ts";

export const maximumDocumentBytes = 10 * 1024 * 1024;
export const acceptedDocumentContentTypes = ["application/pdf"] as const;
export type UploadFailure = "empty_file" | "file_too_large" | "unsupported_content_type" | "invalid_pdf_signature" | "scanner_unavailable" | "malware_detected";
export interface UploadCandidate { filename: string; contentType: string; bytes: Uint8Array; }
export interface QuarantinedDocument { id: string; documentType: DocumentType; state: Extract<DocumentState, "QUARANTINED">; sha256: string; contentType: "application/pdf"; filename: string; byteLength: number; }
export interface ScanResult { verdict: "clean" | "malicious" | "unavailable"; engine: string; scannedAt: string; }
export interface MalwareScanner { scan(input: { documentId: string; sha256: string; bytes: Uint8Array }): Promise<ScanResult>; }
export interface IngestionOutcome { accepted: boolean; document?: QuarantinedDocument; failure?: UploadFailure; scan?: ScanResult; }

export function validateUploadCandidate(candidate: UploadCandidate): UploadFailure | null {
  if (candidate.bytes.byteLength === 0) return "empty_file";
  if (candidate.bytes.byteLength > maximumDocumentBytes) return "file_too_large";
  if (!acceptedDocumentContentTypes.includes(candidate.contentType as "application/pdf")) return "unsupported_content_type";
  if (new TextDecoder().decode(candidate.bytes.slice(0, 5)) !== "%PDF-") return "invalid_pdf_signature";
  return null;
}

export async function quarantineAndScan(input: UploadCandidate & { documentType: DocumentType; documentId: string }, scanner: MalwareScanner): Promise<IngestionOutcome> {
  const failure = validateUploadCandidate(input);
  if (failure) return { accepted: false, failure };
  const document: QuarantinedDocument = { id: input.documentId, documentType: input.documentType, state: "QUARANTINED", sha256: createHash("sha256").update(input.bytes).digest("hex"), contentType: "application/pdf", filename: safeFilename(input.filename), byteLength: input.bytes.byteLength };
  const scan = await scanner.scan({ documentId: document.id, sha256: document.sha256, bytes: input.bytes });
  if (scan.verdict === "unavailable") return { accepted: false, failure: "scanner_unavailable", document, scan };
  if (scan.verdict === "malicious") return { accepted: false, failure: "malware_detected", document, scan };
  return { accepted: true, document, scan };
}

function safeFilename(filename: string): string {
  return filename.replace(/[\\/:*?"<>|\u0000-\u001f]/g, "_").slice(0, 180) || "document.pdf";
}
