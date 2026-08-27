# Vercel Three-Service Deployment

## Purpose

This runbook deploys the same audited Next.js repository into three Git-linked Vercel projects with distinct, host-aware service boundaries. The split gives the public website, the protected administrative workspace, and the API service their own Vercel URLs while preserving the existing Phase A security gates.

> This is a **service-surface separation**. The current Phase A application contains server-rendered pages that directly call the MySQL/TiDB data helpers. Until a later, separately reviewed BFF extraction is completed, the public and admin projects still require the database connection at server runtime. No database value is exposed to the browser.

| Vercel project | Required `GVF_DEPLOYMENT_SURFACE` | Intended surface | Suggested initial URL |
|---|---|---|---|
| `gvf-public` | `public` | Public website, Member registration and account journeys, with API requests rewritten to `gvf-api` | `gvf-public.vercel.app` |
| `gvf-admin` | `admin` | Administrative workspace, with administrative API requests rewritten to `gvf-api` | `gvf-admin.vercel.app` |
| `gvf-api` | `api` | API routes only; page routes return `404` | `gvf-api.vercel.app` |

The middleware reads `GVF_DEPLOYMENT_SURFACE` on each request. A missing or invalid value resolves to `all`, which preserves local development behavior. Production Vercel projects must set one of the three explicit values above.

## Version-controlled configuration

The root [`vercel.json`](../vercel.json) keeps Git deployments deterministic by requiring a frozen pnpm lockfile and the existing production build command. Vercel links every project to `sainisun/gram-vikash-foundation`, uses the repository root as its root directory, and deploys from `main`. Vercel's Git-linked project model supports distinct projects from the same repository; each project owns its own environment values and deployment URL. [1]

The public and admin projects are intentionally separated at the route boundary. The public project returns `404` for `/admin` and `/api/admin/*`. The admin project returns `404` for public and Member pages, while allowing `/admin`, `/api/admin/*`, `/access-required`, and only the authentication endpoints it needs. The API project returns `404` for every non-`/api` path. On the public and admin hosts, non-authentication `/api/*` traffic is internally rewritten to the configured API service URL; direct API handlers do not run on either frontend host. If the backend origin is absent or malformed, frontend API traffic returns `503` rather than falling back to a local handler.

After administrator login on the admin host, the OAuth callback returns the user to `/admin`; the public host retains the normal Member return path at `/my-donations`. Cookie settings and server-side role checks remain unchanged.

## Production environment values

Set the following in **each Vercel project** for both `Production` and `Preview`, unless the table says otherwise. Enter secret values only in Vercel's encrypted environment-variable panel. Do not commit `.env` files, reveal values in chat, or reuse development-only credentials.

| Variable | `gvf-public` | `gvf-admin` | `gvf-api` | Notes |
|---|---:|---:|---:|---|
| `GVF_DEPLOYMENT_SURFACE` | `public` | `admin` | `api` | Non-secret route boundary selector. |
| `DATABASE_URL` | Required | Required | Required | Use the production MySQL/TiDB URL reachable from Vercel, with TLS options required by the provider. |
| `JWT_SECRET` | Required | Required | Required | Use one strong, shared production value so server-side session validation remains consistent. |
| `OAUTH_SERVER_URL` | Required | Required | Required | Must be the production OAuth service base URL. |
| `VITE_APP_ID` | Required | Required | Required | The managed OAuth application identifier. |
| `VITE_OAUTH_PORTAL_URL` | Required | Required | Required | Managed OAuth portal base URL. |
| `OWNER_OPEN_ID` | Required | Required | Required | Existing administrator OpenID; do not change it casually. |
| `NEXT_PUBLIC_PUBLIC_SITE_URL` | Public URL | Public URL | Optional | Set to the canonical `gvf-public` URL; used for public return links from the admin workspace. |
| `GVF_API_ORIGIN` | Required | Required | Not set | The HTTPS origin of `gvf-api`, for example `https://gvf-api.vercel.app`. It is read only by middleware and is never sent to browser JavaScript. |
| `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` | Only if a deployed route uses Forge | Only if a deployed route uses Forge | Only if a deployed route uses Forge | These Manus-provided values are not automatically available in Vercel. Do not add them unless the affected feature is separately approved. |

The current production deployment must retain all existing feature-gate values and must not add Razorpay production keys. Payments, receipts, community features, voter-document review, and voting remain fail-closed after deployment.

## Deployment sequence

1. Create the three Git-linked Vercel projects in the configured `sainisuns-projects` team, all linked to `sainisun/gram-vikash-foundation` with repository root as the root directory. Git-linked projects create deployment previews from the selected production branch. [1]
2. Set the per-project environment values above in Vercel, then trigger a new deployment from the same reviewed `main` commit. A secret change requires a redeployment before it becomes available to the server runtime. [2]
3. Confirm the three generated `vercel.app` URLs. Do not point a custom domain or DNS record at them until production-route, login, and gate checks have passed.
4. Validate the public URL’s homepage, published program pages, and ledger; validate the admin URL’s sign-in recovery and admin guard; validate the API URL’s public API responses and that a page route returns `404`. Confirm requests to `https://gvf-public.vercel.app/api/summary` and `https://gvf-admin.vercel.app/api/admin/readiness` are served through the configured backend, not from local frontend handlers.
5. Keep Vercel Authentication disabled only for the public project. The application’s own Member/admin authorization remains required. If Vercel deployment protection is added to the admin project, record the named owner and recovery process in the A2 evidence pack.

## Rollback

If a split-surface deployment behaves unexpectedly, rollback the affected Vercel project to its prior successful deployment. The repository remains the source of truth. Do not activate a payment, community, identity-review, or voting flag as a deployment workaround.

## References

[1]: https://vercel.com/docs/git "Vercel Git integration documentation"
[2]: https://vercel.com/docs/environment-variables "Vercel environment variables documentation"
