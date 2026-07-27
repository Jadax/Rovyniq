import test from "node:test";
import assert from "node:assert/strict";
import { clamAvConfigFromEnvironment, classifyClamAvReply, encodeInstream } from "./clamav-scanner.ts";

test("ClamAV protocol frames document bytes without filesystem paths", () => {
  const framed = encodeInstream(new Uint8Array([1, 2, 3]));
  assert.equal(framed.subarray(0, 10).toString("utf8"), "zINSTREAM\0");
  assert.equal(framed.readUInt32BE(10), 3);
  assert.deepEqual([...framed.subarray(14, 17)], [1, 2, 3]);
  assert.equal(framed.readUInt32BE(17), 0);
});

test("ClamAV replies fail closed unless clean or malicious is explicit", () => {
  assert.equal(classifyClamAvReply("stream: OK\0"), "clean");
  assert.equal(classifyClamAvReply("stream: Eicar-Test-Signature FOUND\0"), "malicious");
  assert.equal(classifyClamAvReply("stream: size limit exceeded ERROR\0"), "unavailable");
  assert.throws(() => clamAvConfigFromEnvironment({ CLAMAV_HOST: "scanner", CLAMAV_TIMEOUT_MS: "1" }));
});
