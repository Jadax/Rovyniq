import test from "node:test";
import assert from "node:assert/strict";
import { staticAsset } from "./static-site.ts";

test("private pilot serves only an explicit same-origin web allowlist", () => {
  assert.deepEqual(staticAsset("/app"), { file: "app.html", contentType: "text/html; charset=utf-8" });
  assert.deepEqual(staticAsset("/documents.js"), { file: "documents.js", contentType: "text/javascript; charset=utf-8" });
  assert.equal(staticAsset("/../.env"), undefined);
  assert.equal(staticAsset("/v1/session"), undefined);
});
