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

export interface SourceCodeCandidate { sourceCode: string; amount: number; rawValue: string; }
/** Conservative IRP5/IT3 candidate reader. Values remain pending human review. */
export function extractSarsSourceCodeCandidates(text: string): readonly SourceCodeCandidate[] {
  const found = new Map<string, SourceCodeCandidate>();
  for (const match of text.matchAll(/\b(3\d{3}|4\d{3})\s*(?:R|ZAR)?\s*([\d][\d, .]*)\b|\b(?:R|ZAR)?\s*([\d][\d, .]*)\s*(3\d{3}|4\d{3})\b/gi)) {
    const sourceCode = match[1] ?? match[4]; const rawValue = (match[2] ?? match[3]).replace(/\s/g, ""); const amount = Number(rawValue.replace(/,/g, ""));
    if (sourceCode && Number.isFinite(amount) && amount >= 0 && amount <= 100_000_000) found.set(sourceCode, { sourceCode, amount, rawValue });
  }
  return [...found.values()].sort((a, b) => a.sourceCode.localeCompare(b.sourceCode));
}
