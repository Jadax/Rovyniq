export type AssessmentYear = 2026;
export type DocumentType = "IRP5_IT3A" | "MEDICAL_CERTIFICATE" | "IT3B" | "IT3C" | "IT3F" | "IT3S" | "OTHER";
export type DataSource = "document" | "user" | "reviewer" | "sars_import" | "calculated";
export type Confidence = "high" | "medium" | "low";
export type DocumentState = "UPLOADED" | "QUARANTINED" | "VALIDATED" | "CLASSIFIED" | "EXTRACTION_PENDING" | "EXTRACTED" | "REVIEW_REQUIRED" | "CONFIRMED" | "RECONCILED" | "ARCHIVED";
export type ReturnState = "DRAFT" | "DATA_COLLECTION" | "DOCUMENT_REVIEW" | "CALCULATION_READY" | "VALIDATION_BLOCKED" | "READY_FOR_REVIEW" | "TAXPAYER_APPROVED" | "SUBMISSION_PENDING" | "SUBMITTED" | "ASSESSED" | "VERIFICATION_REQUESTED" | "SUPPORTING_DOCS_SUBMITTED" | "FINALISED" | "CORRECTION_IN_PROGRESS";

export interface EvidenceReference { documentId: string; page: number; boundingBox?: readonly [number, number, number, number]; textSpan?: string; }
export interface ExtractedField { documentId: string; documentType: DocumentType; taxYear: AssessmentYear; canonicalField: string; sourceCode?: string; rawValue: string; normalisedValue: string | number; currency?: "ZAR"; evidence: EvidenceReference; extractionMethod: "text" | "table" | "ocr" | "manual"; confidence: Confidence; validationState: "pending" | "valid" | "invalid"; humanConfirmation: "pending" | "confirmed" | "corrected" | "rejected"; source: DataSource; auditEventId: string; createdAt: string; }
export interface CodeValue { code: string; amount: number; evidence: EvidenceReference; source: DataSource; }
export interface EmploymentCertificate { id: string; taxYear: AssessmentYear; certificateNumber: string; employerName: string; payeReference?: string; startDate?: string; endDate?: string; periodsInYear?: number; periodsWorked?: number; income: readonly CodeValue[]; deductions: readonly CodeValue[]; paye?: CodeValue; employerTaxCredits: readonly CodeValue[]; directiveNumbers: readonly string[]; reason4150?: string; }
export interface ReturnWorkspace { id: string; assessmentYear: AssessmentYear; state: ReturnState; taxpayerId: string; createdAt: string; }
export interface TaxpayerDeclaration { snapshotHash: string; acceptedAt: string; actorId: string; wordingVersion: string; }
export interface TaxBreakdownLine { id: "income" | "deductions" | "taxable_income" | "normal_tax" | "rebates_and_credits" | "paye" | "estimated_balance"; label: string; amount: number; direction: "increase" | "reduce" | "result"; source: DataSource | "mixed"; evidenceRequired: boolean; }

export const transitionReturn = (from: ReturnState, to: ReturnState): boolean => ({
  DRAFT: ["DATA_COLLECTION"], DATA_COLLECTION: ["DOCUMENT_REVIEW", "CALCULATION_READY"], DOCUMENT_REVIEW: ["DATA_COLLECTION", "CALCULATION_READY"], CALCULATION_READY: ["VALIDATION_BLOCKED", "READY_FOR_REVIEW"], VALIDATION_BLOCKED: ["DATA_COLLECTION"], READY_FOR_REVIEW: ["TAXPAYER_APPROVED"], TAXPAYER_APPROVED: ["SUBMISSION_PENDING"], SUBMISSION_PENDING: ["SUBMITTED"], SUBMITTED: ["ASSESSED", "VERIFICATION_REQUESTED"], ASSESSED: ["FINALISED", "CORRECTION_IN_PROGRESS"], VERIFICATION_REQUESTED: ["SUPPORTING_DOCS_SUBMITTED"], SUPPORTING_DOCS_SUBMITTED: ["ASSESSED"], FINALISED: ["CORRECTION_IN_PROGRESS"], CORRECTION_IN_PROGRESS: ["DATA_COLLECTION"]
}[from] ?? []).includes(to);
