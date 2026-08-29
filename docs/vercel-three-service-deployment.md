# Vercel Three-Service Deployment

## Purpose

This runbook deploys the same audited Next.js repository into three Git-linked Vercel projects with distinct, host-aware service boundaries. The split gives the public website, the protected administrative workspace, and the API service their own Vercel URLs while preserving the existing Phase A security gates.

> This is a **service-surface separation**. The current Phase A application contains server-rendered pages that directly call the Supabase PostgreSQL data helpers. Until a later, separately reviewed BFF extraction is completed, the public and admin projects still require the private database connection at server runtime. No database value is exposed to the browser.

| Vercel project | Required `GVF_DEPLOYMENT_SURFACE` | Intended surface | Suggested initial URL |
|---|---|---|---|
| `gvf-public` | `public` | Public website, Member registration and account journeys, with API requests rewritten to `gvf-api` | `gvf-public.vercel.app` |
| `gvf-admin` | `admin` | Administrative workspace, with administrative API requests rewritten to `gvf-api` | `gvf-admin.vercel.app` |
| `gvf-api` | `api` | API routes only; page routes return `404` | `gvf-api.vercel.app` |

The middleware reads `GVF_DEPLOYMENT_SURFACE` on each request. A missing or invalid value resolves to `all`, which preserves local development behavior. Production Vercel projects must set one of the three explicit values above.

## Version-controlled configuration

The root [`vercel.json`](../vercel.json) keeps Git deployments deterministic by requiring a frozen pnpm lockfile and the existing production build command. Vercel links every project to `sainisun/gram-vikash-foundation`, uses its dedicated monorepo root (`apps/public`, `apps/admin`, or `apps/api`), and deploys from `main`.
 Vercel's Git-linked project model supports distinct projects from the same repository; each project owns its own environment values and deployment URL. [1]

## Project records

| Service | Vercel project | Project ID | Initial Vercel URL | Status |
|---|---|---|---|---|
| Public website | `gvf-public` | `prj_2a53Hql5512nknQsbmCqTGx366Ha` | `https://gvf-public.vercel.app` | Git-linked to `main`; no production deployment created yet. |
| Admin panel | `gvf-admin` | Pending | Pending | Must be created with a distinct project configuration/root from the public service. |
| Backend API | `gvf-api` | Pending | Pending | Must be created with a distinct project configuration/root from the public service. |

The configured Vercel integration did not create a second same-root Git project: the `gvf-admin` creation request reused `gvf-public`. Do not treat that reused response as an admin project. The monorepo now provides distinct root-directory configurations, so create the two remaining projects through the authenticated Vercel dashboard with `apps/admin` and `apps/api` selected as their roots, then enter their generated URLs in the environment values below.

The authenticated Vercel dashboard was checked after project creation. It shows `gvf-public` at `https://gvf-public.vercel.app`; its Git-linked preview is now buildable from the reviewed source. The public project still requires its production environment values before it can serve the configured Supabase-backed runtime.
 The subsequent browser import view did not persist, so no administrator or API project creation was confirmed from that attempt.

The authenticated direct repository import path is `https://vercel.com/new/import?hasTrialAvailable=1&id=1342992699&import-source=import-suggestions&name=gram-vikash-foundation&owner=sainisun&provider=github&s=https%3A%2F%2Fgithub.com%2Fsainisun%2Fgram-vikash-foundation`. It should be used rather than a template card if the import list’s dynamic element ordering makes the repository action ambiguous.

The public and admin projects are intentionally separated at the route boundary. The public project returns `404` for `/admin` and `/api/admin/*`. The admin project returns `404` for public and Member pages, while allowing `/admin`, `/api/admin/*`, `/access-required`, and only the authentication endpoints it needs. The API project returns `404` for every non-`/api` path. On the public and admin hosts, non-authentication `/api/*` traffic is internally rewritten to the configured API service URL; direct API handlers do not run on either frontend host. If the backend origin is absent or malformed, frontend API traffic returns `503` rather than falling back to a local handler.

Supabase Magic Link confirmation runs on the host that requested the link, so an admin-host request returns to `/admin` and a public-host request returns to `/my-donations`. The backend verifies API requests using the forwarded host cookie. Supabase Auth user IDs are stored in the unified `users.openId` field; `GVF_ADMIN_EMAILS` is the server-side allowlist used to assign the existing admin role after verified sign-in. The legacy Manus OAuth endpoints remain only as compatibility routes and are not used by the public login or registration UI.

## Production environment values

Set the following in **each Vercel project** for both `Production` and `Preview`, unless the table says otherwise. Enter secret values only in Vercel's encrypted environment-variable panel. Do not commit `.env` files, reveal values in chat, or reuse development-only credentials.

| Variable | `gvf-public` | `gvf-admin` | `gvf-api` | Notes |
|---|---:|---:|---:|---|
| `GVF_DEPLOYMENT_SURFACE` | `public` | `admin` | `api` | Non-secret route boundary selector. |
| `DATABASE_URL` | Required | Required | Required | Use Supabase’s private PostgreSQL pooled connection URI, including the provider’s required TLS setting. Do not use a browser/anon key as a database URL. |
| `SUPABASE_URL` | Required | Required | Required | Dedicated Supabase project URL for server-side Magic Link request and confirmation handling. |
| `SUPABASE_KEY` | Required | Required | Required | Supabase publishable/anon key for server-side Auth calls. Never use a secret/service-role key in browser-exposed configuration. |
| `GVF_ADMIN_EMAILS` | Required | Required | Required | Comma-separated verified administrator email allowlist. The first admin must sign in with one of these addresses. |
| `JWT_SECRET` | Optional legacy | Optional legacy | Optional legacy | Retain only if an explicitly used legacy route requires it; Supabase Auth is the production session authority. |
| `OAUTH_SERVER_URL`, `VITE_APP_ID`, and `VITE_OAUTH_PORTAL_URL` | Optional legacy | Optional legacy | Optional legacy | Required only if the legacy Manus OAuth compatibility routes are intentionally retained; the Supabase Magic Link UI does not use them. |
| `OWNER_OPEN_ID` | Optional legacy | Optional legacy | Optional legacy | Retained only for legacy managed-auth compatibility; administrator role assignment uses `GVF_ADMIN_EMAILS`. |
| `NEXT_PUBLIC_PUBLIC_SITE_URL` | Public URL | Public URL | Optional | Set to the canonical `gvf-public` URL; used for public return links from the admin workspace. |
| `GVF_API_ORIGIN` | Required | Required | Not set | The HTTPS origin of `gvf-api`, for example `https://gvf-api.vercel.app`. It is read only by middleware and is never sent to browser JavaScript. |
| `BUILT_IN_FORGE_API_URL` and `BUILT_IN_FORGE_API_KEY` | Only if a deployed route uses Forge | Only if a deployed route uses Forge | Only if a deployed route uses Forge | These Manus-provided values are not automatically available in Vercel. Do not add them unless the affected feature is separately approved. |

The current production deployment must retain all existing feature-gate values and must not add Razorpay production keys. Payments, receipts, community features, voter-document review, and voting remain fail-closed after deployment.

## Deployment sequence

1. Create the three Git-linked Vercel projects in the configured `sainisuns-projects` team, all linked to `sainisun/gram-vikash-foundation` with roots `apps/public`, `apps/admin`, and `apps/api`. Git-linked projects create deployment previews from the selected production branch. [1]
2. Set the per-project environment values above in Vercel, then trigger a new deployment from the same reviewed `main` commit. A secret change requires a redeployment before it becomes available to the server runtime. [2]
3. Confirm the three generated `vercel.app` URLs. Do not point a custom domain or DNS record at them until production-route, login, and gate checks have passed.
4. Validate the public URL’s homepage, published program pages, ledger, and Magic Link request form; validate the admin URL’s Magic Link return path and admin guard; validate the API URL’s public API responses and that a page route returns `404`. Confirm requests to `https://gvf-public.vercel.app/api/summary` and `https://gvf-admin.vercel.app/api/admin/readiness` are served through the configured backend, not from local frontend handlers.
5. Keep Vercel Authentication disabled only for the public project. The application’s own Member/admin authorization remains required. If Vercel deployment protection is added to the admin project, record the named owner and recovery process in the A2 evidence pack.

## Current database target

The dedicated Supabase PostgreSQL project is `bnntnowpookwwvggpkkv` in the Mumbai region. Its schema, Row Level Security posture, and approved Phase A records have been migrated. Obtain the corresponding pooled PostgreSQL connection URI from Supabase’s **Connect** panel and add it only through Vercel’s encrypted environment-variable UI. Configure the Supabase Auth email template to send `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`, and add each public and admin Vercel URL to Supabase Auth’s Site URL/Redirect URLs before testing Magic Links.

## Browser setup note

The authenticated Vercel import screen can reset during dynamic navigation. When that occurs, reopen `https://vercel.com/new`, select **Import** next to `sainisun/gram-vikash-foundation`, and continue from the project configuration form. Do not deploy a frontend surface until its required non-secret boundary values and secure runtime values are configured.

## Rollback

If a split-surface deployment behaves unexpectedly, rollback the affected Vercel project to its prior successful deployment. The repository remains the source of truth. Do not activate a payment, community, identity-review, or voting flag as a deployment workaround.

## References

[1]: https://vercel.com/docs/git "Vercel Git integration documentation"
[2]: https://vercel.com/docs/environment-variables "Vercel environment variables documentation"
