# AGENTS.md

## Project overview

Gram Vikash Foundation is a village-run charitable platform for free coaching, a community library, and kanyadan financial support. Its first module is a mobile-first donation and transparency site where every successful donation and recorded expense is traceable through a public ledger. A later module may add community posting, public group chat, moderation, and verified-member voting. The project is designed for local beneficiaries, local and diaspora donors, a small trusted admin team, and public trust verification. Read [`PRD.md`](PRD.md) as the product source of truth. [1]

## Start here

Before changing code, read these documents in order:

1. [`PRD.md`](PRD.md) — requirements, privacy boundaries, open decisions, and rollout scope.
2. [`docs/architecture-design.md`](docs/architecture-design.md) — system boundaries and critical flows.
3. [`docs/design-system.md`](docs/design-system.md) — visual tokens, component states, responsive behavior, and accessibility.
4. [`docs/system-design.md`](docs/system-design.md) — transactions, caching, reconciliation, moderation, and recovery.
5. [`docs/database-schema.md`](docs/database-schema.md) — PostgreSQL DDL, constraints, indexes, and data sensitivity.
6. [`docs/api-contracts.md`](docs/api-contracts.md) — request/response and authorization contracts.

The remaining documents define delivery, privacy operations, moderation, testing, and deployment. If a requirement conflicts with an implementation shortcut, stop and flag it in the pull request rather than guessing.

## Tech stack summary

| Layer | Baseline |
|---|---|
| Frontend | Next.js/React with Tailwind CSS; mobile-first, SSR-friendly public pages |
| Backend | Next.js route handlers or a lightweight Node service layer |
| Database | Managed PostgreSQL through Supabase, Neon, or equivalent |
| Payments | Razorpay Checkout, Orders, server-side verification, and webhooks |
| Storage | Supabase Storage or Cloudflare R2 with private objects and controlled URLs |
| Auth | NextAuth.js or Supabase Auth; application-level role/verification checks |
| Email | Resend or SendGrid for receipts and operational notifications |
| Hosting | Vercel plus managed PostgreSQL |
| Monitoring | Vercel Analytics/Sentry plus application audit logs |
| Realtime | Phase 1 polling; optional Supabase Realtime/Firebase for Phase 2 chat |

Do not introduce a new infrastructure service merely to solve a local code organization problem. The expected initial usage is village-scale; favor auditable, recoverable components. [1]

## Folder and file structure

Use a domain-oriented structure. The exact framework layout may vary, but new code should have an obvious home.

```text
/
├── AGENTS.md
├── PRD.md
├── README.md
├── docs/
├── app/                         # Next.js routes and pages
│   ├── (public)/
│   ├── admin/
│   ├── community/
│   └── api/
├── components/
│   ├── ui/                      # design-system primitives
│   ├── ledger/                  # public financial views
│   ├── programs/
│   ├── donation/
│   ├── community/
│   └── moderation/
├── lib/
│   ├── validation/
│   ├── formatting/
│   ├── auth/
│   └── errors/
├── server/
│   ├── db/
│   ├── services/
│   │   ├── donations/
│   │   ├── expenses/
│   │   ├── voting/
│   │   └── moderation/
│   ├── payments/
│   ├── receipts/
│   └── audit/
├── db/                          # migrations and seed data
├── public/                      # non-sensitive static assets only
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── scripts/
```

Server-only code must not be imported into browser components. Payment credentials, webhook secrets, database credentials, private storage keys, and moderation evidence must never enter `public/`, client bundles, logs, or API responses intended for public users.

## Coding conventions

Use TypeScript in strict mode. Prefer small pure functions for money formatting, validation, summary calculation, and vote-result aggregation. Use domain names consistently: `amount_paise` in persistence/API boundaries, `amountPaise` in TypeScript variables where project conventions require camelCase, and `₹` formatting only in a presentation function. Use `BIGINT`/safe integer handling in server code and never use floating-point arithmetic for financial values.

Use schema validation at every API boundary. Authorization is enforced in server services, not only by hiding buttons in the UI. Derive the current admin or community member from the authenticated session; never trust a browser-supplied `admin_id`, `member_id`, role, verification status, or vote owner.

Build UI from tokens in [`docs/design-system.md`](docs/design-system.md). Do not add ad-hoc hex colors, arbitrary spacing, or a one-off typography family. Every interactive component needs keyboard behavior, a visible focus state, an accessible name, loading/error/empty states, and a mobile layout. Color may support meaning but must never be the only carrier of donation, expense, success, failure, or moderation status.

Use UTC timestamps internally and ISO-8601 at API boundaries. Use deterministic pagination ordering `(created_at, id)` for ledgers and feeds. Return stable machine-readable error codes and safe user-facing messages. Log a request ID, not secrets or complete PII payloads.

## Non-negotiable project rules

1. **Never hardcode or cache donation/expense totals as the source of truth.** Compute totals from the donation and expense tables. Any cache is an explicitly invalidatable performance layer and must never be a mutable counter. [1]
2. **Never expose a minor’s identifying information in a public query or component.** Do not combine a child’s full name, identifiable photo, and family financial detail. Prefer aggregate numbers and consent-reviewed group/classroom imagery. Kanyadan case entries default to anonymized. [1]
3. **Never bypass the `Vote` unique constraint.** `UNIQUE (issue_id, member_id)` is the final one-member-one-vote guarantee. Pre-checks are for friendly errors only; concurrent inserts must still rely on the database constraint. [1]
4. **Handle all internal money in paise.** Use integer amounts internally and format into rupees at the display layer only.
5. **Treat payment webhooks as security-sensitive.** Verify the raw-body signature, handle duplicate/out-of-order events idempotently, and do not mark a donation successful from an unverified browser-only signal.
6. **Keep financial history auditable.** Do not silently delete or rewrite donations, expenses, receipts, or audit logs. Use compensating entries, controlled status transitions, and an explanation.
7. **Quarantine community media.** Validate type and size, scan for malware, and apply moderation before exposing public URLs. A published item later removed must be soft-removed with actor, reason, and timestamp.
8. **Do not expand scope silently.** FCRA/foreign payments, native mobile apps, online kanyadan applications, Aadhaar/e-KYC, private direct messages, and full realtime dashboard updates require explicit approval and may be out of the current phase. [1]

## Before opening a pull request

Run the formatter, linter, type checker, unit tests, integration tests, and relevant end-to-end tests. Add tests for new validation and authorization branches. Review all UI changes against the design-system tokens, check mobile viewport behavior below and above the 760px breakpoint, test a slow 4G-like network, and verify that Devanagari text remains legible.

For every data or API change, review the public projection for accidental PII exposure, verify indexes and migration rollback behavior, and check that audit events are emitted for privileged mutations. For every payment change, test duplicate and out-of-order webhooks with an isolated Razorpay test-mode setup. For every voting change, test concurrent double-vote attempts and confirm the database constraint rejects the second insert.

The pull request description should state the problem, affected module/phase, migration impact, security/privacy impact, tests run, and any open decision that still needs human input.

## Human sign-off gates

Sunil or the designated architect must approve before merging any change that touches payment order creation, checkout confirmation, webhook signature verification, donation status transitions, ledger summary logic, receipt generation, or reconciliation. The same approval is required for vote eligibility, issue activation, ballot insertion/counting, poll-to-official-vote rules, media publication/removal, child-safety behavior, retention/deletion policy, or grievance handling.

Do not merge a “temporary” bypass around a money, vote, or minors-data rule. If a provider or test environment prevents progress, isolate the adapter, use a fixture, or flag the blocker.

## Handling ambiguity

Use the PRD’s open decisions section and the linked design documents to identify unresolved choices. If the ambiguity affects money, donor consent, a minor or vulnerable family, vote eligibility, ballot secrecy, moderation, legal obligations, or data retention, **flag it rather than guess**. Open a decision note in the pull request with the alternatives, impact, and the exact human decision required.

## References

[1]: PRD.md "Gram Vikash Foundation Product Requirements Document"
