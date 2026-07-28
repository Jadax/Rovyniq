# Cloud Run ClamAV sidecar

Rovyniq accepts a document only after it has passed a malware scan. For the early Cloud Run deployment, use a ClamAV daemon as a sidecar in the same service instance as the API. This keeps its TCP port private to loopback while allowing the whole service to scale to zero.

## Security model

- The Rovyniq API remains the sole ingress container on port `8080`.
- The ClamAV container listens only on `127.0.0.1:3310` from the API's point of view. It receives no public URL, Cloud Run IAM invoker grant, database credentials, R2 token, or application secrets.
- The API sends bounded document bytes using ClamAV's `INSTREAM` protocol. A timeout, network error or unknown verdict fails closed and leaves the upload unavailable.
- Use a reviewed, pinned digest of the official `clamav/clamav` image. Do not use a floating `latest` tag in a public deployment.

## Console procedure

1. In Cloud Run, open the `rovyniq-web` service and choose **Edit and deploy new revision**.
2. Under **Containers**, keep the existing Rovyniq API container as the first container with port `8080`.
3. Choose **Add container** and add the reviewed ClamAV image. Name it `clamav`; configure container port `3310`.
4. Give the ClamAV container no environment variables, no secret mappings and no mounted volumes. It must not inherit the API container's configuration.
5. Set a TCP startup probe on port `3310`. Use an initial delay of 20 seconds, a 5-second period, a 5-second timeout and a failure threshold of 12 to allow signature loading on a cold start.
6. Give the sidecar a minimum of 1 CPU and 1 GiB memory. Keep the Cloud Run service on request-based billing, minimum instances `0`, and a small maximum instance count for the private pilot.
7. Add these ordinary environment variables to the **Rovyniq API container only**:

   - `CLAMAV_HOST=127.0.0.1`
   - `CLAMAV_PORT=3310`
   - `CLAMAV_TIMEOUT_MS=30000`

8. Deploy, wait for the ClamAV startup probe and API health check to pass, then test one synthetic clean PDF. The upload must be rejected or remain unavailable if the scanner cannot be reached.

## Image review and updates

Before each deployment, review the chosen ClamAV image's publisher, supported architecture, release notes and immutable digest. Record the digest in the Cloud Run revision notes. Update it regularly for signature-engine and operating-system fixes. A scanner with stale definitions is not an acceptable production control.

## Do not enable real uploads yet

First exercise this setup with synthetic PDFs and an approved harmless malware test fixture in a controlled non-production workspace. Confirm that clean files become validated, malicious files are archived and scanner outages fail closed. No real taxpayer document should be used to validate infrastructure.
