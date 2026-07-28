import { EncryptJWT, SignJWT, jwtDecrypt, jwtVerify, type JWTPayload } from "jose";
import type { Principal, Role } from "../../../packages/authz/src/index.ts";
import { oidcConfigFromEnvironment, verifyAccessTokenWithKeySet, type OidcConfig } from "./auth.ts";

const sessionIssuer = "rovyniq-session";
const sessionCookieName = "rovyniq_session";
const transientCookieName = "rovyniq_oidc";

export interface BrowserOidcConfig extends OidcConfig { clientId: string; callbackUrl: string; authorizationEndpoint: string; tokenEndpoint: string; scopes: string; cookieSecret: Uint8Array; }

export function browserOidcConfigFromEnvironment(environment: NodeJS.ProcessEnv): BrowserOidcConfig | null {
  const oidc = oidcConfigFromEnvironment(environment);
  const clientId = environment.OIDC_WEB_CLIENT_ID;
  const callbackUrl = environment.OIDC_CALLBACK_URL;
  const authorizationEndpoint = environment.OIDC_AUTHORIZATION_ENDPOINT;
  const tokenEndpoint = environment.OIDC_TOKEN_ENDPOINT;
  const scopes = environment.OIDC_BROWSER_SCOPES ?? "openid profile email";
  const encodedSecret = environment.SESSION_COOKIE_SECRET;
  if (!oidc || !clientId || !callbackUrl || !authorizationEndpoint || !tokenEndpoint || !encodedSecret) return null;
  const cookieSecret = Buffer.from(encodedSecret, "base64url");
  if (cookieSecret.byteLength < 32) throw new Error("SESSION_COOKIE_SECRET must contain at least 32 random bytes encoded as base64url.");
  for (const value of [callbackUrl, authorizationEndpoint, tokenEndpoint]) {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && environment.NODE_ENV === "production") throw new Error("OIDC browser endpoints must use HTTPS in production.");
  }
  if (!scopes.split(/\s+/).includes("openid")) throw new Error("OIDC_BROWSER_SCOPES must include openid.");
  return { ...oidc, clientId, callbackUrl, authorizationEndpoint, tokenEndpoint, scopes, cookieSecret };
}

export function safeReturnTo(value: string | null): string {
  return value && /^\/(?![\\/])/.test(value) && !/[\r\n]/.test(value) ? value : "/app";
}

function cookieHeader(name: string, value: string, maxAgeSeconds: number, secure: boolean): string {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure ? "; Secure" : ""}`;
}

export async function createAuthorizationRedirect(configuration: BrowserOidcConfig, returnTo: string, secureCookie: boolean, prompt?: "create"): Promise<{ location: string; setCookie: string }> {
  const state = crypto.randomUUID();
  const verifier = Buffer.from(crypto.getRandomValues(new Uint8Array(48))).toString("base64url");
  const challenge = Buffer.from(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))).toString("base64url");
  const transient = await new EncryptJWT({ state, verifier, return_to: safeReturnTo(returnTo) }).setProtectedHeader({ alg: "dir", enc: "A256GCM" }).setIssuer(sessionIssuer).setIssuedAt().setExpirationTime("5m").encrypt(configuration.cookieSecret);
  const endpoint = new URL(configuration.authorizationEndpoint);
  const parameters = new URLSearchParams({ response_type: "code", client_id: configuration.clientId, redirect_uri: configuration.callbackUrl, scope: configuration.scopes, state, code_challenge: challenge, code_challenge_method: "S256" });
  if (prompt === "create") parameters.set("prompt", "create");
  endpoint.search = parameters.toString();
  return { location: endpoint.toString(), setCookie: cookieHeader(transientCookieName, transient, 300, secureCookie) };
}

interface TransientClaims extends JWTPayload { state?: unknown; verifier?: unknown; return_to?: unknown; }
export async function readAuthorizationState(value: string | undefined, configuration: BrowserOidcConfig): Promise<{ state: string; verifier: string; returnTo: string }> {
  if (!value) throw new Error("Missing OIDC state cookie.");
  const { payload } = await jwtDecrypt(value, configuration.cookieSecret, { issuer: sessionIssuer });
  const claims = payload as TransientClaims;
  if (typeof claims.state !== "string" || typeof claims.verifier !== "string") throw new Error("Invalid OIDC state cookie.");
  return { state: claims.state, verifier: claims.verifier, returnTo: safeReturnTo(typeof claims.return_to === "string" ? claims.return_to : null) };
}

export async function createSessionCookie(principal: Principal, secret: Uint8Array, secureCookie: boolean): Promise<string> {
  const token = await new SignJWT({ roles: principal.roles, organisation_id: principal.organisationId }).setProtectedHeader({ alg: "HS256" }).setIssuer(sessionIssuer).setSubject(principal.subject).setIssuedAt().setExpirationTime("10m").sign(secret);
  return cookieHeader(sessionCookieName, token, 600, secureCookie);
}

export async function readSession(value: string | undefined, secret: Uint8Array): Promise<Principal> {
  if (!value) throw new Error("Missing session cookie.");
  const { payload } = await jwtVerify(value, secret, { issuer: sessionIssuer });
  if (!payload.sub || !Array.isArray(payload.roles) || !payload.roles.every((role) => typeof role === "string")) throw new Error("Invalid session claims.");
  return { subject: payload.sub, organisationId: typeof payload.organisation_id === "string" ? payload.organisation_id : undefined, roles: payload.roles as Role[], verifiedBy: "oidc" };
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  return header?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

export async function exchangeCodeForPrincipal(code: string, verifier: string, configuration: BrowserOidcConfig, keySet: Parameters<typeof verifyAccessTokenWithKeySet>[2]): Promise<Principal> {
  const response = await fetch(configuration.tokenEndpoint, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" }, body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: configuration.callbackUrl, client_id: configuration.clientId, code_verifier: verifier }) });
  if (!response.ok) throw new Error("OIDC code exchange failed.");
  const body = await response.json() as { id_token?: unknown };
  if (typeof body.id_token !== "string") throw new Error("OIDC provider did not return an ID token.");
  return verifyAccessTokenWithKeySet(body.id_token, { ...configuration, audience: configuration.clientId }, keySet);
}

export const browserCookies = { sessionCookieName, transientCookieName, clearSession: (secure: boolean) => cookieHeader(sessionCookieName, "", 0, secure), clearTransient: (secure: boolean) => cookieHeader(transientCookieName, "", 0, secure) };
