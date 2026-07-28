import test from "node:test";
import assert from "node:assert/strict";
import { exportJWK, generateKeyPair, SignJWT, createLocalJWKSet } from "jose";
import { extractBearerToken, verifyAccessTokenWithKeySet } from "./auth.ts";

const config = { issuer: "https://identity.example.test/realms/rovyniq", audience: "rovyniq-api" };
test("OIDC verifier accepts only a correctly issued and addressed signed token", async () => {
  const { privateKey, publicKey } = await generateKeyPair("ES256");
  const publicJwk = await exportJWK(publicKey); publicJwk.kid = "key-1";
  const token = await new SignJWT({ roles: ["taxpayer", "not-a-role"], organisation_id: "org-1" }).setProtectedHeader({ alg: "ES256", kid: "key-1" }).setIssuer(config.issuer).setAudience(config.audience).setSubject("user-1").setIssuedAt().setExpirationTime("5m").sign(privateKey);
  const principal = await verifyAccessTokenWithKeySet(token, config, createLocalJWKSet({ keys: [publicJwk] }));
  assert.deepEqual(principal, { subject: "user-1", organisationId: "org-1", roles: ["taxpayer"], verifiedBy: "oidc" });
});
test("bearer extraction fails closed", () => {
  assert.equal(extractBearerToken("Bearer safe.token_value"), "safe.token_value");
  assert.equal(extractBearerToken("Basic credentials"), null);
  assert.equal(extractBearerToken(undefined), null);
});
test("OIDC verifier maps asserted ZITADEL project roles and resource owner", async () => {
  const { privateKey, publicKey } = await generateKeyPair("ES256");
  const publicJwk = await exportJWK(publicKey); publicJwk.kid = "key-zitadel";
  const token = await new SignJWT({
    "urn:zitadel:iam:org:project:roles": { taxpayer: { "org-1": "astraiva.example" }, ignored: { "org-1": "astraiva.example" } },
    "urn:zitadel:iam:user:resourceowner:id": "org-1"
  }).setProtectedHeader({ alg: "ES256", kid: "key-zitadel" }).setIssuer(config.issuer).setAudience(config.audience).setSubject("user-zitadel").setIssuedAt().setExpirationTime("5m").sign(privateKey);
  const principal = await verifyAccessTokenWithKeySet(token, config, createLocalJWKSet({ keys: [publicJwk] }));
  assert.deepEqual(principal, { subject: "user-zitadel", organisationId: "org-1", roles: ["taxpayer"], verifiedBy: "oidc" });
});
test("OIDC verifier rejects a token for another audience", async () => {
  const { privateKey, publicKey } = await generateKeyPair("ES256");
  const publicJwk = await exportJWK(publicKey); publicJwk.kid = "key-2";
  const token = await new SignJWT({ roles: ["taxpayer"] }).setProtectedHeader({ alg: "ES256", kid: "key-2" }).setIssuer(config.issuer).setAudience("another-service").setSubject("user-1").setIssuedAt().setExpirationTime("5m").sign(privateKey);
  await assert.rejects(verifyAccessTokenWithKeySet(token, config, createLocalJWKSet({ keys: [publicJwk] })));
});
