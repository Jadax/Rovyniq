import { createConnection, type Socket } from "node:net";
import type { MalwareScanner, ScanResult } from "../../../packages/document-ingestion/src/index.ts";

export interface ClamAvConfig { host: string; port: number; timeoutMs: number; }
export function clamAvConfigFromEnvironment(environment: NodeJS.ProcessEnv): ClamAvConfig | null {
  const host = environment.CLAMAV_HOST;
  if (!host) return null;
  const port = Number(environment.CLAMAV_PORT ?? "3310");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("CLAMAV_PORT must be a valid TCP port.");
  const timeoutMs = Number(environment.CLAMAV_TIMEOUT_MS ?? "30000");
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1000 || timeoutMs > 120000) throw new Error("CLAMAV_TIMEOUT_MS must be between 1000 and 120000 milliseconds.");
  return { host, port, timeoutMs };
}

export function encodeInstream(bytes: Uint8Array): Buffer {
  const chunks: Buffer[] = [Buffer.from("zINSTREAM\0")];
  for (let offset = 0; offset < bytes.byteLength; offset += 1024 * 1024) { const chunk = bytes.slice(offset, offset + 1024 * 1024); const length = Buffer.alloc(4); length.writeUInt32BE(chunk.byteLength); chunks.push(length, Buffer.from(chunk)); }
  chunks.push(Buffer.alloc(4));
  return Buffer.concat(chunks);
}
export function classifyClamAvReply(reply: string): "clean" | "malicious" | "unavailable" { if (/\bOK\b/.test(reply)) return "clean"; if (/\bFOUND\b/.test(reply)) return "malicious"; return "unavailable"; }

export class ClamAvDaemonScanner implements MalwareScanner {
  private readonly configuration: ClamAvConfig;
  constructor(configuration: ClamAvConfig) { this.configuration = configuration; }
  async scan(input: { documentId: string; sha256: string; bytes: Uint8Array }): Promise<ScanResult> {
    try {
      const reply = await sendToDaemon(this.configuration, encodeInstream(input.bytes));
      return { verdict: classifyClamAvReply(reply), engine: "clamav-daemon", scannedAt: new Date().toISOString() };
    } catch { return { verdict: "unavailable", engine: "clamav-daemon", scannedAt: new Date().toISOString() }; }
  }
}

function sendToDaemon(configuration: ClamAvConfig, request: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const socket: Socket = createConnection({ host: configuration.host, port: configuration.port });
    const chunks: Buffer[] = [];
    const timeout = setTimeout(() => { socket.destroy(); reject(new Error("ClamAV scan timed out.")); }, configuration.timeoutMs);
    socket.once("connect", () => socket.end(request));
    socket.on("data", (chunk: Buffer) => chunks.push(chunk));
    socket.once("error", (error) => { clearTimeout(timeout); reject(error); });
    socket.once("end", () => { clearTimeout(timeout); resolve(Buffer.concat(chunks).toString("utf8")); });
  });
}
