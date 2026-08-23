# Authoritative File-Level Structure

> **This document supersedes every earlier folder-structure draft as of 23 August 2026. There is no `(donor)` route group. Donation and community access share one `(member)` route group because both require the same single Member account, per the PRD. Registration is mandatory before donation; anonymity controls public display only, never the internal Member or financial record.** [1]

This is the final architectural map for the Next.js App Router implementation. The correction removes the invalid split between separate donor and community identities. All new work must follow this guide; compatibility aliases may be temporary, but must share the same server-side authorization and service boundaries.

**Next.js URL-prefix rule:** route-group names in parentheses are not emitted in URLs. Where a public and protected page would otherwise collide (for example, public `/dashboard` and administration), the active implementation nests protected administration below `app/(admin)/admin/` so the runtime URL is `/admin/...`. This is an intentional compatibility prefix, not a separate application or an authorization exception.

```text
gram-vikash-foundation/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   ├── programs/page.tsx
│   │   ├── programs/[slug]/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── ledger/donations/page.tsx
│   │   ├── ledger/expenses/page.tsx
│   │   ├── donor-wall/page.tsx
│   │   ├── about/page.tsx
│   │   ├── register/page.tsx
│   │   └── login/page.tsx
│   │
│   ├── (member)/
│   │   ├── layout.tsx
│   │   ├── donate/page.tsx
│   │   ├── my-donations/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── profile/verify-voter/page.tsx
│   │   ├── feed/page.tsx
│   │   ├── chat/[channel_id]/page.tsx
│   │   ├── voting/page.tsx
│   │   ├── voting/[issue_id]/page.tsx
│   │   └── voting/proposals/page.tsx
│   │
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── expenses/new/page.tsx
│   │   ├── donations/offline/page.tsx
│   │   ├── programs/[id]/edit/page.tsx
│   │   ├── members/voter-verification/page.tsx
│   │   ├── moderation/queue/page.tsx
│   │   ├── moderation/reports/page.tsx
│   │   ├── voting/issues/new/page.tsx
│   │   └── audit-log/page.tsx
│   │
│   └── api/
│       ├── members/route.ts
│       ├── members/me/route.ts
│       ├── members/me/voter-verification-document/route.ts
│       ├── donations/checkout/route.ts
│       ├── donations/confirm/route.ts
│       ├── donations/webhook/route.ts
│       ├── donations/[id]/status/route.ts
│       ├── donations/[id]/receipt/route.ts
│       ├── summary/route.ts
│       ├── ledger/donations/route.ts
│       ├── ledger/expenses/route.ts
│       ├── donor-wall/route.ts
│       ├── programs/route.ts
│       ├── programs/[slug]/route.ts
│       ├── community/posts/route.ts
│       ├── community/posts/[id]/comments/route.ts
│       ├── community/reports/route.ts
│       ├── community/chat/channels/[id]/messages/route.ts
│       ├── voting/issues/route.ts
│       ├── voting/issues/[id]/results/route.ts
│       ├── voting/issues/[id]/votes/route.ts
│       ├── voting/proposals/route.ts
│       ├── voting/proposals/[id]/upvote/route.ts
│       └── admin/
│           ├── expenses/route.ts
│           ├── donations/offline/route.ts
│           ├── programs/[id]/route.ts
│           ├── members/[id]/voter-verification/route.ts
│           ├── moderation/queue/route.ts
│           ├── moderation/[type]/[id]/route.ts
│           ├── audit-log/route.ts
│           ├── export/ledger/route.ts
│           └── uploads/presign/route.ts
│
├── components/
│   ├── ui/
│   ├── ledger/
│   ├── community/
│   └── voting/
│
├── lib/
│   ├── auth/
│   │   ├── session.ts
│   │   ├── requireMember.ts
│   │   ├── requireVerifiedVoter.ts
│   │   └── requireAdmin.ts
│   ├── db/
│   │   ├── schema.ts
│   │   └── queries/
│   ├── razorpay/
│   │   ├── client.ts
│   │   └── verifyWebhookSignature.ts
│   ├── moderation/
│   │   ├── uploadScan.ts
│   │   └── quarantine.ts
│   └── validation/
│       ├── donations.ts
│       ├── members.ts
│       └── voting.ts
│
├── prisma/ (or drizzle/)
│   ├── schema.prisma
│   └── migrations/
│
├── middleware.ts
├── .env.example
└── AGENTS.md
```

## Why the groups are separate

| Location | Reason and boundary |
|---|---|
| `app/(public)` | Contains only pages accessible without a session. Public data is a privacy-filtered projection, not a direct database record. |
| `app/(member)` | Contains all authenticated Member journeys: donation, own records, profile, community participation, and voting. One person has one Member account across all of these journeys. |
| `app/(admin)` | Isolates staff operations such as financial entry, publication, verification, moderation, exports, and audit review. Consequential mutations create audit evidence. |
| `app/api` | Contains server-side validation, identity derivation, authorization, and domain calls. Client Components must never access private tables, payment secrets, or restricted identity documents directly. |
| `components/` | Holds reusable presentation. Generic primitives belong in `components/ui/`; domain UI belongs in `ledger/`, `community/`, or `voting/`, never duplicated across route groups. |
| `lib/` | Holds server-side policy: authentication, database queries, payment integration, moderation, and validation. Route handlers remain thin orchestration layers. |
| `drizzle/` or `prisma/` | Holds the selected schema and migrations. Use one production ORM only; the active project uses Drizzle/MySQL. |

## API route contract map

The following map is normative and cross-references the exact method and authorization level in `api-contracts.md`. [2]

| Route file | Method(s) | Authorization |
|---|---|---|
| `members/route.ts` | `POST` | Public registration |
| `members/me/route.ts` | `GET` | Registered Member |
| `members/me/voter-verification-document/route.ts` | `POST` | Registered Member |
| `donations/checkout/route.ts` | `POST` | Registered Member |
| `donations/confirm/route.ts` | `POST` | Member session; own donation |
| `donations/webhook/route.ts` | `POST` | Razorpay provider; raw-body signature check |
| `donations/[id]/status/route.ts` | `GET` | Own registered Member record or admin |
| `donations/[id]/receipt/route.ts` | `GET` | Own registered Member receipt or admin |
| `summary/route.ts` | `GET` | Public |
| `ledger/donations/route.ts` | `GET` | Public |
| `ledger/expenses/route.ts` | `GET` | Public |
| `donor-wall/route.ts` | `GET` | Public |
| `programs/route.ts`, `programs/[slug]/route.ts` | `GET` | Public |
| `community/posts/route.ts` | `GET`, `POST` | Public read; Registered Member create |
| `community/posts/[id]/comments/route.ts` | `GET`, `POST` | Public read; Registered Member create |
| `community/reports/route.ts` | `POST` | Registered Member |
| `community/chat/channels/[id]/messages/route.ts` | `GET`, `POST` | Registered Member |
| `voting/issues/route.ts` | `GET` | Public |
| `voting/issues/[id]/results/route.ts` | `GET` | Public |
| `voting/issues/[id]/votes/route.ts` | `POST` | Verified Voter |
| `voting/proposals/route.ts` | `GET`, `POST` | Public/Registered Member read; Registered Member create |
| `voting/proposals/[id]/upvote/route.ts` | `POST` | Registered Member |
| `admin/expenses/route.ts` | `POST` | Admin |
| `admin/donations/offline/route.ts` | `POST` | Admin |
| `admin/programs/[id]/route.ts` | `PATCH` | Admin |
| `admin/members/[id]/voter-verification/route.ts` | `PATCH` | Admin with voter-verification permission |
| `admin/moderation/queue/route.ts` | `GET` | Admin |
| `admin/moderation/[type]/[id]/route.ts` | `PATCH` | Admin |
| `admin/audit-log/route.ts` | `GET` | Admin |
| `admin/export/ledger/route.ts` | `GET` | Admin |
| `admin/uploads/presign/route.ts` | `POST` | Admin or Registered Member, purpose-constrained |

Payment, community, voter-document, and voting handlers may exist before launch, but they remain server-gated until their documented legal, financial, moderation, safeguarding, and approval conditions are complete. A disabled gate must never return a mock payment success, store a government ID, publish community content, or record a vote. [1] [2]

## Mandatory authorization pattern

`middleware.ts` is the **first line of defence**: it matches protected route groups and redirects or rejects missing sessions. It is not the only control. Every protected page, server action, and API handler must repeat the appropriate server-side helper as defence in depth.

| Helper | Precise responsibility |
|---|---|
| `requireMember()` | Requires an authenticated, active, registered Member. Use for donate, post, comment, report, chat, profile, and own donation-record routes. |
| `requireVerifiedVoter()` | Calls `requireMember()` and then checks `verification_tier = 'voter_verified'` on the server. It never trusts a browser-supplied tier. Use for ballots and voter-only actions. |
| `requireAdmin()` | Requires a role-checked administrative session. Use for routine finance, content, audit, moderation, and verification operations. |
| `requireSuperAdmin()` | Requires elevated authorization for destructive, role-changing, or configuration-changing operations. |

Every helper belongs in `lib/auth/`. No route may hand-roll cookie parsing, Member lookup, role comparison, or verification-tier checks.

## Managed-secret exception

The architectural tree includes `.env.example` for a portable self-hosted repository. In the managed application workspace, environment files are intentionally not created or committed. Payment and application secrets are requested and managed through the platform’s secure secret configuration, and no `.env` or `.env.example` file may contain credentials.

## Adding a feature

| New work | Required locations |
|---|---|
| Public feature | `app/(public)/feature-name/` and a privacy-safe `app/api/feature-name/route.ts` when data is needed. |
| Member feature | `app/(member)/feature-name/`, its `app/api/.../route.ts`, `lib/validation/feature-name.ts`, and `requireMember()` at each protected boundary. |
| Admin feature | `app/(admin)/feature-name/`, `app/api/admin/feature-name/route.ts`, `lib/validation/feature-name.ts`, `requireAdmin()`, and audit logging for consequential mutations. |
| Community feature | `app/(member)/feature-name/` and `app/api/community/feature-name/route.ts`; retain feature flag, moderation, and safeguarding gates. |
| Voting feature | `app/(member)/voting/feature-name/` and `app/api/voting/feature-name/route.ts`; require `requireVerifiedVoter()` for ballots and return aggregate-only public results. |
| Shared UI | `components/ui/` for generic primitives, otherwise the appropriate domain folder; never copy the component into multiple route groups. |

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: api-contracts.md "Gram Vikash Foundation API Contracts"
