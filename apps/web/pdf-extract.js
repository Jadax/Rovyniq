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
    const lines = text.split("\n").filter(Boolean);

    const employerMatch = text.match(/(?:employer|fund)\s*(?::|–|-)?\s*([A-Za-z0-9&.\s(##)]+?)(?:\s+(?:certificate|paye|employer|period|directive|\d{20,}))/i);
    if (employerMatch) fields.employer_name = employerMatch[1].trim();
    else {
      for (const line of lines) {
        const m = line.match(/^([A-Z][A-Za-z0-9&.\s]{3,60})$/);
        if (m && !m[1].match(/^\d/) && m[1].length > 5) {
          fields.employer_name = m[1].trim();
          break;
        }
      }
    }

    const certNumMatch = text.match(/\b(\d{20,30})\b/);
    if (certNumMatch) fields.certificate_number = certNumMatch[1];

    const payeMatch = text.match(/\b(7\d{9})\b/);
    if (payeMatch) fields.paye_reference = payeMatch[1];

    fields.income_salary = this._extractCodeAmount(text, "3601");
    fields.income_non_taxable = this._extractCodeAmount(text, "3602");
    fields.income_pension = this._extractCodeAmount(text, "3603");
    fields.income_annual_payment = this._extractCodeAmount(text, "3605");

    const total3699 = this._extractCodeAmount(text, "3699");
    if (total3699) fields.gross_income = total3699;

    fields.paye_deducted = this._extractCodeAmount(text, "4102");
    fields.uif_deducted = this._extractCodeAmount(text, "4141");
    fields.sdl_deducted = this._extractCodeAmount(text, "4142");
    fields.medical_credit_on_irp5 = this._extractCodeAmount(text, "4116");
    fields.retirement_fund_contrib = this._extractCodeAmount(text, "4001") || this._extractCodeAmount(text, "4005");

    const contrib4005 = this._extractCodeAmount(text, "4005");
    const contrib4001 = this._extractCodeAmount(text, "4001");
    if (contrib4005 && contrib4001) {
      fields.retirement_fund_contrib = contrib4005 + contrib4001;
    }

    const periodsMatch = text.match(/(?:periods?\s*(?:in\s*)?(?:year|assessment|tax\s*year)|assessment\s*year\s*periods)\s*:?\s*(\d+)/i);
    if (periodsMatch) fields.periods_employed = parseInt(periodsMatch[1], 10);

    const datePattern = /(\d{2}\/\d{2}\/\d{4})/g;
    const dates = text.match(datePattern);
    if (dates) {
      const valid = dates.filter((d) => {
        const [dd, mm, yyyy] = d.split("/").map(Number);
        return yyyy >= 2025 && yyyy <= 2026 && mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31;
      }).sort();
      if (valid.length >= 2) {
        fields.start_date = valid[0];
        fields.end_date = valid[valid.length - 1];
      } else if (valid.length === 1) {
        fields.start_date = valid[0];
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
        fields.scheme_name = value;
        break;
      }
    }

    const memberNoMatch = text.match(/(?:membership\s*(?:no|number|#|id)|member\s*number|policy\s*number)\s*:?\s*([A-Za-z0-9-]+)/i);
    if (memberNoMatch) fields.membership_number = memberNoMatch[1];

    const contribMatch = text.match(/(?:contribution|total\s*contribution|annual\s*contribution)\s*:?\s*R?\s*([\d,.\s]+)/i);
    if (contribMatch) fields.total_contributions_paid = parseFloat(contribMatch[1].replace(/[\s,]/g, ""));

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
        fields.institution_name = value;
        break;
      }
    }

    const policyMatch = text.match(/(?:policy|account|membership)\s*(?:no|number|#|id)\s*:?\s*([A-Za-z0-9-]+)/i);
    if (policyMatch) fields.account_number = policyMatch[1];

    fields.total_contributions = this._extractCodeAmount(text, "4219");
    fields.interest_earned = this._extractCodeAmount(text, "4241");
    fields.dividends_earned = this._extractCodeAmount(text, "4242");
    fields.withdrawals = this._extractCodeAmount(text, "4248");

    return fields;
  }

  _extractCodeAmount(text, code) {
    const patterns = [
      new RegExp(`(?:source\\s*code\\s*)?${code}\\s*:?\\s*R?\\s*([\\d,.\s]+?)(?:\\s|$|\\n|code|source)`, "i"),
      new RegExp(`([\\d,.\s]+)\\s*(?:source\\s*code\\s*)?${code}(?!\\d)`, "i"),
      new RegExp(`\\b${code}\\b\\s*:?\\s*R?\\s*([\\d,.\s]+?)(?:\\s|$|\\n)`, "i")
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const cleaned = match[1].replace(/[\s,]/g, "");
        const num = parseFloat(cleaned);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    return null;
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
