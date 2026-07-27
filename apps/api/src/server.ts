import { createServer } from "node:http";
const port = Number(process.env.PORT ?? 3001);
const server = createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
    response.end(JSON.stringify({ service: "rovyniq-api", status: "ok" }));
    return;
  }
  response.writeHead(404, { "content-type": "application/json", "cache-control": "no-store" });
  response.end(JSON.stringify({ error: "not_found" }));
});
server.listen(port, "127.0.0.1", () => console.log(`Rovyniq API listening on ${port}`));
