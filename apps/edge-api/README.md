# Rovyniq edge API

This is a no-Docker Cloudflare Workers deployment path. It deliberately exposes only a health endpoint and a fail-closed upload endpoint. Before handling real documents, add authenticated tenant-aware routes, encrypted storage, anti-malware scanning, content/type/size checks, audit persistence, rate limits, abuse protection and a POPIA/security review.

Deploy only a synthetic-data preview with `npx wrangler deploy` after creating a Cloudflare account and authenticating locally. Do not deploy live taxpayer data to a free plan without reviewing the applicable contractual, POPIA, data-location, retention and incident-response terms.
