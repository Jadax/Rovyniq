interface Environment { ENVIRONMENT: "preview" | "production"; }
const json = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" } });
export default {
  async fetch(request: Request, environment: Environment): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") return json({ service: "rovyniq-edge-api", status: "ok", environment: environment.ENVIRONMENT });
    if (request.method === "POST" && url.pathname === "/uploads") return json({ error: "uploads_not_enabled", message: "Rovyniq accepts no production tax documents until the secure ingestion controls are deployed and reviewed." }, 503);
    return json({ error: "not_found" }, 404);
  }
};
