const form = document.querySelector("#upload-form");
const file = document.querySelector("#document-file");
const chooseFile = document.querySelector("#choose-file");
const name = document.querySelector("#file-name");
const status = document.querySelector("#status");
const type = document.querySelector("#document-type");
const uploadButton = document.querySelector("#upload-button");
const list = document.querySelector("#document-list");
const count = document.querySelector("#document-count");
const workspace = new URLSearchParams(location.search).get("workspace");

const documentLabels = { IRP5_IT3A: "Employment certificate", IT3B: "Interest certificate", MEDICAL_CERTIFICATE: "Medical certificate", OTHER: "Supporting document" };
const stateLabels = { VALIDATED: "Validated", QUARANTINED: "Checking", ARCHIVED: "Needs attention" };

chooseFile.addEventListener("click", () => file.click());
file.addEventListener("change", () => { name.textContent = file.files?.[0]?.name ?? "No file selected"; });

function validWorkspace() { return /^[0-9a-f-]{36}$/i.test(workspace ?? ""); }

function renderDocuments(documents) {
  count.textContent = String(documents.length);
  if (!documents.length) {
    list.replaceChildren(Object.assign(document.createElement("li"), { className: "empty-state", textContent: "No documents yet. Start by adding the certificates you already have." }));
    return;
  }
  list.replaceChildren(...documents.map((entry) => {
    const item = document.createElement("li");
    item.className = "document-row";
    const detail = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = entry.filename;
    const meta = document.createElement("span");
    meta.textContent = documentLabels[entry.documentType] ?? "Supporting document";
    detail.append(title, meta);
    const badge = document.createElement("span");
    badge.className = `state state-${String(entry.state).toLowerCase()}`;
    badge.textContent = stateLabels[entry.state] ?? entry.state;
    item.append(detail, badge);
    return item;
  }));
}

async function loadDocuments() {
  if (!validWorkspace()) { list.replaceChildren(Object.assign(document.createElement("li"), { className: "empty-state", textContent: "Open this page from your protected return workspace." })); return; }
  const response = await fetch(`/v1/workspaces/${workspace}/documents`, { credentials: "same-origin" });
  if (response.status === 401) { location.assign(`/v1/auth/start?return_to=${encodeURIComponent(location.pathname + location.search)}`); return; }
  if (!response.ok) throw new Error("document_library_unavailable");
  renderDocuments((await response.json()).documents);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selected = file.files?.[0];
  if (!validWorkspace()) { status.textContent = "Open this screen from your protected return workspace."; return; }
  if (!selected) { status.textContent = "Choose a PDF to continue."; return; }
  if (selected.type && selected.type !== "application/pdf") { status.textContent = "Please choose a PDF document."; return; }
  uploadButton.disabled = true;
  status.textContent = "Encrypting and checking your document…";
  try {
    const response = await fetch(`/v1/workspaces/${workspace}/documents`, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/pdf", "x-document-type": type.value, "x-filename": selected.name, "idempotency-key": crypto.randomUUID() }, body: selected });
    const body = await response.json();
    if (!response.ok) {
      status.textContent = body.error === "document_ingestion_not_configured" ? "Secure uploads are being activated. Your file was not stored." : body.error ?? "Your document could not be uploaded.";
      return;
    }
    status.textContent = `Document received: ${(stateLabels[body.state] ?? body.state).toLowerCase()}.`;
    form.reset(); name.textContent = "No file selected";
    await loadDocuments();
  } catch {
    status.textContent = "We could not upload your document. Please try again.";
  } finally { uploadButton.disabled = false; }
});

loadDocuments().catch(() => { list.replaceChildren(Object.assign(document.createElement("li"), { className: "empty-state", textContent: "Your document library is temporarily unavailable." })); });
