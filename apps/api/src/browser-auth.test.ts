import test from "node:test";
import assert from "node:assert/strict";
import { browserCookies, createAuthorizationRedirect, createSessionCookie, readAuthorizationState, readCookie, readSession, safeReturnTo, type BrowserOidcConfig } from "./browser-auth.ts";

const configuration: BrowserOidcConfig = {
  issuer: "https://identity.example.test/realms/rovyniq", audience: "rovyniq-api", jwksUri: "https://identity.example.test/keys",
  clientId: "rovyniq-web", callbackUrl: "https://app.example.test/v1/auth/callback", authorizationEndpoint: "https://identity.example.test/authorize", tokenEndpoint: "https://identity.example.test/token", scopes: "openid profile email", cookieSecret: new Uint8Array(32).fill(7)
};

test("OIDC browser flow uses PKCE and binds the state to an encrypted short-lived cookie", async () => {
  const result = await createAuthorizationRedirect(configuration, "/app?step=documents", true);
  const endpoint = new URL(result.location);
  assert.equal(endpoint.searchParams.get("code_challenge_method"), "S256");
  assert.equal(endpoint.searchParams.get("redirect_uri"), configuration.callbackUrl);
  assert.match(result.setCookie, /HttpOnly; SameSite=Lax; Max-Age=300; Secure$/);
  const state = await readAuthorizationState(readCookie(result.setCookie, browserCookies.transientCookieName), configuration);
  assert.equal(state.returnTo, "/app?step=documents");
  assert.equal(state.state, endpoint.searchParams.get("state"));
  assert.equal(state.verifier.length > 40, true);
});

test("registration starts with the provider's account-creation prompt", async () => {
  const result = await createAuthorizationRedirect(configuration, "/app", true, "create");
  assert.equal(new URL(result.location).searchParams.get("prompt"), "create");
});

test("browser sessions are signed, short lived and do not include provider tokens", async () => {
  const cookie = await createSessionCookie({ subject: "user-1", organisationId: "tenant-1", roles: ["taxpayer"], verifiedBy: "oidc" }, configuration.cookieSecret, true);
  const principal = await readSession(readCookie(cookie, browserCookies.sessionCookieName), configuration.cookieSecret);
  assert.deepEqual(principal, { subject: "user-1", organisationId: "tenant-1", roles: ["taxpayer"], verifiedBy: "oidc" });
  assert.equal(cookie.includes("access_token"), false);
});

test("return targets remain same-origin relative paths", () => {
  assert.equal(safeReturnTo("/app"), "/app");
  assert.equal(safeReturnTo("//attacker.example"), "/app");
  assert.equal(safeReturnTo("/\\attacker.example"), "/app");
  assert.equal(safeReturnTo("https://attacker.example"), "/app");
});
