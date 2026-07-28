const form = document.querySelector("#upload-form");
const file = document.querySelector("#document-file");
const name = document.querySelector("#file-name");
const status = document.querySelector("#status");
const type = document.querySelector("#document-type");

file.addEventListener("change", () => {
  name.textContent = file.files?.[0]?.name ?? "No file selected";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selected = file.files?.[0];
  const workspace = new URLSearchParams(location.search).get("workspace");
  if (!selected) return;
  if (!/^[0-9a-f-]{36}$/i.test(workspace ?? "")) {
    status.textContent = "Open this screen from your protected return workspace.";
    return;
  }
  if (selected.type !== "application/pdf") {
    status.textContent = "Please choose a PDF document.";
    return;
  }
  status.textContent = "Preparing your encrypted upload...";
  try {
    const response = await fetch(`/v1/workspaces/${workspace}/documents`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/pdf", "x-document-type": type.value, "x-filename": selected.name, "idempotency-key": crypto.randomUUID() },
      body: selected
    });
    const body = await response.json();
    status.textContent = response.ok ? `Document received: ${body.state.toLowerCase().replace("_", " ")}.` : body.error ?? "Your document could not be uploaded.";
  } catch {
    status.textContent = "This screen needs the protected Rovyniq application.";
  }
});
