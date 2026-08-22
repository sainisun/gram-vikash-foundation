# Implementation Plan

**Project:** Gram Vikash Foundation  
**Status:** Sequenced execution plan  
**Audience:** AI coding agents with human architect review  
**Prerequisites:** [`PRD.md`](../PRD.md), [`architecture-design.md`](architecture-design.md), [`database-schema.md`](database-schema.md), [`api-contracts.md`](api-contracts.md) [1]

> Work in the sequence below. Each task has a concrete deliverable and a definition of done. A checkpoint marked **HUMAN REVIEW REQUIRED** is a stop: do not continue into the next money-, vote-, or moderation-sensitive task until Sunil/architect approval is recorded.

## Phase A — Donation & Transparency Platform (Module 1)

### A0. Decisions, environments, and repository baseline

| Task | Deliverable | Dependencies | Definition of done |
|---|---|---|---|
| A0.1 | Confirm trust/society registration status, Razorpay onboarding path, domain, budget, admins, receipt policy, and 80G/FCRA boundaries | None | Open decisions are recorded; no international payment path is enabled; owners and target dates are named |
| A0.2 | Create local, preview, staging, and production environment conventions | A0.1 | `.env.example` contains names only, secrets are outside Git, preview uses test credentials, and deployment access is restricted |
| A0.3 | Scaffold Next.js/TypeScript/Tailwind application and CI | None | Strict TypeScript, lint, format, typecheck, unit-test command, and migration command run in CI |
| A0.4 | Import design tokens and base layout | A0.3; `design-system.md` | No ad-hoc colors or fonts; responsive shell works at mobile and desktop widths; focus state is visible |

**Checkpoint A0 — HUMAN REVIEW REQUIRED:** Approve legal assumptions, admin roles, payment launch scope, and the design-system baseline before financial persistence is implemented.

### A1. Database and audit foundation

| Task | Deliverable | Dependencies | Definition of done |
|---|---|---|---|
| A1.1 | Implement PostgreSQL migration for `admin_users`, `donors`, `programs`, `donations`, `expenses`, `kanyadan_applications`, and `audit_logs` | A0.3; `database-schema.md` | Migration applies to an empty database, rollback is documented, constraints and indexes match the schema document |
| A1.2 | Add seed programs and non-production admin fixture | A1.1 | Seeds are idempotent, contain no real PII, and production seed execution is blocked or reviewed |
| A1.3 | Implement audit service | A1.1 | Admin ID, action, entity, timestamp, and diff are recorded in the same transaction as every financial/admin mutation; no update/delete API exists for audit rows |
| A1.4 | Implement money and summary query library | A1.1 | Integer-paise tests cover zero, one, large values, balance calculation, failed/pending exclusion, and no floating-point arithmetic |

### A2. Admin authentication and manual ledger operations

| Task | Deliverable | Dependencies | Definition of done |
|---|---|---|---|
| A2.1 | Add admin sign-in, session, password reset policy, and role guard | A0.3 | Unauthenticated requests receive `401`; inactive admins cannot act; session cookies are secure in production |
| A2.2 | Implement `POST /api/admin/expenses` | A1.1–A1.4; `api-contracts.md` | Validated expense and audit row commit atomically; duplicate idempotency key cannot create a second expense; errors are safe |
| A2.3 | Implement `POST /api/admin/donations/offline` | A1.1–A1.4 | Cash/cheque donation appears in the same ledger shape, requires admin identity, and records consent/anonymity accurately |
| A2.4 | Build admin dashboard and mobile quick-entry forms | A2.1–A2.3; `design-system.md` | Add Expense can be completed from a phone in the target workflow; loading, error, success, and duplicate-submit states are tested |
| A2.5 | Implement ledger CSV/PDF export | A2.2–A2.3 | Export filters are deterministic, access is audited, sensitive fields are minimized, and generated files are not public by default |

**Checkpoint A2 — HUMAN REVIEW REQUIRED:** Review admin authorization, offline-entry accounting behavior, public visibility, and audit-log evidence using staging fixtures.

### A3. Public transparency site

| Task | Deliverable | Dependencies | Definition of done |
|---|---|---|---|
| A3.1 | Implement public home page with summary metrics | A1.4; A0.4 | Totals come from `/api/summary`; no hardcoded financial values; loading and unavailable states are explicit |
| A3.2 | Implement paginated donation and expense ledgers | A2.2–A2.3 | Stable date/id ordering, anonymous donor default, program tags, accessible table/stacked mobile view, and no private receipt URL leakage |
| A3.3 | Implement program pages and editable content | A1.1; A0.4 | Active program content is rendered from the database, metric values are validated, and gallery imagery follows consent rules |
| A3.4 | Implement donor wall and trust/about pages | A2.3; content supplied by foundation | Public names are opt-in; registration/audit documents are downloadable only when approved; empty/error states exist |
| A3.5 | Add Phase 1 polling refresh | A3.1–A3.2 | Summary polls every 30–60 seconds, ledger has manual refresh, stale/unavailable state is communicated, and polling pauses when page is hidden if appropriate |

### A4. Razorpay, receipts, and reconciliation

| Task | Deliverable | Dependencies | Definition of done |
|---|---|---|---|
| A4.1 | Implement checkout order creation | A1.1–A1.4; Razorpay test account | Pending donation is created before checkout; server secrets stay server-side; amount/program binding is validated |
| A4.2 | Implement webhook endpoint and raw-body signature verification | A4.1; `api-contracts.md` | `X-Razorpay-Signature` is verified against raw body; event ID and payment ID are idempotent; invalid signatures do not mutate state |
| A4.3 | Implement legal state transitions and client status confirmation | A4.1–A4.2 | Duplicate, out-of-order, failed, pending, and late-authorized fixtures are covered; browser success alone cannot create a successful ledger row |
| A4.4 | Implement PDF receipt generation and email delivery | A4.3 | Receipt is generated only after committed success; email failure is retryable and does not roll back donation; private URLs are controlled |
| A4.5 | Implement reconciliation job/admin report | A4.3 | Aged pending intents are compared with provider status; exceptions are visible; reconciliation is idempotent and audited |

**Checkpoint A4 — HUMAN REVIEW REQUIRED:** Run a staged end-to-end donation with test mode, inspect webhook signature logs, database state, public totals, receipt content, duplicate delivery behavior, and failure recovery. Do not enable live keys until approved.

### A5. Phase A hardening and launch

| Task | Deliverable | Dependencies | Definition of done |
|---|---|---|---|
| A5.1 | Mobile/low-bandwidth and accessibility pass | A3.1–A4.5 | FCP/TTI targets are measured on a representative Android profile; Devanagari, contrast, keyboard, screen reader, and zoom checks pass |
| A5.2 | Security and privacy review | A2–A4; `security-and-privacy.md` | Public query review finds no PII leakage; secrets scan is clean; retention, consent, and incident contacts are documented |
| A5.3 | Backup/restore and deployment rehearsal | A1–A4; `deployment-runbook.md` | Staging restore succeeds, migrations are reversible or forward-correctable, rollback is rehearsed, alerts reach named recipients |
| A5.4 | Soft launch | A5.1–A5.3; legal prerequisites | Limited village users can donate/test ledger; daily reconciliation and admin support owner are assigned |
| A5.5 | Production launch decision | A5.4 | Human sign-off records no open blocker involving payments, financial totals, donor privacy, or legal onboarding |

## Phase B — Community Posting (Module 2, part 1)

Do not start Phase B until Module 1 has been stable in production, the admin team can operate the ledger, and a moderation owner and Grievance Officer decision are recorded. The community module adds user-generated content and child-safety risk; it is not a cosmetic extension. [1]

| Task | Deliverable | Dependencies | Definition of done |
|---|---|---|---|
| B1 | Implement `community_members`, sessions, phone verification, and account states | Phase A stable; schema/API docs | Donor and member identities remain separate; unverified members can be restricted without deleting history; privacy notice is shown |
| B2 | Implement post creation, feed, comments, reports, block/mute support tables | B1; approved community guidelines | Rate limits, ownership checks, published/under-review/removed states, and report creation work; no private DMs |
| B3 | Implement upload quarantine, file validation, malware scan adapter, and controlled URLs | B2; storage/scanner credentials | Oversize/unsupported/malicious fixtures are rejected or quarantined; media is not public before required checks |
| B4 | Implement moderation queue and soft removal | B2–B3; `content-moderation-playbook.md` | Moderator actions record actor/reason/time; removed content is no longer public; reporters’ identities are protected |
| B5 | Add public group chat through a realtime adapter | B1–B4; provider selection | Messages persist before publish, rate limits apply, moderation can inspect history, provider outage is explicit, no private chat |
| B6 | Operate a monitored pilot | B1–B5 | At least one review cycle is documented, response targets are measured, abuse trends are reviewed, and human go/no-go is recorded |

**Checkpoint B — HUMAN REVIEW REQUIRED:** Approve moderation queue operation, child-safety escalation, Grievance Officer details, community guidelines, retention, and pilot evidence before voting work begins.

## Phase C — Voting System (Module 2, part 2)

Voting should be built only after Phase B demonstrates that identity verification, moderation, reporting, and account suspension work operationally.

| Task | Deliverable | Dependencies | Definition of done |
|---|---|---|---|
| C1 | Implement manual member verification workflow | Phase B pilot; PRD decision | Verification evidence and reviewer are recorded; unverified members cannot vote; no Aadhaar/e-KYC is added without separate approval |
| C2 | Implement poll proposals and one-member-one-upvote | C1; schema/API docs | Proposal creation is rate limited and moderated; supporting unique key prevents duplicate upvotes; trend rule is published |
| C3 | Implement official issue lifecycle | C2 | Admin creates issue with stable options and dates; activation/closure is audited; post-activation options cannot silently change |
| C4 | Implement vote casting and aggregate results | C3 | Server derives member identity; `UNIQUE (issue_id, member_id)` rejects concurrent duplicates; results never expose individual ballots |
| C5 | Implement archive, anomaly monitoring, and incident procedure | C4 | Closed issues/results are readable; suspicious patterns alert admins without changing ballots; correction procedure requires human approval |
| C6 | Conduct a supervised village pilot | C1–C5; `testing-qa-plan.md` | Eligibility, double-vote, outage, accessibility, moderation, and secret-ballot tests pass; architect signs off before binding-feeling use |

**Checkpoint C — HUMAN REVIEW REQUIRED:** Approve the trending-to-official-vote rule, identity/age verification policy, ballot secrecy, anomaly response, and legal/community governance language.

## 4. Legal and non-engineering blocker map

| Blocker or decision from the PRD | Blocks | Owner/action |
|---|---|---|
| Trust/society registration and correct legal identity | Trust/about publication, Razorpay onboarding, public credibility | Founder plus qualified professional; record status before launch |
| Razorpay merchant onboarding, PAN, bank account, and organization documents | Live online donations | Founder/finance owner; use test mode until complete |
| 80G/12A status and receipt wording | Tax-deductible receipt claims and automated 80G workflow | Qualified tax/legal professional; MVP can issue non-80G donation receipts only if approved |
| FCRA/foreign/NRI contribution path | Any foreign-currency or regulated foreign contribution feature | Qualified legal/CA review; keep disabled in Module 1 |
| DPDP/privacy notice, consent, withdrawal, retention/deletion process | Donor/member/kanyadan data collection and media publication | Privacy owner with legal review; do not rely on implied consent |
| Child/guardian media consent process | Coaching photos, kanyadan stories, community uploads | Foundation safeguarding owner; no identifying minor content without documented consent |
| Grievance Officer and complaint process | Community posts/comments/chat/voting module | Founder designates role and publishes process before Phase B |
| Trending proposal rule | Official issue creation | Founder/community governance decision before Phase C |
| Age/identity verification method | Voting eligibility | Founder/architect approve manual verification or another justified method |
| Moderator staffing and escalation contacts | Any user-generated content feature | Founder appoints moderators and child-safety escalation path |

## 5. Agent execution protocol

An agent should take one task at a time, update tests with the implementation, and stop at every checkpoint. The agent must report changed files, migration impact, tests run, unresolved assumptions, and whether a human sign-off gate was reached. Agents must not silently expand a Phase A task into Phase B/C functionality.

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
