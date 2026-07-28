# Private household pilot (Windows + Tailscale)

This is a private, no-Docker pilot for the account owner and their invited household member. It is not a public deployment, a production launch, or permission to accept documents from the general public.

## Boundary

- The API binds only to `127.0.0.1:3001`.
- Tailscale Serve provides the HTTPS edge only to approved tailnet devices. Do not enable Funnel and do not open router ports.
- The Node process serves the existing allowlisted Rovyniq web assets and API from one protected origin. GitHub Pages remains a no-data preview.
- The Windows host must be online and signed in to Tailscale while the pilot is in use.

## Before running

1. Install Node.js 24 or later and Tailscale on the Windows host. Invite the second household user to the tailnet with their own identity.
2. In the Tailscale admin console, enable MagicDNS and HTTPS only after giving the device a non-identifying name such as `tax-pilot`.
3. Create a local `.env` from `.env.pilot.example`, not from `.env.example`. This keeps storage and scanner settings absent, so document uploads fail closed. Do not commit it or share its values.
4. Configure the browser callback using the final Tailscale HTTPS hostname: `https://tax-pilot.<tailnet>.ts.net/v1/auth/callback`. Register the exact same value in ZITADEL and set the matching post-logout URL to `https://tax-pilot.<tailnet>.ts.net/app`.
5. Set `NODE_ENV=production`, `PORT=3001`, and all OIDC settings. Use ZITADEL's HTTPS issuer, OAuth v2 authorization/token endpoints, and JWKS endpoint. Set `OIDC_AUDIENCE` to the Web application's client ID and request the ZITADEL project-role scope from `.env.example`.
6. In ZITADEL's applicable Login Behavior settings, enable local username/password login and self-registration only for the household pilot. After each account is created, assign the `taxpayer` role under the Rovyniq project's Role Assignments. Do not automatically grant taxpayer privileges to anonymous registrants in a public launch.

## Start and expose privately

From the repository root, run `npm.cmd run start:pilot`. In an Administrator PowerShell window, run `tailscale serve --bg 3001`. Tailscale must report an `https://tax-pilot.<tailnet>.ts.net` URL that is available **within your tailnet**. Confirm the status before signing in.

The private pilot is only ready to accept documents after PostgreSQL, envelope-encrypted object storage, and the isolated scanner are configured. Until then the document endpoint intentionally fails closed with `503`.

## Public transition

For a public launch, keep the same origin model and replace the private Tailscale edge with a managed HTTPS reverse proxy on a paid, hardened server and a domain owned by Astraiva. Review legal, POPIA, security, operational monitoring, malware isolation, backups, incident response, rate limiting and tax-practitioner requirements before accepting public documents.
