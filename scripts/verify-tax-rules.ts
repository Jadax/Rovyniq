import { taxYear2026 } from "../packages/tax-rules/src/2026.ts";
if (new Date(taxYear2026.review.reverifyBy) < new Date("2026-07-27")) throw new Error("Tax rule review has expired.");
console.log(`Tax rules ${taxYear2026.assessmentYear}: review current through ${taxYear2026.review.reverifyBy}`);
