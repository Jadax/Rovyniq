export interface SubmissionCapabilities { importPrepopulatedData: boolean; submitReturn: boolean; retrieveAssessment: boolean; uploadSupportingDocuments: boolean; }
export interface SarsSubmissionProvider { capabilities(): Promise<SubmissionCapabilities>; connect(input: { userPresent: boolean }): Promise<{ connected: boolean }>; importPrepopulatedData(request: { workspaceId: string }): Promise<{ imported: boolean }>; validateReturn(request: { snapshotHash: string }): Promise<{ valid: boolean; findings: string[] }>; createSubmissionPackage(request: { snapshotHash: string }): Promise<{ packageId: string; captureGuide: string }>; submitReturn(request: { packageId: string }): Promise<{ accepted: boolean; reason?: string }>; retrieveAssessment(request: { workspaceId: string }): Promise<{ found: boolean }>; uploadSupportingDocuments(request: { packageId: string }): Promise<{ accepted: boolean }>; requestCorrection(request: { workspaceId: string }): Promise<{ accepted: boolean }>; }
export class ManualEfilingHandoffProvider implements SarsSubmissionProvider {
  async capabilities() { return { importPrepopulatedData: false, submitReturn: false, retrieveAssessment: false, uploadSupportingDocuments: false }; }
  async connect() { return { connected: true }; }
  async importPrepopulatedData() { return { imported: false }; }
  async validateReturn() { return { valid: true, findings: ["Manual eFiling review required."] }; }
  async createSubmissionPackage(request: { snapshotHash: string }) { return { packageId: `manual-${request.snapshotHash}`, captureGuide: "Capture each reviewed field in SARS eFiling; do not enter passwords or OTPs here." }; }
  async submitReturn() { return { accepted: false, reason: "Manual eFiling handoff does not submit to SARS." }; }
  async retrieveAssessment() { return { found: false }; }
  async uploadSupportingDocuments() { return { accepted: false }; }
  async requestCorrection() { return { accepted: false }; }
}
export class OfficialSarsIntegrationProvider implements SarsSubmissionProvider {
  private unavailable(): never { throw new Error("Official SARS integration is disabled pending authorised documented access."); }
  async capabilities() { return { importPrepopulatedData: false, submitReturn: false, retrieveAssessment: false, uploadSupportingDocuments: false }; }
  async connect() { return this.unavailable(); } async importPrepopulatedData() { return this.unavailable(); } async validateReturn() { return this.unavailable(); } async createSubmissionPackage() { return this.unavailable(); } async submitReturn() { return this.unavailable(); } async retrieveAssessment() { return this.unavailable(); } async uploadSupportingDocuments() { return this.unavailable(); } async requestCorrection() { return this.unavailable(); }
}
