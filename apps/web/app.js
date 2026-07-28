const status = document.querySelector("#account-status");
const link = document.querySelector("#documents-link");
const list = document.querySelector("#document-list");

link.setAttribute("aria-disabled", "true");
link.href = "#";
link.addEventListener("click", (event) => {
  if (link.getAttribute("aria-disabled") === "true") event.preventDefault();
});

try {
  const response = await fetch("/v1/session", { credentials: "same-origin" });
  if (response.status === 401) {
    location.assign(`/v1/auth/start?return_to=${encodeURIComponent(location.pathname + location.search)}`);
  } else if (response.ok) {
    const session = await response.json();
    const workspace = session.workspace;
    if (!workspace?.workspaceId) {
      status.textContent = session.roles?.includes("taxpayer")
        ? "Your secure workspace is being prepared. Please try again in a moment."
        : "Your account is ready. We are confirming access to your taxpayer workspace.";
    } else {
      const workspaceId = workspace.workspaceId;
      link.href = `documents.html?workspace=${encodeURIComponent(workspaceId)}`;
      link.removeAttribute("aria-disabled");
      status.textContent = "You are signed in. Your 2026 return workspace is ready when you are.";
      const documents = await fetch(`/v1/workspaces/${workspaceId}/documents`, { credentials: "same-origin" });
      if (documents.ok) {
        const body = await documents.json();
        list.replaceChildren(...body.documents.map((entry) => {
          const item = document.createElement("li");
          item.textContent = `${entry.filename}: ${entry.state.toLowerCase().replace("_", " ")}`;
          return item;
        }));
        if (!body.documents.length) list.textContent = "No documents have been added yet.";
      }
    }
  } else {
    status.textContent = "This protected workspace is not configured in the public preview.";
  }
} catch {
  status.textContent = "This protected workspace needs the secured Rovyniq application.";
}
