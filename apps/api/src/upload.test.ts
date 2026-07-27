import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { readBoundedPdf } from "./upload.ts";
test("upload body reader accepts only bounded PDF requests", async () => {
  const valid = Object.assign(Readable.from([Buffer.from("%PDF-1.7")]), { headers: { "content-length": "8", "content-type": "application/pdf" } });
  assert.equal((await readBoundedPdf(valid as never)).byteLength, 8);
  const rejected = Object.assign(Readable.from([]), { headers: { "content-length": "1", "content-type": "image/png" } });
  await assert.rejects(readBoundedPdf(rejected as never));
});
