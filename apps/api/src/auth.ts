import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from "jose";
import type { Principal, Role } from "../../../packages/authz/src/index.ts";

export interface OidcConfig { issuer: string; audience: string; jwksUri?: string; }
const recognisedRoles = new Set<Role>(["taxpayer", "contributor", "support_agent", "reviewer", "tax_practitioner", "organisation_admin", "system_admin", "auditor"]);

export function oidcConfigFromEnvironment(environment: NodeJS.ProcessEnv): OidcConfig | null {
  const issuer = environment.OIDC_ISSUER;
  const audience = environment.OIDC_AUDIENCE;
  if (!issuer || !audience) return null;
  const parsedIssuer = new URL(issuer);
  if (parsedIssuer.protocol !== "https:" && environment.NODE_ENV === "production") throw new Error("OIDC issuer must use HTTPS in production.");
  return { issuer: issuer.replace(/\/$/, ""), audience, jwksUri: environment.OIDC_JWKS_URI };
}

export function extractBearerToken(authorization: string | undefined): string | null {
  const match = authorization?.match(/^Bearer ([A-Za-z0-9._~-]+)$/);
  return match?.[1] ?? null;
}

function rolesFromClaims(payload: JWTPayload): readonly Role[] {
  const claimedRoles = [
    ...(Array.isArray(payload.roles) ? payload.roles : []),
    ...(typeof payload.realm_access === "object" && payload.realm_access && Array.isArray(payload.realm_access.roles) ? payload.realm_access.roles : [])
  ];
  return claimedRoles.filter((role): role is Role => typeof role === "string" && recognisedRoles.has(role as Role));
}

export async function verifyAccessTokenWithKeySet(token: string, configuration: OidcConfig, keySet: JWTVerifyGetKey): Promise<Principal> {
  const { payload } = await jwtVerify(token, keySet, { issuer: configuration.issuer, audience: configuration.audience });
  if (!payload.sub) throw new Error("OIDC token is missing subject.");
  return { subject: payload.sub, organisationId: typeof payload.organisation_id === "string" ? payload.organisation_id : undefined, roles: rolesFromClaims(payload), verifiedBy: "oidc" };
}

export async function verifyAccessToken(token: string, configuration: OidcConfig): Promise<Principal> {
  const jwksUrl = configuration.jwksUri ?? `${configuration.issuer}/.well-known/jwks.json`;
  return verifyAccessTokenWithKeySet(token, configuration, createRemoteJWKSet(new URL(jwksUrl)));
}
