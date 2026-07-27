import { createServer } from "node:http";
import { extractBearerToken, oidcConfigFromEnvironment, verifyAccessToken } from "./auth.ts";
const port = Number(process.env.PORT ?? 3001);
const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    response.end(JSON.stringify({ service: "rovyniq-api", status: "ok" }));
    return;
  }
  if (request.method === "GET" && request.url === "/v1/me") {
    const configuration = oidcConfigFromEnvironment(process.env);
    const token = extractBearerToken(request.headers.authorization);
    if (!configuration) { response.writeHead(503, { "content-type": "application/json", "cache-control": "no-store" }); response.end(JSON.stringify({ error: "identity_not_configured" })); return; }
    if (!token) { response.writeHead(401, { "content-type": "application/json", "cache-control": "no-store", "www-authenticate": "Bearer" }); response.end(JSON.stringify({ error: "unauthenticated" })); return; }
    void verifyAccessToken(token, configuration).then((principal) => { response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" }); response.end(JSON.stringify({ subject: principal.subject, roles: principal.roles })); }).catch(() => { response.writeHead(401, { "content-type": "application/json", "cache-control": "no-store", "www-authenticate": "Bearer" }); response.end(JSON.stringify({ error: "unauthenticated" })); });
    return;
  }
  response.writeHead(404, { "content-type": "application/json", "cache-control": "no-store" }); response.end(JSON.stringify({ error: "not_found" }));
});
server.listen(port, "127.0.0.1", () => console.log(`Rovyniq API listening on ${port}`));
