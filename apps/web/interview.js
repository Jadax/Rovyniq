import { sections } from "./sections.js";
import { PdfExtractor } from "./pdf-extract.js";

const SIGN_OUT_BTN = "#sign-out";
const SECTION_LIST = "#section-list";
const GATE_PANEL = "#gate-section";
const FIELDS_PANEL = "#fields-section";
const COMPLETION_PANEL = "#completion-panel";
const PROGRESS_LABEL = "#progress-label";

const answers = loadAnswers();
let activeSectionId = null;
let activeInstance = 0;
const extractor = new PdfExtractor();

function getKey(sectionId, instance, fieldId) {
  if (fieldId) return instance > 0 ? `${sectionId}_${instance}_${fieldId}` : `${sectionId}_${fieldId}`;
  return instance > 0 ? `${sectionId}_${instance}` : sectionId;
}

function gateKey(sectionId) {
  const s = sections.find((s) => s.id === sectionId);
  return s?.gateQuestion?.id ?? `${sectionId}_gate`;
}

function loadAnswers() {
  try {
    return JSON.parse(sessionStorage.getItem("rovyniq_answers") || "{}");
  } catch {
    return {};
  }
}

function saveAnswers() {
  sessionStorage.setItem("rovyniq_answers", JSON.stringify(answers));
}

function getAnswer(key) {
  return answers[key] ?? null;
}

function setAnswer(key, value) {
  answers[key] = value;
  saveAnswers();
}

function isGateAnswered(sectionId) {
  const key = gateKey(sectionId);
  return answers[key] !== undefined && answers[key] !== null;
}

function isGateYes(sectionId) {
  const key = gateKey(sectionId);
  return answers[key] === true || answers[key] === "yes";
}

function getSectionState(sectionId) {
  const idx = sections.findIndex((s) => s.id === sectionId);
  for (let i = 0; i < idx; i++) {
    const sid = sections[i].id;
    if (!isGateAnswered(sid)) return "locked";
    if (sid === activeSectionId) return "active";
  }
  if (!isGateAnswered(sectionId)) return activeSectionId === sectionId ? "gate" : "locked";
  const yes = isGateYes(sectionId);
  if (sectionId === activeSectionId) return yes ? "active" : "completed";
  const hasFields = yes ? hasAnyFieldAnswer(sectionId) : true;
  return hasFields ? "completed" : (sectionId === activeSectionId ? "active" : "gate");
}

function hasAnyFieldAnswer(sectionId) {
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return false;
  return section.fields.some((f) => {
    const k = getKey(sectionId, activeInstance, f.id);
    return getAnswer(k) !== null && getAnswer(k) !== undefined && getAnswer(k) !== "";
  });
}

function nextUnansweredSection() {
  for (const s of sections) {
    if (!isGateAnswered(s.id)) return s.id;
    if (isGateYes(s.id)) {
      const section = sections.find((sec) => sec.id === s.id);
      if (section?.allowMultiple) {
        for (let inst = 0; inst <= activeInstance; inst++) {
          const allAnswered = section.fields.every((f) => {
            const k = getKey(s.id, inst, f.id);
            const v = getAnswer(k);
            return v !== null && v !== undefined && v !== "";
          });
          if (!allAnswered) return s.id;
        }
      } else {
        const allAnswered = section.fields.every((f) => {
          const k = getKey(s.id, 0, f.id);
          const v = getAnswer(k);
          return v !== null && v !== undefined && v !== "";
        });
        if (!allAnswered) return s.id;
      }
    }
  }
  return null;
}

function countCompletedSections() {
  let count = 0;
  for (const s of sections) {
    if (isGateAnswered(s.id)) {
      if (!isGateYes(s.id)) { count++; continue; }
      const section = sections.find((sec) => sec.id === s.id);
      if (!section) continue;
      let answered = true;
      if (section.allowMultiple) {
        for (let inst = 0; inst <= activeInstance; inst++) {
          const allFilled = section.fields.every((f) => {
            const k = getKey(s.id, inst, f.id);
            return getAnswer(k) !== null && getAnswer(k) !== undefined && getAnswer(k) !== "";
          });
          if (!allFilled) { answered = false; break; }
        }
      } else {
        answered = section.fields.every((f) => {
          const k = getKey(s.id, 0, f.id);
          return getAnswer(k) !== null && getAnswer(k) !== undefined && getAnswer(k) !== "";
        });
      }
      if (answered) count++;
    }
  }
  return count;
}

document.getElementById("sign-out")?.addEventListener("click", async () => {
  document.getElementById("sign-out").disabled = true;
  await fetch("/v1/auth/signout", { method: "POST", credentials: "same-origin" });
  location.assign("/");
});

function renderSectionNav() {
  const list = document.querySelector(SECTION_LIST);
  if (!list) return;
  list.innerHTML = "";
  let firstIncomplete = null;
  for (const s of sections) {
    const state = getSectionState(s.id);
    if (!firstIncomplete && state !== "completed") firstIncomplete = s.id;
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.dataset.sectionId = s.id;
    if (s.id === activeSectionId) a.classList.add("active");

    const icon = document.createElement("span");
    icon.className = "nav-icon";
    icon.textContent = s.icon;
    a.append(icon);

    const label = document.createElement("span");
    label.textContent = s.title;
    a.append(label);

    const status = document.createElement("span");
    status.className = `nav-status ${state}`;
    a.append(status);

    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigateToSection(s.id);
    });

    li.append(a);

    if (s.allowMultiple && (state === "active" || state === "completed")) {
      for (let inst = 0; inst <= activeInstance; inst++) {
        if (inst === 0) continue;
        const sub = document.createElement("a");
        sub.href = "#";
        sub.style.paddingLeft = "2rem";
        sub.style.fontSize = ".73rem";
        sub.textContent = `#${inst} ${s.multipleLabel ?? s.title}`;
        sub.dataset.sectionId = s.id;
        sub.dataset.instance = inst;
        sub.addEventListener("click", (e) => {
          e.preventDefault();
          activeInstance = inst;
          navigateToSection(s.id);
        });
        li.append(sub);
      }
    }

    list.append(li);
  }
  if (!activeSectionId) activeSectionId = firstIncomplete ?? sections[0]?.id;
}

function navigateToSection(sectionId, instance) {
  activeSectionId = sectionId;
  if (instance !== undefined) activeInstance = instance;
  renderSectionNav();
  renderCurrentSection();
  updateProgress();
}

function renderCurrentSection() {
  const section = sections.find((s) => s.id === activeSectionId);
  if (!section) {
    renderCompletion();
    return;
  }

  const gateAnswered = isGateAnswered(activeSectionId);
  const gateYes = isGateYes(activeSectionId);
  const nextId = nextUnansweredSection();

  if (!nextId && gateAnswered) {
    renderCompletion();
    return;
  }

  const gatePanel = document.querySelector(GATE_PANEL);
  const fieldsPanel = document.querySelector(FIELDS_PANEL);
  const completionPanel = document.querySelector(COMPLETION_PANEL);

  completionPanel.hidden = true;

  if (!gateAnswered) {
    gatePanel.hidden = false;
    fieldsPanel.hidden = true;
    renderGate(section);
  } else if (gateYes) {
    gatePanel.hidden = true;
    fieldsPanel.hidden = false;
    renderFields(section);
  } else {
    gatePanel.hidden = true;
    fieldsPanel.hidden = false;
    renderNextNav(section, false);
  }
}

function renderGate(section) {
  const panel = document.querySelector(GATE_PANEL);
  if (!panel) return;

  const q = section.gateQuestion;
  const idx = sections.findIndex((s) => s.id === section.id);
  const answered = getAnswer(gateKey(section.id));
  const canExtract = ["employment", "medical", "tax_free_savings"].includes(section.id);

  panel.innerHTML = `
    <div class="section-badge">
      <span class="badge-icon">${section.icon}</span>
      <span>${section.title}</span>
      <span class="badge-num">section ${idx + 1} of ${sections.length}</span>
    </div>
    <h2>${q.text.includes("?") ? q.text : q.text + "?"}</h2>
    <p class="gate-desc">${q.text}</p>
    ${q.helpText ? `<div class="gate-help"><strong>Tip:</strong> ${q.helpText}</div>` : ""}
    <div class="gate-actions">
      <button class="gate-btn yes ${answered === true || answered === "yes" ? "selected" : ""}" data-value="yes">Yes</button>
      <button class="gate-btn no ${answered === false || answered === "no" ? "selected" : ""}" data-value="no">No</button>
    </div>
    ${canExtract ? `
    <div class="upload-mini" id="upload-mini">
      <h3>Have a tax certificate? Upload it to auto-fill</h3>
      <p>Rovyniq can read IRP5, medical and TFSA certificates and fill in the fields automatically.</p>
      <div class="file-actions">
        <button class="secondary small" id="mini-upload-btn" type="button">Choose PDF</button>
        <input id="mini-upload-input" type="file" accept="application/pdf,.pdf" hidden>
        <span id="mini-upload-status" class="mini-status">No file selected</span>
      </div>
    </div>` : ""}
  `;

  panel.querySelectorAll(".gate-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.value === "yes" ? true : false;
      setAnswer(gateKey(section.id), value);
      renderSectionNav();
      renderCurrentSection();
      updateProgress();
    });
  });

  setupMiniUpload(section);
}

function setupMiniUpload(section) {
  const btn = document.getElementById("mini-upload-btn");
  const input = document.getElementById("mini-upload-input");
  const status = document.getElementById("mini-upload-status");
  if (!btn || !input) return;

  btn.addEventListener("click", () => input.click());
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    status.textContent = `Reading ${file.name}...`;

    try {
      let docType = "IRP5_IT3A";
      if (section.id === "medical") docType = "MEDICAL_CERTIFICATE";
      else if (section.id === "tax_free_savings") docType = "IT3S";

      const result = await extractor.extractFromPdf(file, docType);

      const sectionFields = section.fields;
      let filled = 0;
      for (const [fieldId, value] of Object.entries(result.fields)) {
        const fieldDef = sectionFields.find((f) => f.id === fieldId);
        if (!fieldDef) continue;
        if (value !== undefined && value !== null && value !== "") {
          const k = getKey(section.id, activeInstance, fieldId);
          setAnswer(k, value);
          filled++;
        }
      }

      status.innerHTML = `<span class="extraction-badge">&#10003; Extracted ${filled} field(s) from PDF</span>`;
      renderSectionNav();
      renderCurrentSection();
      updateProgress();
    } catch (err) {
      status.textContent = "Could not read PDF. Try again or fill in manually.";
      console.error("Extraction error:", err);
    }
  });
}

function renderFields(section) {
  const panel = document.querySelector(FIELDS_PANEL);
  if (!panel) return;

  const idx = sections.findIndex((s) => s.id === section.id);
  const multiLabel = section.multipleLabel ?? section.title;

  let instances = [0];
  if (section.allowMultiple) {
    instances = [];
    for (let i = 0; i <= activeInstance; i++) instances.push(i);
  }

  panel.innerHTML = `
    <div class="section-badge">
      <span class="badge-icon">${section.icon}</span>
      <span>${section.title}</span>
      <span class="badge-num">section ${idx + 1} of ${sections.length}</span>
    </div>
    ${section.allowMultiple ? `
    <div class="fields-nav" id="instance-tabs">
      ${instances.map((i) => `
        <button class="${i === activeInstance ? "active" : ""}" data-instance="${i}">
          ${getAnswer(getKey(section.id, i, section.fields[0]?.id)) ? '<span class="check">&#10003;</span>' : ""}
          #${i + 1} ${multiLabel}
        </button>
      `).join("")}
      <button id="add-instance-btn" class="add-btn">+ Add another</button>
    </div>` : ""}
    <div id="fields-container">${renderInstanceFields(section, activeInstance)}</div>
    ${renderNavButtons(section)}
  `;

  if (section.allowMultiple) {
    panel.querySelectorAll("#instance-tabs button[data-instance]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeInstance = parseInt(btn.dataset.instance, 10);
        renderSectionNav();
        renderCurrentSection();
        updateProgress();
      });
    });

    document.getElementById("add-instance-btn")?.addEventListener("click", () => {
      activeInstance++;
      renderSectionNav();
      renderCurrentSection();
      updateProgress();
    });
  }

  const prevBtn = panel.querySelector(".prev-btn");
  const nextBtn = panel.querySelector(".next-btn");

  prevBtn?.addEventListener("click", () => {
    const prevIdx = sections.findIndex((s) => s.id === activeSectionId) - 1;
    if (prevIdx >= 0) {
      activeInstance = 0;
      navigateToSection(sections[prevIdx].id);
    }
  });

  nextBtn?.addEventListener("click", () => {
    const nextId = nextUnansweredSection();
    if (nextId) {
      activeInstance = 0;
      navigateToSection(nextId);
    } else {
      renderCompletion();
    }
  });

  setupFieldEventListeners(section);
}

function renderInstanceFields(section, instance) {
  const prefix = getKey(section.id, instance, "");
  const label = instance === 0 ? section.title : `#${instance} ${section.multipleLabel ?? section.title}`;

  let html = `
    <div class="instance-header">
      <span class="instance-num">${instance + 1}</span>
      <h3>${label}</h3>
    </div>
  `;

  for (const field of section.fields) {
    const fullKey = prefix + field.id;
    const currentValue = getAnswer(fullKey);
    const hasExtraction = field.sourceCodes?.length > 0 && currentValue !== null && currentValue !== undefined && currentValue !== "";

    let inputHtml = "";
    let inputClass = "field-input";
    if (hasExtraction) inputClass += " field-filled";

    switch (field.type) {
      case "yesno": {
        inputHtml = `<div class="btn-group">
          <button class="btn-option ${currentValue === true ? "selected" : ""}" data-key="${fullKey}" data-value="yes">Yes</button>
          <button class="btn-option ${currentValue === false ? "selected" : ""}" data-key="${fullKey}" data-value="no">No</button>
        </div>`;
        break;
      }
      case "select": {
        const opts = field.options?.map((o) =>
          `<option value="${o.value}" ${String(currentValue) === String(o.value) ? "selected" : ""}>${o.label}</option>`
        ).join("") ?? "";
        inputHtml = `<select class="${inputClass}" data-key="${fullKey}">
          <option value="">-- Select --</option>
          ${opts}
        </select>`;
        break;
      }
      case "currency": {
        const val = currentValue !== null ? (typeof currentValue === "number" ? currentValue.toFixed(2) : currentValue) : "";
        inputHtml = `<div class="field-row">
          <input class="${inputClass}" type="text" inputmode="decimal" data-key="${fullKey}" value="${val}" placeholder="R 0.00">
          <span class="field-suffix">ZAR</span>
        </div>`;
        break;
      }
      case "number": {
        const val = currentValue !== null && currentValue !== undefined ? currentValue : "";
        const suffixHtml = field.suffix ? `<span class="field-suffix">${field.suffix}</span>` : "";
        inputHtml = suffixHtml
          ? `<div class="field-row"><input class="${inputClass}" type="text" inputmode="numeric" data-key="${fullKey}" value="${val}" placeholder="${field.placeholder ?? "0"}">${suffixHtml}</div>`
          : `<input class="${inputClass}" type="text" inputmode="numeric" data-key="${fullKey}" value="${val}" placeholder="${field.placeholder ?? "0"}">`;
        break;
      }
      case "date": {
        const val = currentValue ?? "";
        inputHtml = `<input class="${inputClass}" type="text" data-key="${fullKey}" value="${val}" placeholder="${field.placeholder ?? "DD/MM/YYYY"}">`;
        break;
      }
      case "info": {
        inputHtml = `<div style="background:#edf5ef;border-left:3px solid #168a68;border-radius:6px;padding:.75rem .9rem;font-size:.82rem;line-height:1.5;color:var(--ink)">${field.text}</div>`;
        break;
      }
      case "codes": {
        const val = currentValue ? (typeof currentValue === "object" ? JSON.stringify(currentValue) : currentValue) : "";
        inputHtml = `<textarea class="${inputClass}" data-key="${fullKey}" rows="3" placeholder="${field.placeholder ?? "e.g. 708333 3601"}">${val}</textarea>
          ${field.sourceCodes?.length ? `<small style="color:var(--muted);font-size:.68rem;display:block;margin-top:.3rem">Available codes: ${field.sourceCodes.map((c) => {
            const labels = { 3601: "Income or salary", 3602: "Non-taxable income", 3603: "Pension (PAYE)", 3604: "Pension (Excl)", 3605: "Annual payment", 4001: "Pension fund", 4003: "Provident fund", 4005: "Medical aid", 4006: "Retirement annuity fund", 4473: "Provident fund contribution", 4474: "Pension fund contribution", 4475: "RAF contribution" };
            return `${c} ${labels[c] ?? ""}`;
          }).join(", ")}</small>` : ""}`;
        break;
      }
      default: {
        const val = currentValue ?? "";
        inputHtml = `<input class="${inputClass}" type="text" data-key="${fullKey}" value="${val}" placeholder="${field.placeholder ?? ""}">`;
      }
    }

    const extractionTag = hasExtraction ? `<span class="extraction-tag">&#10003; From PDF</span>` : "";
    const helpHtml = field.helpText ? `<p class="field-help">${field.helpText}</p>` : "";

    html += `
      <div class="field-group" data-field-id="${field.id}">
        <label class="field-label">${field.text} ${extractionTag}</label>
        ${helpHtml}
        ${inputHtml}
      </div>
    `;
  }

  return html;
}

function setupFieldEventListeners(section) {
  const container = document.getElementById("fields-container");
  if (!container) return;

  container.querySelectorAll("[data-key]").forEach((el) => {
    const key = el.dataset.key;

    const save = () => {
      let value;
      if (el.tagName === "SELECT") {
        value = el.value || null;
      } else if (el.type === "text" || el.tagName === "TEXTAREA") {
        value = el.value || null;
      } else {
        value = el.value ?? null;
      }

      if (el.dataset.value === "yes" || el.dataset.value === "no") {
        value = el.dataset.value === "yes" ? true : false;
      }

      setAnswer(key, value);
      renderSectionNav();
      updateProgress();

      if (el.classList) {
        el.classList.toggle("field-filled", value !== null && value !== undefined && value !== "");
      }
    };

    if (el.classList.contains("btn-option")) {
      el.addEventListener("click", () => {
        const parent = el.closest(".btn-group");
        parent.querySelectorAll(".btn-option").forEach((b) => b.classList.remove("selected"));
        el.classList.add("selected");
        setAnswer(el.dataset.key, el.dataset.value === "yes" ? true : false);
        renderSectionNav();
        updateProgress();
      });
    } else if (el.tagName === "SELECT") {
      el.addEventListener("change", save);
    } else {
      el.addEventListener("change", save);
      el.addEventListener("blur", save);
    }
  });
}

function renderNavButtons(section) {
  const prevIdx = sections.findIndex((s) => s.id === section.id) - 1;
  const nextId = nextUnansweredSection();
  const isLast = !nextId;

  return `
    <div class="nav-actions">
      <button class="prev prev-btn" ${prevIdx < 0 ? "disabled" : ""}>&larr; Previous section</button>
      <button class="next next-btn">${isLast ? "Complete interview" : "Next section &rarr;"}</button>
    </div>
  `;
}

function renderNextNav(section, showNext) {
  const panel = document.querySelector(FIELDS_PANEL);
  if (!panel) return;
  const nextId = nextUnansweredSection();
  const isLast = !nextId;

  panel.innerHTML = `
    <div class="section-badge">
      <span class="badge-icon">${section.icon}</span>
      <span>${section.title}</span>
    </div>
    <p style="color:var(--muted);margin:1rem 0 2rem">You indicated this section does not apply to you.</p>
    <div class="nav-actions">
      <button class="prev prev-btn">&larr; Previous section</button>
      <button class="next next-btn">${isLast ? "Complete interview" : "Next section &rarr;"}</button>
    </div>
  `;

  panel.querySelector(".prev-btn")?.addEventListener("click", () => {
    const prevIdx = sections.findIndex((s) => s.id === activeSectionId) - 1;
    if (prevIdx >= 0) {
      activeInstance = 0;
      navigateToSection(sections[prevIdx].id);
    }
  });

  panel.querySelector(".next-btn")?.addEventListener("click", () => {
    if (nextId) {
      activeInstance = 0;
      navigateToSection(nextId);
    } else {
      renderCompletion();
    }
  });
}

function renderCompletion() {
  const gatePanel = document.querySelector(GATE_PANEL);
  const fieldsPanel = document.querySelector(FIELDS_PANEL);
  const completionPanel = document.querySelector(COMPLETION_PANEL);
  if (gatePanel) gatePanel.hidden = true;
  if (fieldsPanel) fieldsPanel.hidden = true;
  if (completionPanel) {
    completionPanel.hidden = false;
    const completed = countCompletedSections();
    completionPanel.innerHTML = `
      <div class="completion-icon">&#10003;</div>
      <h2>All sections complete</h2>
      <p>You have answered ${completed} of ${sections.length} sections for your 2026 ITR12.</p>
      <button id="review-all-btn" class="primary" type="button">Review all answers</button>
      <br>
      <a href="documents.html" class="text-link" style="display:inline-block;margin-top:1rem;color:var(--muted);font-size:.82rem">&larr; Back to documents</a>
      <div id="review-container"></div>
    `;
    document.getElementById("review-all-btn")?.addEventListener("click", renderFullReview);
  }
}

function renderFullReview() {
  const container = document.getElementById("review-container");
  if (!container) return;
  container.innerHTML = "";
  const btn = document.getElementById("review-all-btn");
  if (btn) btn.textContent = "Refresh review";

  for (const section of sections) {
    if (!isGateAnswered(section.id)) continue;
    const gateYes = isGateYes(section.id);

    const div = document.createElement("div");
    div.className = "review-panel";
    div.innerHTML = `<h3>${section.icon} ${section.title} — ${gateYes ? "Yes" : "No / Not applicable"}</h3>`;

    if (gateYes) {
      const maxInst = section.allowMultiple ? activeInstance : 0;
      for (let inst = 0; inst <= maxInst; inst++) {
        const prefix = getKey(section.id, inst, "");
        if (section.allowMultiple && maxInst > 0) {
          const h = document.createElement("h4");
          h.style.cssText = "font-size:.78rem;color:var(--muted);margin:.8rem 0 .4rem";
          h.textContent = `#${inst + 1} ${section.multipleLabel ?? ""}`;
          div.append(h);
        }
        for (const field of section.fields) {
          const val = getAnswer(prefix + field.id);
          if (val !== null && val !== undefined && val !== "") {
            const row = document.createElement("div");
            row.className = "review-row";
            const displayVal = typeof val === "boolean" ? (val ? "Yes" : "No") : String(val);
            row.innerHTML = `<span class="review-label">${field.text.length > 60 ? field.text.slice(0, 60) + "..." : field.text}</span><span class="review-value">${displayVal}</span>`;
            div.append(row);
          }
        }
      }
    }

    container.append(div);
  }
}

function updateProgress() {
  const label = document.querySelector(PROGRESS_LABEL);
  if (!label) return;
  const completed = countCompletedSections();
  label.textContent = `${completed} of ${sections.length} sections`;
}

renderSectionNav();
renderCurrentSection();
updateProgress();
