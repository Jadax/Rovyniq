import test from "node:test";
import assert from "node:assert/strict";
import { maximumDocumentBytes, quarantineAndScan, validateUploadCandidate } from "./index.ts";

const pdf = new TextEncoder().encode("%PDF-1.7 synthetic fixture");
const cleanScanner = { scan: async () => ({ verdict: "clean" as const, engine: "test-scanner", scannedAt: "2026-07-27T00:00:00.000Z" }) };

test("upload policy accepts only bounded PDFs with a PDF signature", () => {
  assert.equal(validateUploadCandidate({ filename: "statement.pdf", contentType: "application/pdf", bytes: pdf }), null);
  assert.equal(validateUploadCandidate({ filename: "statement.pdf", contentType: "image/png", bytes: pdf }), "unsupported_content_type");
  assert.equal(validateUploadCandidate({ filename: "statement.pdf", contentType: "application/pdf", bytes: new Uint8Array(maximumDocumentBytes + 1) }), "file_too_large");
  assert.equal(validateUploadCandidate({ filename: "statement.pdf", contentType: "application/pdf", bytes: new TextEncoder().encode("not a pdf") }), "invalid_pdf_signature");
});

test("ingestion quarantines then requires a clean malware verdict", async () => {
  const accepted = await quarantineAndScan({ documentId: "doc-1", documentType: "IT3B", filename: "interest:statement.pdf", contentType: "application/pdf", bytes: pdf }, cleanScanner);
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.document?.state, "QUARANTINED");
  assert.match(accepted.document?.sha256 ?? "", /^[a-f0-9]{64}$/);
  assert.equal(accepted.document?.filename, "interest_statement.pdf");
  const blocked = await quarantineAndScan({ documentId: "doc-2", documentType: "IT3B", filename: "statement.pdf", contentType: "application/pdf", bytes: pdf }, { scan: async () => ({ verdict: "unavailable" as const, engine: "test-scanner", scannedAt: "2026-07-27T00:00:00.000Z" }) });
  assert.deepEqual({ accepted: blocked.accepted, failure: blocked.failure }, { accepted: false, failure: "scanner_unavailable" });
});
