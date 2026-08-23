# Workspace Reconciliation

**Status:** Active Next.js App Router runtime baseline
**Applies to:** Phase A implementation workspace  
**Precedence:** This document overrides framework, database-engine, authentication, deployment, and endpoint-shape assumptions in earlier planning documents where they conflict.

> The approved product rules remain unchanged: every donation is linked internally to a registered Member, public anonymity affects display only, financial totals are derived from source records, live payments remain disabled until approval, and community/voter features remain disabled until their gates are satisfied. [1]

## 1. Adopted implementation baseline

The active workspace is a Next.js 15 App Router application using React 19, TypeScript, Tailwind-style global CSS, Drizzle ORM, managed MySQL/TiDB, and managed OAuth. Server-side database and authorization services back the `app/api` route handlers. This is the implementation baseline for Phase A; earlier React/Vite, Express/tRPC, PostgreSQL, password, NextAuth/Supabase Auth, Vercel, and custom-auth examples are not the runtime architecture for this build.

| Concern | Earlier planning assumption | Adopted Phase A implementation baseline | Required implementation rule |
|---|---|---|---|
| Frontend | React/Vite/Wouter examples | Next.js 15 App Router, React 19, Tailwind-style global CSS | Page components live in the authoritative `app/(public)`, `app/(member)`, and `app/(admin)` groups. |
| Backend | Express/tRPC examples | Next.js route handlers plus server-only services | Handlers belong in `app/api/**/route.ts`; they call server-only database and authorization helpers. |
| Database | PostgreSQL | Managed MySQL/TiDB with Drizzle | `drizzle/schema.ts` and applied migrations are authoritative for the runtime schema. |
| Identity | Password baseline / NextAuth / Supabase Auth | Managed Manus OAuth | Do not implement custom password storage. A future password flow requires an approved identity-provider and security design. |
| Storage | Supabase/R2 examples | Workspace S3 storage helpers | Store only S3 object references in the database; never store file bytes in database columns. |
| Hosting | Vercel | Managed WebDev Autoscale hosting | Use the managed server and database; do not rely on an always-on worker in Phase A. |
| API contract form | tRPC examples | JSON-over-HTTP Next route handlers | Preserve the authorization, data-projection, validation, status/error semantics as logical contracts, expressed as route handlers. |

## 2. Documentation adaptation rules

The PRD remains the product source of truth. The `database-schema.md` PostgreSQL DDL is a relational design reference only; the TypeScript Drizzle schema and migration files are the executable schema. UUID-specific or PostgreSQL-specific examples must be translated to the initialized MySQL/TiDB and Drizzle conventions without weakening unique constraints, foreign keys, indexes, financial amount checks, or the one-vote-per-Member invariant.

The REST paths in `api-contracts.md` are domain-contract names. Phase A implements their route-handler equivalents under `app/api`. For example, the public financial summary is available through `/api/summary`; offline donation entry is restricted to `/api/admin/donations/offline`; and Member profile operations are restricted to `/api/member/profile`. Handlers must validate inputs, derive identity from the managed session, and never accept a browser-supplied financial owner, administrative actor, role, or verification tier.

The authoritative folder-structure document describes the current Next.js implementation. Use `app/(public)`, `app/(member)`, and `app/(admin)` for pages; `app/api` for route handlers; `components/` for reusable presentation; `lib/auth/` for session and authorization helpers; `drizzle/schema.ts` for tables; `server/db.ts` for database services; and `server/*.test.ts` for Vitest coverage. Legacy directories may remain in the repository for compatibility or history, but they are not the active request runtime.

## 3. Phase A implementation scope

| Area | Implement now | Explicitly deferred or feature-gated |
|---|---|---|
| Financial records | Member profile, program, donation, expense, audit event, derived public totals, opt-in public-display projection | Refund/reversal workflows beyond documented controlled status support |
| Member access | Managed-auth sign-in, Member profile completion, village/ward, public-display control | Custom password credentials, self-service voter identity verification |
| Public experience | Homepage, program pages, summary, public ledgers, donor wall | Public community feed, chat, private messaging |
| Admin operations | Admin-restricted offline donation and expense creation, audit trail, ledger review | Advanced role management beyond template `user`/`admin` until a formal role design is approved |
| Payments | Feature configuration status, test-mode readiness checks, disabled checkout state | Live Razorpay order creation, webhook activation, reconciliation writes, receipt email delivery |
| Governance | Disabled feature flags and explanatory UI states | Voter-document upload/review, proposal creation, voting, result publication |

## 4. Production payment and authentication prerequisites

Live payment activation is a blocked production action, not a code-completion milestone. The following requirements must be verified and recorded before the live-payment flag can be enabled.

| Prerequisite | Required evidence | Owner | Current rule |
|---|---|---|---|
| Registered legal entity and merchant onboarding | Approved Razorpay merchant account associated with the foundation’s verified legal identity | Founder and finance owner | Required before live payments |
| Payment credentials | Server-side Razorpay key ID, key secret, and webhook secret provided through managed secrets | Founder/authorized payments owner | Required; never commit or expose to the browser |
| Webhook endpoint and event policy | Test-mode signature validation, idempotency tests, duplicate/out-of-order handling, and reconciliation procedure | Technical owner | Required before accepting live webhooks |
| Financial approval | Named accounting owner, receipt wording, ledger review process, and written approval for production money movement | Founder and finance owner | Required before live payments |
| Public disclosures | Approved privacy, terms, refund/cancellation, contact, and grievance content appropriate to the operating entity | Founder with qualified review | Required before live payments |
| Authentication controls | Managed OAuth sign-in verified in production, authorization tests passed, admin assignments reviewed | Technical owner and founder | Required before financial/admin access |
| Legal boundaries | Confirmed domestic-donation policy; FCRA/foreign-payment paths remain disabled unless separately approved | Founder with qualified review | Required before public launch |

## 5. Feature flags and hard gates

The runtime must expose a server-controlled feature-flag record for `payments_live`, `community_enabled`, `voter_document_review_enabled`, and `voting_enabled`. All flags default to `false`. A disabled flag returns an explicit safe application error and a user-facing “not available yet” state; it must not be bypassable through a hidden procedure or client-side condition.

`payments_live` can become true only after every prerequisite in §4 is reviewed. `community_enabled`, `voter_document_review_enabled`, and `voting_enabled` remain false until the donation platform is operational, assigned moderation and Grievance Officer roles are documented, privacy/retention procedures are approved, and the relevant human review gates in the PRD are completed. [1]

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
