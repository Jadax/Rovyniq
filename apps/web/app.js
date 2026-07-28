const status = document.querySelector("#account-status");

try {
  const response = await fetch("/v1/session", { credentials: "same-origin" });
  if (response.status === 401) {
    location.assign(`/v1/auth/start?return_to=${encodeURIComponent(location.pathname + location.search)}`);
  } else if (response.ok) {
    const { workspace, roles } = await response.json();
    if (workspace?.workspaceId) location.replace(`/documents?workspace=${encodeURIComponent(workspace.workspaceId)}`);
    else status.textContent = roles?.includes("taxpayer") ? "Your secure workspace is being prepared. Please try again in a moment." : "Your account is ready. We are confirming access to your taxpayer workspace.";
  } else status.textContent = "This protected workspace is not configured.";
} catch { status.textContent = "We could not open your secure workspace. Please try again."; }
