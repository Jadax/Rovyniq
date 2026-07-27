# No-Docker deployment path

For a public preview without local containers, Rovyniq can deploy its static website with GitHub Pages from the `Jadax/Rovyniq` repository. GitHub Pages is static hosting only: use it for the no-data website shell, not authentication, uploads, database access or filing. The included workflow follows GitHub’s official Pages deployment model. [GitHub Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

Cloudflare Workers remains an optional edge/API preview path. Workers Free currently offers 100,000 requests/day; treat it as a synthetic-data preview only, not an approval to process production tax documents. [Cloudflare pricing](https://www.cloudflare.com/plans/developer-platform-pricing/)

## Environments

| Environment | Allowed data | Storage | Filing |
|---|---|---|---|
| Local/static preview | Synthetic only | None | Not available |
| GitHub Pages preview | Synthetic only; static site only | None | Not available |
| Cloud edge preview | Synthetic only | None until security controls exist | Not available |
| Private beta | Only after POPIA/security review and approved storage contract | Encrypted, scanned object storage + PostgreSQL | Manual eFiling handoff only |
| Public service | Only after practitioner/legal review | Production security controls and operational review | Authorised SARS mechanism only |

## Deployment boundary

The Worker has no live upload functionality. Enabling `POST /uploads` requires the Phase 2 secure ingestion design, implementation, test suite and approval; it must not be flipped on by a configuration change.
