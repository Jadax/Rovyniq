import type { IncomingMessage } from "node:http";
import { maximumDocumentBytes } from "../../../packages/document-ingestion/src/index.ts";

export async function readBoundedPdf(request: IncomingMessage): Promise<Uint8Array> {
  const contentLength = Number(request.headers["content-length"] ?? "0");
  if (!Number.isInteger(contentLength) || contentLength < 1 || contentLength > maximumDocumentBytes) throw new Error("payload_too_large");
  if ((request.headers["content-type"] ?? "").split(";", 1)[0] !== "application/pdf") throw new Error("unsupported_content_type");
  const chunks: Buffer[] = []; let total = 0;
  for await (const chunk of request) { const bytes = Buffer.from(chunk); total += bytes.byteLength; if (total > maximumDocumentBytes) throw new Error("payload_too_large"); chunks.push(bytes); }
  return Buffer.concat(chunks);
}
