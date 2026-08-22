# Folder Structure

**Project:** Gram Vikash Foundation  
**Status:** Proposed implementation structure  
**Audience:** Frontend/backend engineers and AI coding agents  
**Architecture constraint:** One Next.js codebase; API routes under `app/api/` are the backend  
**Sources:** [`PRD.md`](../PRD.md), [`architecture-design.md`](architecture-design.md), [`api-contracts.md`](api-contracts.md) [1] [2] [3]

> This is a file-level implementation map for the planned application. The repository currently contains requirements and engineering documentation; these application files should be created incrementally according to [`implementation-plan.md`](implementation-plan.md).

## 1. Non-negotiable structure decisions

The application is a **single Next.js monolith**. There is no separate backend service and no second admin application. The public website, authenticated Member experience, admin panel, and all API route handlers live in the same repository and deploy as one application. API route handlers under `app/api/` call server-only services under `server/`; browser components must never import database clients, payment secrets, storage credentials, or private verification-document code.

One unified `Member` account is used for donor and community access. Registration is mandatory before donating, posting, commenting, or chatting. Public/unauthenticated visitors can view only approved home, program, dashboard, public ledger, and trust/about content. Voting requires the second `voter_verified` tier after restricted government-ID document review; admin role checks and voter checks are separate permissions. [1]

## 2. Complete proposed directory tree

```text
/
├── AGENTS.md
├── PRD.md
├── README.md
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── prettier.config.mjs
├── postcss.config.mjs
├── tailwind.config.ts
├── middleware.ts
├── instrumentation.ts
├── sentry.client.config.ts
├── sentry.server.config.ts
├── .env.example
├── .gitignore
├── .nvmrc
├── vercel.json
│
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   │
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   ├── programs/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       └── not-found.tsx
│   │   ├── transparency/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── ledger/
│   │   │   ├── page.tsx
│   │   │   ├── donations/page.tsx
│   │   │   ├── expenses/page.tsx
│   │   │   └── loading.tsx
│   │   ├── donate/
│   │   │   ├── page.tsx
│   │   │   ├── register-required/page.tsx
│   │   │   ├── pending/page.tsx
│   │   │   └── failed/page.tsx
│   │   ├── donor-wall/page.tsx
│   │   ├── about/
│   │   │   ├── page.tsx
│   │   │   ├── audit-reports/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── kanyadan/
│   │   │   ├── page.tsx
│   │   │   └── eligibility/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── community-guidelines/page.tsx
│   │   └── grievance/page.tsx
│   │
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── verify-contact/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   ├── reset-password/page.tsx
│   │   └── auth-error/page.tsx
│   │
│   ├── (member)/
│   │   ├── layout.tsx
│   │   ├── account/
│   │   │   ├── page.tsx
│   │   │   ├── public-display/page.tsx
│   │   │   ├── security/page.tsx
│   │   │   └── delete-request/page.tsx
│   │   ├── donations/
│   │   │   ├── page.tsx
│   │   │   ├── [donationId]/page.tsx
│   │   │   └── [donationId]/receipt/page.tsx
│   │   ├── voter-verification/
│   │   │   ├── page.tsx
│   │   │   ├── upload/page.tsx
│   │   │   ├── submitted/page.tsx
│   │   │   └── status/page.tsx
│   │   ├── community/
│   │   │   ├── page.tsx
│   │   │   ├── posts/new/page.tsx
│   │   │   ├── posts/[postId]/page.tsx
│   │   │   ├── posts/[postId]/edit/page.tsx
│   │   │   ├── chat/page.tsx
│   │   │   └── proposals/page.tsx
│   │   └── voting/
│   │       ├── page.tsx
│   │       ├── issues/[issueId]/page.tsx
│   │       └── issues/[issueId]/results/page.tsx
│   │
│   ├── (admin)/
│   │   └── admin/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── loading.tsx
│   │       ├── error.tsx
│   │       ├── expenses/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [expenseId]/page.tsx
│   │       ├── offline-donations/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [donationId]/page.tsx
│   │       ├── donations/
│   │       │   ├── page.tsx
│   │       │   └── [donationId]/page.tsx
│   │       ├── programs/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [programId]/edit/page.tsx
│   │       ├── members/
│   │       │   ├── page.tsx
│   │       │   ├── [memberId]/page.tsx
│   │       │   ├── [memberId]/verification/page.tsx
│   │       │   └── [memberId]/verification/document/page.tsx
│   │       ├── kanyadan/
│   │       │   ├── page.tsx
│   │       │   └── [applicationId]/page.tsx
│   │       ├── moderation/
│   │       │   ├── page.tsx
│   │       │   ├── reports/page.tsx
│   │       │   └── [targetType]/[targetId]/page.tsx
│   │       ├── voting/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [issueId]/page.tsx
│   │       ├── audit-log/page.tsx
│   │       ├── exports/page.tsx
│   │       └── settings/
│   │           ├── page.tsx
│   │           ├── admins/page.tsx
│   │           └── feature-flags/page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/route.ts
│       ├── members/
│       │   ├── route.ts                         # POST registration
│       │   ├── me/route.ts                      # GET/PATCH own Member profile
│       │   ├── me/public-display/route.ts       # PATCH donor-wall preference
│       │   ├── me/voter-verification-document/route.ts
│       │   └── me/delete-request/route.ts
│       ├── donations/
│       │   ├── checkout/route.ts
│       │   ├── confirm/route.ts
│       │   ├── webhook/route.ts
│       │   └── [donationId]/
│       │       ├── status/route.ts
│       │       └── receipt/route.ts
│       ├── summary/route.ts
│       ├── ledger/
│       │   ├── donations/route.ts
│       │   └── expenses/route.ts
│       ├── donor-wall/route.ts
│       ├── programs/
│       │   ├── route.ts
│       │   └── [slug]/route.ts
│       ├── kanyadan/info/route.ts
│       ├── uploads/presign/route.ts
│       ├── admin/
│       │   ├── dashboard/route.ts
│       │   ├── expenses/route.ts
│       │   ├── expenses/[expenseId]/route.ts
│       │   ├── donations/offline/route.ts
│       │   ├── donations/[donationId]/route.ts
│       │   ├── programs/route.ts
│       │   ├── programs/[programId]/route.ts
│       │   ├── members/route.ts
│       │   ├── members/[memberId]/route.ts
│       │   ├── members/[memberId]/voter-verification/route.ts
│       │   ├── members/[memberId]/voter-verification-document/route.ts
│       │   ├── kanyadan/applications/route.ts
│       │   ├── kanyadan/applications/[applicationId]/route.ts
│       │   ├── moderation/queue/route.ts
│       │   ├── moderation/[targetType]/[targetId]/route.ts
│       │   ├── reports/[reportId]/route.ts
│       │   ├── voting/issues/route.ts
│       │   ├── voting/issues/[issueId]/route.ts
│       │   ├── audit-log/route.ts
│       │   └── export/ledger/route.ts
│       ├── community/
│       │   ├── posts/route.ts
│       │   ├── posts/[postId]/route.ts
│       │   ├── posts/[postId]/comments/route.ts
│       │   ├── reports/route.ts
│       │   ├── members/[memberId]/block/route.ts
│       │   ├── members/[memberId]/mute/route.ts
│       │   └── chat/channels/[channelId]/messages/route.ts
│       └── voting/
│           ├── issues/route.ts
│           ├── issues/[issueId]/results/route.ts
│           ├── issues/[issueId]/votes/route.ts
│           ├── proposals/route.ts
│           ├── proposals/[proposalId]/route.ts
│           └── proposals/[proposalId]/upvote/route.ts
│
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── checkbox.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   ├── alert.tsx
│   │   ├── skeleton.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   ├── pagination.tsx
│   │   ├── data-table.tsx
│   │   ├── file-upload.tsx
│   │   ├── focus-trap.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── site-header.tsx
│   │   ├── site-footer.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── member-nav.tsx
│   │   ├── admin-sidebar.tsx
│   │   ├── breadcrumbs.tsx
│   │   └── page-container.tsx
│   ├── ledger/
│   │   ├── ledger-surface.tsx
│   │   ├── ledger-hero.tsx
│   │   ├── summary-cards.tsx
│   │   ├── summary-polling-client.tsx
│   │   ├── donation-ledger.tsx
│   │   ├── expense-ledger.tsx
│   │   ├── ledger-row.tsx
│   │   ├── ledger-mobile-card.tsx
│   │   ├── ledger-filters.tsx
│   │   └── donor-wall.tsx
│   ├── programs/
│   │   ├── program-card.tsx
│   │   ├── program-grid.tsx
│   │   ├── program-progress.tsx
│   │   └── program-gallery.tsx
│   ├── donation/
│   │   ├── donation-form.tsx
│   │   ├── donation-amount-selector.tsx
│   │   ├── program-earmark-selector.tsx
│   │   ├── razorpay-checkout.tsx
│   │   ├── donation-status.tsx
│   │   ├── receipt-download.tsx
│   │   └── registration-gate.tsx
│   ├── member/
│   │   ├── registration-form.tsx
│   │   ├── login-form.tsx
│   │   ├── member-profile-form.tsx
│   │   ├── public-display-form.tsx
│   │   ├── voter-verification-form.tsx
│   │   ├── id-document-upload.tsx
│   │   └── verification-status.tsx
│   ├── community/
│   │   ├── post-composer.tsx
│   │   ├── post-card.tsx
│   │   ├── post-feed.tsx
│   │   ├── comment-list.tsx
│   │   ├── comment-form.tsx
│   │   ├── chat-window.tsx
│   │   ├── chat-message.tsx
│   │   ├── report-dialog.tsx
│   │   ├── block-mute-actions.tsx
│   │   └── media-preview.tsx
│   ├── voting/
│   │   ├── issue-card.tsx
│   │   ├── issue-detail.tsx
│   │   ├── vote-form.tsx
│   │   ├── vote-results.tsx
│   │   ├── proposal-card.tsx
│   │   ├── proposal-form.tsx
│   │   ├── upvote-button.tsx
│   │   └── voter-gate.tsx
│   ├── admin/
│   │   ├── admin-dashboard.tsx
│   │   ├── expense-form.tsx
│   │   ├── offline-donation-form.tsx
│   │   ├── member-search.tsx
│   │   ├── voter-verification-review.tsx
│   │   ├── id-document-viewer.tsx
│   │   ├── moderation-queue.tsx
│   │   ├── moderation-action-dialog.tsx
│   │   ├── audit-log-table.tsx
│   │   ├── ledger-export-form.tsx
│   │   └── feature-flag-form.tsx
│   └── providers/
│       ├── auth-provider.tsx
│       ├── query-provider.tsx
│       ├── realtime-provider.tsx
│       └── analytics-provider.tsx
│
├── lib/
│   ├── auth/
│   │   ├── auth-options.ts
│   │   ├── session.ts
│   │   ├── require-member.ts
│   │   ├── require-registered-member.ts
│   │   ├── require-voter-verified.ts
│   │   ├── require-admin.ts
│   │   ├── require-super-admin.ts
│   │   └── route-auth.ts
│   ├── permissions/
│   │   ├── roles.ts
│   │   ├── member-permissions.ts
│   │   ├── admin-permissions.ts
│   │   └── resource-access.ts
│   ├── validation/
│   │   ├── common.ts
│   │   ├── members.ts
│   │   ├── donations.ts
│   │   ├── expenses.ts
│   │   ├── programs.ts
│   │   ├── kanyadan.ts
│   │   ├── community.ts
│   │   ├── voting.ts
│   │   ├── moderation.ts
│   │   └── uploads.ts
│   ├── formatting/
│   │   ├── currency.ts
│   │   ├── dates.ts
│   │   ├── numbers.ts
│   │   └── public-display.ts
│   ├── api/
│   │   ├── client.ts
│   │   ├── errors.ts
│   │   ├── response.ts
│   │   ├── pagination.ts
│   │   └── request-id.ts
│   ├── storage/
│   │   ├── presign.ts
│   │   ├── private-objects.ts
│   │   ├── public-objects.ts
│   │   └── object-keys.ts
│   ├── rate-limit/
│   │   ├── limiter.ts
│   │   ├── keys.ts
│   │   └── policies.ts
│   └── feature-flags.ts
│
├── server/
│   ├── db/
│   │   ├── client.ts
│   │   ├── index.ts
│   │   ├── transaction.ts
│   │   ├── schema/
│   │   │   ├── admin-users.ts
│   │   │   ├── members.ts
│   │   │   ├── programs.ts
│   │   │   ├── donations.ts
│   │   │   ├── expenses.ts
│   │   │   ├── kanyadan-applications.ts
│   │   │   ├── audit-logs.ts
│   │   │   ├── posts.ts
│   │   │   ├── comments.ts
│   │   │   ├── chat-messages.ts
│   │   │   ├── vote-issues.ts
│   │   │   ├── votes.ts
│   │   │   ├── poll-proposals.ts
│   │   │   ├── poll-proposal-upvotes.ts
│   │   │   └── reports.ts
│   │   ├── queries/
│   │   │   ├── summary.ts
│   │   │   ├── ledgers.ts
│   │   │   ├── members.ts
│   │   │   ├── programs.ts
│   │   │   ├── donations.ts
│   │   │   ├── expenses.ts
│   │   │   ├── community.ts
│   │   │   ├── voting.ts
│   │   │   └── moderation.ts
│   │   └── migrations/
│   │       └── README.md
│   ├── services/
│   │   ├── members/
│   │   │   ├── register-member.ts
│   │   │   ├── update-member.ts
│   │   │   ├── public-display.ts
│   │   │   └── delete-member.ts
│   │   ├── donations/
│   │   │   ├── create-checkout.ts
│   │   │   ├── confirm-payment.ts
│   │   │   ├── apply-webhook.ts
│   │   │   ├── get-status.ts
│   │   │   └── reconcile-pending.ts
│   │   ├── expenses/
│   │   │   ├── create-expense.ts
│   │   │   ├── update-expense.ts
│   │   │   └── export-ledger.ts
│   │   ├── programs/
│   │   │   ├── list-programs.ts
│   │   │   └── update-program.ts
│   │   ├── receipts/
│   │   │   ├── generate-receipt.ts
│   │   │   ├── send-receipt.ts
│   │   │   └── retry-receipt.ts
│   │   ├── voter-verification/
│   │   │   ├── submit-document.ts
│   │   │   ├── review-document.ts
│   │   │   ├── get-review-url.ts
│   │   │   └── expire-verification.ts
│   │   ├── kanyadan/
│   │   │   ├── create-application.ts
│   │   │   └── review-application.ts
│   │   ├── community/
│   │   │   ├── create-post.ts
│   │   │   ├── create-comment.ts
│   │   │   ├── create-chat-message.ts
│   │   │   └── member-actions.ts
│   │   ├── voting/
│   │   │   ├── create-issue.ts
│   │   │   ├── cast-vote.ts
│   │   │   ├── get-results.ts
│   │   │   ├── create-proposal.ts
│   │   │   └── upvote-proposal.ts
│   │   └── moderation/
│   │       ├── create-report.ts
│   │       ├── review-report.ts
│   │       ├── publish-content.ts
│   │       └── remove-content.ts
│   ├── payments/
│   │   ├── razorpay-client.ts
│   │   ├── razorpay-signature.ts
│   │   ├── razorpay-events.ts
│   │   └── razorpay-types.ts
│   ├── storage/
│   │   ├── client.ts
│   │   ├── quarantine.ts
│   │   ├── malware-scan.ts
│   │   └── signed-url.ts
│   ├── auth/
│   │   ├── password-policy.ts
│   │   ├── session-hooks.ts
│   │   └── account-lockout.ts
│   ├── audit/
│   │   ├── append-audit-event.ts
│   │   ├── audit-types.ts
│   │   └── redact-diff.ts
│   ├── email/
│   │   ├── client.ts
│   │   ├── templates/
│   │   │   ├── donation-receipt.tsx
│   │   │   ├── payment-pending.tsx
│   │   │   └── moderation-notice.tsx
│   │   └── send.ts
│   └── observability/
│       ├── logger.ts
│       ├── metrics.ts
│       └── scrub-sensitive-data.ts
│
├── db/
│   ├── drizzle.config.ts
│   ├── migrations/
│   ├── seeds/
│   │   ├── programs.ts
│   │   └── development-admin.ts
│   └── README.md
│
├── workers/
│   ├── README.md
│   ├── receipt-delivery.ts
│   ├── payment-reconciliation.ts
│   ├── media-scan.ts
│   └── retention-cleanup.ts
│
├── public/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   │   └── placeholders/
│   └── robots.txt
│
├── tests/
│   ├── fixtures/
│   │   ├── members.ts
│   │   ├── donations.ts
│   │   ├── razorpay-events.ts
│   │   ├── votes.ts
│   │   └── moderation-media.ts
│   ├── unit/
│   │   ├── currency.test.ts
│   │   ├── summary.test.ts
│   │   ├── permissions.test.ts
│   │   ├── vote-integrity.test.ts
│   │   └── validation.test.ts
│   ├── integration/
│   │   ├── donations-webhook.test.ts
│   │   ├── donations-admin.test.ts
│   │   ├── member-access.test.ts
│   │   ├── voter-verification.test.ts
│   │   ├── ledger-summary.test.ts
│   │   ├── moderation-pipeline.test.ts
│   │   └── database-constraints.test.ts
│   └── e2e/
│       ├── public-ledger.spec.ts
│       ├── registration-and-donation.spec.ts
│       ├── admin-expense-entry.spec.ts
│       ├── voter-verification.spec.ts
│       ├── community-posting.spec.ts
│       └── voting.spec.ts
│
├── scripts/
│   ├── check-env.ts
│   ├── verify-summary.ts
│   ├── reconcile-payments.ts
│   ├── run-retention-cleanup.ts
│   └── seed-development.ts
│
└── docs/
    ├── architecture-design.md
    ├── design-system.md
    ├── system-design.md
    ├── database-schema.md
    ├── api-contracts.md
    ├── folder-structure.md
    ├── implementation-plan.md
    ├── security-and-privacy.md
    ├── content-moderation-playbook.md
    ├── testing-qa-plan.md
    ├── deployment-runbook.md
    └── project-proposal.md
```

### `server/db/` hierarchy

The database client, transaction wrapper, schema definitions, query modules, and migrations are sibling areas under `server/db/`. Keep read/query code separate from table definitions and migration files:

```text
server/db/
├── client.ts
├── index.ts
├── transaction.ts
├── schema/
│   └── ...table schema files...
├── queries/
│   └── ...read/query modules...
└── migrations/
    └── README.md
```

## 3. Route-group and access table

| Route group or URL | Access | Pages and purpose |
|---|---|---|
| `app/(public)` | Public | Home, programs, transparency dashboard, public donation/expense ledger, donor wall, trust/about, kanyadan information, privacy, terms, guidelines, grievance |
| `app/(auth)` | Public before login | Registration, login, contact verification, password reset, auth errors |
| `app/(member)` | `registered-member` | Account, own donations/receipts, public-display preference, voter-document submission, community posts/comments/chat, proposals |
| `app/(member)/voting` | `voter_verified` for voting actions; public results may remain public | Active issues, vote form, aggregate results, archive; the page may explain the gate to Tier 1 Members |
| `app/(admin)/admin` | `admin` or `super-admin` | Dashboard, expenses, offline donations, program CMS, Member management, kanyadan queue, moderation, audit log, exports |
| `app/api/summary`, `app/api/ledger/*`, `app/api/programs/*` | Public | Read-only approved projections; never return private Member or ID-document fields |
| `app/api/members/*` | Public for registration; current Member for self-service; admin for staff routes | Create/read/update unified Member account and restricted voter-document workflow |
| `app/api/donations/checkout` | `registered-member` | Create pending Razorpay order; unauthenticated callers receive `registration_required` |
| `app/api/donations/confirm`, status, receipt | `member-session`/`registered-member` for own resource; admin for audited support | Confirm/status/receipt access for the same Member only |
| `app/api/donations/webhook` | Razorpay provider only | Raw-body signature validation and idempotent payment state transition |
| `app/api/community/*` | `registered-member` for mutations; public only for approved read feeds/comments where policy allows | Posts, comments, reports, group chat, block/mute |
| `app/api/voting/issues/*/votes` | `voter_verified` | Cast one vote per issue; server derives Member identity |
| `app/api/voting/proposals/*` | `registered-member` for create/upvote; public for approved reads | Poll proposals and aggregate upvotes |
| `app/api/admin/*` | `admin`; selected settings require `super-admin` | All financial, verification, moderation, export, content, and issue-management operations |

Do not infer access from the folder name alone. Every API route calls an authorization helper, and every service repeats resource ownership or role checks where a route can be reached through another server path.

## 4. Auth and permission structure

### `middleware.ts`

Use middleware for coarse route classification only: redirect unauthenticated users away from `(member)` and `/admin` pages, attach a request ID, and reject obviously invalid sessions. Middleware must not be the only authorization layer and must not fetch or expose a voter ID document. Public pages and the Razorpay webhook must remain reachable without a browser session, with the webhook protected by provider signature validation instead.

### Auth helpers

| Helper | Responsibility | Use |
|---|---|---|
| `getSessionMember()` | Return the authenticated unified Member or `null` | Server components and API handlers that may be public |
| `requireRegisteredMember()` | Require an active authenticated Member with Tier 1 registration | Donation checkout, posts, comments, chat, proposal creation, document submission |
| `requireVoterVerified()` | Require active Member plus `verification_tier = voter_verified`, approved document state, and server-side 18+ check | Vote casting and any voter-only action |
| `requireAdmin()` | Require active admin session and allowed role | Financial mutations, content editing, moderation, verification review |
| `requireSuperAdmin()` | Require elevated admin role | Admin-role management, high-risk settings, irreversible configuration |
| `assertOwnResource()` | Compare session Member ID to resource Member ID | Donation status/receipt, account settings, delete requests |
| `assertVillagePolicy()` | Apply the foundation’s village/ward acceptance policy | Registration review, community access moderation, account suspension |

Authentication proves who is signed in; authorization decides what that account may do. The server derives `member_id`, `admin_id`, verification tier, and role from trusted session/database state. No browser request may set these values.

### Permission flow examples

**Donation:** public visitor opens `/donate` → page explains registration requirement → visitor registers/logs in → `requireRegisteredMember()` protects `POST /api/donations/checkout` → checkout order is linked to the authenticated Member → provider webhook transitions the payment. Choosing Anonymous changes the public donor-wall projection only.

**Voter verification:** registered Member uploads a document through a presigned private path → server records `submitted` → only an admin with voter-verification permission can view a short-lived signed document URL → admin approves/rejects/request-resubmission → approval stores `voter_verified` and reviewer metadata. Raw documents do not enter public components, logs, analytics, or audit diffs.

**Vote:** authenticated request reaches `POST /api/voting/issues/[issueId]/votes` → `requireVoterVerified()` → issue-window and option validation → transaction inserts `Vote` under `UNIQUE (issue_id, member_id)` → conflict becomes `409` → results aggregate without exposing the Member-to-option row.

## 5. Naming conventions

| Artifact | Convention | Example |
|---|---|---|
| Route files | Always `route.ts` in a resource-named folder; dynamic segments use camel-free URL IDs | `app/api/admin/expenses/route.ts` |
| Page files | Next.js `page.tsx`; route folders use lowercase kebab-case or plural resource names | `app/(member)/voter-verification/upload/page.tsx` |
| Layout/loading/error | `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` | `app/(public)/programs/[slug]/loading.tsx` |
| React components | PascalCase file names for reusable components | `components/ledger/LedgerRow.tsx` or project-approved kebab convention; choose one and keep it consistent |
| Hooks | `use` prefix, camelCase | `useSummaryPolling.ts` |
| Validation schemas | Domain file plus exported `...Schema` | `lib/validation/donations.ts` → `checkoutDonationSchema` |
| Database tables | snake_case plural | `members`, `donations`, `vote_issues` |
| TypeScript database modules | kebab-case or snake-free domain names | `server/db/schema/vote-issues.ts` |
| Query modules | Verb/domain or read model name | `server/db/queries/summary.ts` |
| Service modules | One command/use case per file | `server/services/voting/cast-vote.ts` |
| Tests | Match subject with `.test.ts` or `.spec.ts` | `tests/integration/donations-webhook.test.ts` |
| Environment variables | Uppercase snake case; server-only secrets are never `NEXT_PUBLIC_*` | `RAZORPAY_WEBHOOK_SECRET` |
| Monetary fields | `amount_paise` at persistence/API boundary | `donations.amount_paise` |

For component naming, the repository should choose either PascalCase filenames or lowercase kebab-case filenames during scaffold creation. The important rule is that the choice is recorded in the initial implementation PR and never mixed ad hoc. The examples in this document use domain folders and descriptive filenames.

## 6. Shared components versus page-specific components

Build all buttons, inputs, cards, badges, alerts, modals, pagination, tables, upload controls, and focus behavior in `components/ui/`. Map their colors, typography, spacing, and states to [`design-system.md`](design-system.md); a feature component may compose a primitive but must not create a second button or card variant with ad-hoc hex values. [5]

Use domain-level shared components for patterns used across more than one route group: `components/ledger/` for public/admin ledger presentations, `components/donation/` for registration-gated checkout and receipt states, `components/member/` for profile and voter verification, `components/community/` for posts/chat/reporting, and `components/admin/` for protected workflows. Keep page-specific composition next to the route when it is used exactly once. Keep database queries and mutation logic out of components.

## 7. Where a new feature goes

| Feature request | Page location | API route | Validation | Service/query | Tests |
|---|---|---|---|---|---|
| New public program page | `app/(public)/programs/[slug]/` | `app/api/programs/[slug]/route.ts` | `lib/validation/programs.ts` | `server/services/programs/`, `server/db/queries/programs.ts` | `tests/e2e/` and query unit tests |
| New donation behavior | `app/(member)/donations/` or `components/donation/` | `app/api/donations/.../route.ts` | `lib/validation/donations.ts` | `server/services/donations/` | money, webhook, and e2e tests; human gate |
| New admin feature | `app/(admin)/admin/feature-name/` | `app/api/admin/feature-name/route.ts` | `lib/validation/feature-name.ts` | `server/services/feature-name/` | admin authorization, transaction, and e2e tests |
| New Member self-service | `app/(member)/account/` | `app/api/members/me/.../route.ts` | `lib/validation/members.ts` | `server/services/members/` | ownership/privacy tests |
| New voter-only action | `app/(member)/voting/` | `app/api/voting/.../route.ts` | `lib/validation/voting.ts` | `server/services/voting/` | voter gate, race, secrecy, and aggregate tests; human gate |
| New community post capability | `app/(member)/community/` | `app/api/community/.../route.ts` | `lib/validation/community.ts` | `server/services/community/` | rate limit, moderation, media, and e2e tests; human gate |
| New moderation action | `app/(admin)/admin/moderation/` | `app/api/admin/moderation/.../route.ts` | `lib/validation/moderation.ts` | `server/services/moderation/` | audit, soft-removal, privacy, and escalation tests; human gate |
| New database entity | No page until domain is defined | Domain route only after contract review | Domain schema file | `server/db/schema/`, migration, query/service | constraint and migration tests |
| New shared visual pattern | `components/ui/` or domain component | None | Story/fixture if used | N/A | accessibility and responsive tests |

Before adding a file, identify whether the capability is public, registered-Member-only, voter-verified, admin, or super-admin. Then find the nearest existing domain folder, extend the shared validation and authorization path, add the API contract, and update the implementation plan if the change crosses a phase boundary.

## 8. Database and migration placement

Use `server/db/schema/` for Drizzle table definitions if Drizzle is selected during scaffold creation, `db/migrations/` for generated migrations, and `server/db/queries/` for read models. [`database-schema.md`](database-schema.md) remains the relational design reference: the unified `members` table, restricted voter-document metadata, financial foreign keys, and `UNIQUE (issue_id, member_id)` must be represented in the migration. [4]

The application runtime imports the database client only from server-only modules. Route handlers call domain services, services call transaction/query modules, and direct SQL is not scattered across page or component files. Add an explicit migration for every schema change and include its rollback/forward-fix implications in the pull request.

## 9. Feature flags and phase boundaries

`COMMUNITY_FEATURE_FLAG` and `VOTING_FEATURE_FLAG` default to `false` in production until their human review gates are complete. Registration-gated donation is not a flag or a future option: it is part of the MVP. Document upload/review is a Phase C voting prerequisite, while automated Aadhaar/e-KYC is not part of the baseline. The architecture must not expose a hidden route that bypasses a flag or authorization helper.

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: architecture-design.md "Architecture Design"
[3]: api-contracts.md "API Contracts"
[4]: database-schema.md "Database Schema"
[5]: design-system.md "Design System"
