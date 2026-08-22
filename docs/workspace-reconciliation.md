# Workspace Reconciliation

**Status:** Active implementation baseline  
**Applies to:** Phase A implementation workspace  
**Precedence:** This document overrides framework, database-engine, authentication, deployment, and endpoint-shape assumptions in earlier planning documents where they conflict.

> The approved product rules remain unchanged: every donation is linked internally to a registered Member, public anonymity affects display only, financial totals are derived from source records, live payments remain disabled until approval, and community/voter features remain disabled until their gates are satisfied. [1]

## 1. Adopted implementation baseline

The initialized workspace is a React 19 and Vite frontend with Tailwind CSS, an Express server, tRPC 11 procedures, Drizzle ORM, and managed MySQL/TiDB. Authentication is supplied through the managed Manus OAuth flow already included in the workspace. This is the implementation baseline for Phase A; the earlier Next.js, PostgreSQL, password, NextAuth/Supabase Auth, Vercel, and REST route-handler examples are not the runtime architecture for this build.

| Concern | Earlier planning assumption | Adopted Phase A implementation baseline | Required implementation rule |
|---|---|---|---|
| Frontend | Next.js/App Router | React 19, Vite, Wouter, Tailwind CSS | Page components live in `client/src/pages/`; routes are registered in `client/src/App.tsx`. |
| Backend | Next.js route handlers/REST | Express 4 plus tRPC 11 | Procedures belong in `server/routers.ts` or feature router modules; frontend calls `trpc.*` hooks. |
| Database | PostgreSQL | Managed MySQL/TiDB with Drizzle | `drizzle/schema.ts` and applied migrations are authoritative for the runtime schema. |
| Identity | Password baseline / NextAuth / Supabase Auth | Managed Manus OAuth | Do not implement custom password storage. A future password flow requires an approved identity-provider and security design. |
| Storage | Supabase/R2 examples | Workspace S3 storage helpers | Store only S3 object references in the database; never store file bytes in database columns. |
| Hosting | Vercel | Managed WebDev Autoscale hosting | Use the managed server and database; do not rely on an always-on worker in Phase A. |
| API contract form | REST-like route examples | Typed tRPC procedures | Preserve the authorization, data-projection, validation, status/error semantics as logical contracts, expressed as typed procedures. |

## 2. Documentation adaptation rules

The PRD remains the product source of truth. The `database-schema.md` PostgreSQL DDL is a relational design reference only; the TypeScript Drizzle schema and migration files are the executable schema. UUID-specific or PostgreSQL-specific examples should be translated to the initialized MySQL/TiDB and Drizzle conventions without weakening unique constraints, foreign keys, indexes, financial amount checks, or the one-vote-per-Member invariant.

The REST paths in `api-contracts.md` are domain-contract names. Phase A implements their equivalent tRPC procedures under a domain router. For example, the public financial summary becomes a `publicTransparency.summary` query; admin offline donation entry becomes an authenticated `admin.recordOfflineDonation` mutation; and profile settings become a protected `member.updateProfile` mutation. Procedures must apply Zod validation, derive identity from `ctx.user`, and never accept a browser-supplied financial owner, administrative actor, role, or verification tier.

The prior folder-structure document describes the original Next.js target. For this workspace, use the template’s actual structure: `client/src/pages/` for pages, `client/src/components/` for reusable UI, `client/src/App.tsx` for Wouter routes, `drizzle/schema.ts` for tables, `server/db.ts` for database helpers, `server/routers.ts` for tRPC procedures, `storage/` and `server/storage.ts` for object storage, and `server/*.test.ts` for Vitest coverage.

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
