import { createServer } from "node:http";
import { createRemoteJWKSet } from "jose";
import { extractBearerToken, oidcConfigFromEnvironment, verifyAccessToken } from "./auth.ts";
import { browserCookies, browserOidcConfigFromEnvironment, createAuthorizationRedirect, createSessionCookie, exchangeCodeForPrincipal, readAuthorizationState, readCookie, readSession, safeReturnTo } from "./browser-auth.ts";

const port = Number(process.env.PORT ?? 3001);
const json = (response: import("node:http").ServerResponse, body: object, status = 200, headers: Record<string, string> = {}) => {
  response.writeHead(status, { "content-type": "application/json", "cache-control": "no-store", "x-content-type-options": "nosniff", ...headers });
  response.end(JSON.stringify(body));
};
const secureCookies = process.env.NODE_ENV === "production";
const browserConfiguration = () => browserOidcConfigFromEnvironment(process.env);

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (request.method === "GET" && url.pathname === "/health") return json(response, { service: "rovyniq-api", status: "ok" });

  if (request.method === "GET" && url.pathname === "/v1/auth/start") {
    try {
      const configuration = browserConfiguration();
      if (!configuration) return json(response, { error: "identity_not_configured" }, 503);
      void createAuthorizationRedirect(configuration, safeReturnTo(url.searchParams.get("return_to")), secureCookies).then(({ location, setCookie }) => { response.writeHead(302, { location, "set-cookie": setCookie, "cache-control": "no-store" }); response.end(); }).catch(() => json(response, { error: "identity_not_configured" }, 503));
    } catch { json(response, { error: "identity_not_configured" }, 503); }
    return;
  }

  if (request.method === "GET" && url.pathname === "/v1/auth/callback") {
    try {
      const configuration = browserConfiguration();
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!configuration || !code || !state || url.searchParams.has("error")) return json(response, { error: "authentication_failed" }, 401);
      const transient = readCookie(request.headers.cookie, browserCookies.transientCookieName);
      void readAuthorizationState(transient, configuration).then(async (stored) => {
        if (stored.state !== state) throw new Error("OIDC state mismatch.");
        const jwks = createRemoteJWKSet(new URL(configuration.jwksUri ?? `${configuration.issuer}/.well-known/jwks.json`));
        const principal = await exchangeCodeForPrincipal(code, stored.verifier, configuration, jwks);
        const session = await createSessionCookie(principal, configuration.cookieSecret, secureCookies);
        response.writeHead(302, { location: stored.returnTo, "set-cookie": [session, browserCookies.clearTransient(secureCookies)], "cache-control": "no-store" }); response.end();
      }).catch(() => json(response, { error: "authentication_failed" }, 401));
    } catch { json(response, { error: "authentication_failed" }, 401); }
    return;
  }

  if (request.method === "POST" && url.pathname === "/v1/auth/signout") {
    response.writeHead(204, { "set-cookie": browserCookies.clearSession(secureCookies), "cache-control": "no-store" }); response.end(); return;
  }

  if (request.method === "GET" && url.pathname === "/v1/session") {
    try {
      const configuration = browserConfiguration();
      if (!configuration) return json(response, { error: "identity_not_configured" }, 503);
      void readSession(readCookie(request.headers.cookie, browserCookies.sessionCookieName), configuration.cookieSecret).then((principal) => json(response, { subject: principal.subject, roles: principal.roles })).catch(() => json(response, { error: "unauthenticated" }, 401));
    } catch { json(response, { error: "identity_not_configured" }, 503); }
    return;
  }

  if (request.method === "GET" && url.pathname === "/v1/me") {
    try {
      const configuration = oidcConfigFromEnvironment(process.env);
      const token = extractBearerToken(request.headers.authorization);
      if (!configuration) return json(response, { error: "identity_not_configured" }, 503);
      if (!token) return json(response, { error: "unauthenticated" }, 401, { "www-authenticate": "Bearer" });
      void verifyAccessToken(token, configuration).then((principal) => json(response, { subject: principal.subject, roles: principal.roles })).catch(() => json(response, { error: "unauthenticated" }, 401, { "www-authenticate": "Bearer" }));
    } catch { json(response, { error: "identity_not_configured" }, 503); }
    return;
  }

  return json(response, { error: "not_found" }, 404);
});
server.listen(port, "127.0.0.1", () => console.log(`Rovyniq API listening on ${port}`));
