export class PdfExtractor {
  constructor() {
    this.pdfjsLib = null;
    this.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.mjs";
  }

  async loadLibrary() {
    if (this.pdfjsLib) return;
    try {
      const mod = await import(this.workerSrc);
      this.pdfjsLib = mod;
      this.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.mjs";
    } catch {
      throw new Error("PDF library could not be loaded. Please check your internet connection.");
    }
  }

  async extractText(file) {
    await this.loadLibrary();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await this.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map((item) => item.str).join(" ") + "\n";
    }
    return fullText;
  }

  extractIrp5(text) {
    const fields = {};

    const employerMatch = text.match(/(?:employer|fund)\s*(?::|–|-)?\s*([A-Za-z0-9&.\s(##)]+?)(?:\s+(?:certificate|paye|employer|period|directive|\d{20,}))/i);
    if (employerMatch) fields.employer_name = employerMatch[1].trim();

    const certNumberMatch = text.match(/\b(\d{20,30})\b/);
    if (certNumberMatch) fields.certificate_number = certNumberMatch[1];

    const payeMatch = text.match(/\b(7\d{9})\b/);
    if (payeMatch) fields.paye_reference = payeMatch[1];

    const codePattern = /(\d+[\s,.]*\d*(?:\.\d+)?)\s*(?:source\s*code\s*)?(3\d{3})/gi;
    const incomeCodes = [];
    let m;
    while ((m = codePattern.exec(text)) !== null) {
      const amount = parseFloat(m[1].replace(/[\s,]/g, ""));
      const code = m[2];
      if (!isNaN(amount) && code !== "3696" && code !== "3699") {
        incomeCodes.push({ code, amount });
      }
    }

    const incomeLinePattern = /(\d[\d,.\s]*\d)\s+(3\d{3})/g;
    while ((m = incomeLinePattern.exec(text)) !== null) {
      const amount = parseFloat(m[1].replace(/[\s,]/g, ""));
      const code = m[2];
      if (!isNaN(amount) && code !== "3696" && code !== "3699" && !incomeCodes.some((c) => c.code === code)) {
        incomeCodes.push({ code, amount });
      }
    }
    if (incomeCodes.length) fields.income_codes = incomeCodes;

    const code3696Match = text.match(/(\d[\d,.\s]*\d)\s*(?:source\s*code\s*)?3696/);
    if (code3696Match) fields.non_taxable_income = parseFloat(code3696Match[1].replace(/[\s,]/g, ""));

    const code3699Match = text.match(/(\d[\d,.\s]*\d)\s*(?:source\s*code\s*)?3699/);
    if (code3699Match) fields.gross_employment_income = parseFloat(code3699Match[1].replace(/[\s,]/g, ""));

    const deductionLinePattern = /(\d[\d,.\s]*\d)\s+(4\d{3})/g;
    const deductions = [];
    while ((m = deductionLinePattern.exec(text)) !== null) {
      const amount = parseFloat(m[1].replace(/[\s,]/g, ""));
      const code = m[2];
      if (!isNaN(amount) && !["4102","4141","4142","4149","4116"].includes(code)) {
        deductions.push({ code, amount });
      }
    }
    if (deductions.length) fields.deduction_codes = deductions;

    const payeMatch2 = text.match(/(\d[\d,.\s]*\d)\s*(?:source\s*code\s*)?4102/);
    if (payeMatch2) fields.paye_amount = parseFloat(payeMatch2[1].replace(/[\s,]/g, ""));

    const uifMatch = text.match(/(\d[\d,.\s]*\d)\s*(?:source\s*code\s*)?4141/);
    if (uifMatch) fields.uif_contribution = parseFloat(uifMatch[1].replace(/[\s,]/g, ""));

    const sdlMatch = text.match(/(\d[\d,.\s]*\d)\s*(?:source\s*code\s*)?4142/);
    if (sdlMatch) fields.sdl_contribution = parseFloat(sdlMatch[1].replace(/[\s,]/g, ""));

    const totalTaxMatch = text.match(/(\d[\d,.\s]*\d)\s*(?:source\s*code\s*)?4149/);
    if (totalTaxMatch) fields.total_tax_sdl_uif = parseFloat(totalTaxMatch[1].replace(/[\s,]/g, ""));

    const medicalCreditMatch = text.match(/(\d[\d,.\s]*\d)\s*(?:source\s*code\s*)?4116/);
    if (medicalCreditMatch) fields.medical_tax_credit = parseFloat(medicalCreditMatch[1].replace(/[\s,]/g, ""));

    const code4120Match = text.match(/(\d[\d,.\s]*\d)\s*(?:source\s*code\s*)?4120/);
    if (code4120Match) fields.source_code_4120 = parseFloat(code4120Match[1].replace(/[\s,]/g, ""));

    const periodsMatch = text.match(/(?:periods?\s*in\s*(?:year|assessment|tax\s*year)|assessment\s*year\s*periods)\s*:?\s*(\d+)/i);
    if (periodsMatch) fields.periods_in_year = parseInt(periodsMatch[1], 10);

    const periodsWorkedMatch = text.match(/(?:periods?\s*worked|number\s*of\s*periods?\s*worked)\s*:?\s*(\d+)/i);
    if (periodsWorkedMatch) fields.periods_worked = parseInt(periodsWorkedMatch[1], 10);

    const datePattern = /(\d{2}\/\d{2}\/\d{4})/g;
    const dates = text.match(datePattern);
    if (dates) {
      const validDates = dates.filter((d) => {
        const [dd, mm, yyyy] = d.split("/").map(Number);
        return yyyy >= 2025 && yyyy <= 2026 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31;
      }).sort();
      if (validDates.length >= 2) {
        fields.start_date = validDates[0];
        fields.end_date = validDates[validDates.length - 1];
      }
    }

    const directiveMatch = text.match(/directive\s*(?:number)?\s*:?\s*(\d+)/i);
    if (directiveMatch) fields.directive_number = directiveMatch[1];

    return fields;
  }

  extractMedicalCertificate(text) {
    const fields = {};

    const schemeNames = [
      { pattern: /discovery/i, value: "DISCOVERY" },
      { pattern: /bonitas/i, value: "BONITAS" },
      { pattern: /momentum/i, value: "MOMENTUM" },
      { pattern: /medscheme/i, value: "MEDSCHEME" },
      { pattern: /gems/i, value: "GEMS" },
      { pattern: /liberty/i, value: "LIBERTY" },
      { pattern: /camaf|chartered\s*accountants/i, value: "CAMAF" }
    ];
    for (const { pattern, value } of schemeNames) {
      if (pattern.test(text)) {
        fields.medical_scheme_name = value;
        break;
      }
    }

    const memberNoMatch = text.match(/(?:membership\s*(?:no|number|#|id)|member\s*number|policy\s*number)\s*:?\s*([A-Za-z0-9-]+)/i);
    if (memberNoMatch) fields.medical_membership_number = memberNoMatch[1];

    const contributionMatch = text.match(/(?:contribution|total\s*contribution|annual\s*contribution)\s*:?\s*R?\s*([\d,.\s]+)/i);
    if (contributionMatch) fields.medical_contributions = parseFloat(contributionMatch[1].replace(/[\s,]/g, ""));

    return fields;
  }

  extractIt3s(text) {
    const fields = {};

    const institutionPatterns = [
      { pattern: /easyequities/i, value: "EasyEquities" },
      { pattern: /nedbank/i, value: "Nedbank" },
      { pattern: /standard\s*bank/i, value: "Standard Bank" },
      { pattern: /absa/i, value: "Absa" },
      { pattern: /fnb|first\s*national/i, value: "FNB" },
      { pattern: /investec/i, value: "Investec" },
      { pattern: /old\s*mutual/i, value: "Old Mutual" },
      { pattern: /sanlam/i, value: "Sanlam" }
    ];
    for (const { pattern, value } of institutionPatterns) {
      if (pattern.test(text)) {
        fields.tfsa_institution = value;
        break;
      }
    }

    const policyMatch = text.match(/(?:policy|account|membership)\s*(?:no|number|#|id)\s*:?\s*([A-Za-z0-9-]+)/i);
    if (policyMatch) fields.tfsa_policy_number = policyMatch[1];

    const contribMatch = text.match(/(?:source\s*code\s*)?4219\s*:?\s*R?\s*([\d,.\s]+)/i);
    if (contribMatch) fields.tfsa_total_contributions = parseFloat(contribMatch[1].replace(/[\s,]/g, ""));

    const interestMatch = text.match(/(?:source\s*code\s*)?4241\s*:?\s*R?\s*([\d,.\s]+)/i);
    if (interestMatch) fields.tfsa_interest_earned = parseFloat(interestMatch[1].replace(/[\s,]/g, ""));

    const dividendMatch = text.match(/(?:source\s*code\s*)?4242\s*:?\s*R?\s*([\d,.\s]+)/i);
    if (dividendMatch) fields.tfsa_dividends_earned = parseFloat(dividendMatch[1].replace(/[\s,]/g, ""));

    const withdrawalMatch = text.match(/(?:source\s*code\s*)?4248\s*:?\s*R?\s*([\d,.\s]+)/i);
    if (withdrawalMatch) fields.tfsa_withdrawal = parseFloat(withdrawalMatch[1].replace(/[\s,]/g, ""));

    return fields;
  }

  async extractFromPdf(file, docType) {
    const text = await this.extractText(file);
    switch (docType) {
      case "IRP5_IT3A":
        return { documentType: "IRP5_IT3A", fields: this.extractIrp5(text) };
      case "MEDICAL_CERTIFICATE":
        return { documentType: "MEDICAL_CERTIFICATE", fields: this.extractMedicalCertificate(text) };
      case "IT3S":
        return { documentType: "IT3S", fields: this.extractIt3s(text) };
      default:
        return { documentType: docType, fields: {} };
    }
  }
}
