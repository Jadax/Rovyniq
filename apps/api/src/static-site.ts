import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { ServerResponse } from "node:http";

const webRoot = fileURLToPath(new URL("../../web/", import.meta.url));

const assets = new Map<string, { file: string; contentType: string }>([
  ["/", { file: "index.html", contentType: "text/html; charset=utf-8" }],
  ["/index.html", { file: "index.html", contentType: "text/html; charset=utf-8" }],
  ["/workspace", { file: "workspace.html", contentType: "text/html; charset=utf-8" }],
  ["/workspace.html", { file: "workspace.html", contentType: "text/html; charset=utf-8" }],
  ["/app", { file: "app.html", contentType: "text/html; charset=utf-8" }],
  ["/app.html", { file: "app.html", contentType: "text/html; charset=utf-8" }],
  ["/documents", { file: "documents.html", contentType: "text/html; charset=utf-8" }],
  ["/documents.html", { file: "documents.html", contentType: "text/html; charset=utf-8" }],
  ["/interview", { file: "interview.html", contentType: "text/html; charset=utf-8" }],
  ["/interview.html", { file: "interview.html", contentType: "text/html; charset=utf-8" }],
  ["/styles.css", { file: "styles.css", contentType: "text/css; charset=utf-8" }],
  ["/workspace.css", { file: "workspace.css", contentType: "text/css; charset=utf-8" }],
  ["/documents.css", { file: "documents.css", contentType: "text/css; charset=utf-8" }],
  ["/interview.css", { file: "interview.css", contentType: "text/css; charset=utf-8" }],
  ["/app.js", { file: "app.js", contentType: "text/javascript; charset=utf-8" }],
  ["/documents.js", { file: "documents.js", contentType: "text/javascript; charset=utf-8" }],
  ["/interview.js", { file: "interview.js", contentType: "text/javascript; charset=utf-8" }],
  ["/pdf-extract.js", { file: "pdf-extract.js", contentType: "text/javascript; charset=utf-8" }],
  ["/sections.js", { file: "sections.js", contentType: "text/javascript; charset=utf-8" }],
  ["/submission", { file: "submission.html", contentType: "text/html; charset=utf-8" }],
  ["/submission.html", { file: "submission.html", contentType: "text/html; charset=utf-8" }],
  ["/submission.js", { file: "submission.js", contentType: "text/javascript; charset=utf-8" }]
]);

export function staticAsset(pathname: string): { file: string; contentType: string } | undefined {
  return assets.get(pathname);
}

export async function serveStaticSite(pathname: string, response: ServerResponse, method: string): Promise<boolean> {
  const asset = staticAsset(pathname);
  if (!asset) return false;
  try {
    const body = method === "HEAD" ? undefined : await readFile(new URL(asset.file, new URL("../../web/", import.meta.url)));
    response.writeHead(200, {
      "content-type": asset.contentType,
      "cache-control": "no-store",
      "content-security-policy": "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; style-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; worker-src 'self' https://cdnjs.cloudflare.com; connect-src 'self'",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=(), microphone=(), geolocation=()",
      "x-content-type-options": "nosniff"
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff" });
    response.end(JSON.stringify({ error: "site_asset_unavailable" }));
  }
  return true;
}

export const privatePilotWebRoot = webRoot;
