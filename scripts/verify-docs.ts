import { existsSync } from "node:fs";
const required = ["docs/compliance/SOURCE_REGISTER.md", "docs/integrations/SARS_INTEGRATION_RESEARCH.md", "docs/security/THREAT_MODEL.md", "docs/api/openapi.yaml"];
for (const path of required) if (!existsSync(path)) throw new Error(`Missing required documentation: ${path}`);
console.log("Required compliance documentation exists.");
