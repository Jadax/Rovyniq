import { PDFParse } from "pdf-parse";

/** Extracts text only from a document that has already been malware-validated.
 * It makes no network request and returns no tax value by itself. */
export async function extractValidatedPdfText(bytes: Uint8Array): Promise<{ text: string; pageCount: number }> {
  const parser = new PDFParse({ data: bytes });
  try {
    const result = await parser.getText();
    return { text: result.text.slice(0, 500_000), pageCount: result.total };
  } finally { await parser.destroy(); }
}
