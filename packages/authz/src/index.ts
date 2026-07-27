export type Role = "taxpayer" | "contributor" | "support_agent" | "reviewer" | "tax_practitioner" | "organisation_admin" | "system_admin" | "auditor";
export interface Principal { subject: string; organisationId?: string; roles: readonly Role[]; verifiedBy: "oidc"; }
export type Action = "workspace:create" | "workspace:read" | "workspace:edit" | "document:upload" | "return:approve" | "return:submit" | "audit:read";
const grants: Record<Action, readonly Role[]> = {
  "workspace:create": ["taxpayer", "organisation_admin", "system_admin"],
  "workspace:read": ["taxpayer", "contributor", "support_agent", "reviewer", "tax_practitioner", "organisation_admin", "system_admin", "auditor"],
  "workspace:edit": ["taxpayer", "contributor", "reviewer", "tax_practitioner", "organisation_admin", "system_admin"],
  "document:upload": ["taxpayer", "contributor", "reviewer", "tax_practitioner"],
  "return:approve": ["taxpayer"],
  "return:submit": ["taxpayer"],
  "audit:read": ["auditor", "organisation_admin", "system_admin"]
};
export function can(principal: Principal, action: Action, ownerSubject?: string): boolean {
  if (!grants[action].some((role) => principal.roles.includes(role))) return false;
  if (["return:approve", "return:submit"].includes(action)) return principal.subject === ownerSubject;
  return true;
}
export function requirePermission(principal: Principal, action: Action, ownerSubject?: string): void {
  if (!can(principal, action, ownerSubject)) throw new Error(`Forbidden: ${action}`);
}
