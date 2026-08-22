# Testing and QA Plan

**Project:** Gram Vikash Foundation  
**Status:** Release-quality test baseline  
**Audience:** Engineers, QA reviewers, admin pilot users, and AI coding agents  
**Sources:** [`PRD.md`](../PRD.md), [`api-contracts.md`](api-contracts.md), [`database-schema.md`](database-schema.md) [1]

> The system handles real donation money and sensitive community data. A green UI test suite is not sufficient for launch; the release must prove financial correctness, webhook idempotency, authorization boundaries, privacy projections, mobile usability, and recoverability.

## 1. Quality gates

| Gate | Minimum requirement |
|---|---|
| Unit | Money, summary, validation, authorization, vote aggregation, and state-transition tests pass |
| Integration | Database constraints, migrations, admin mutations, payment webhook, receipt, and moderation flows pass |
| End-to-end | Donor checkout-to-receipt staging flow, public ledger, admin entry, and mobile navigation pass |
| Security/privacy | No secret leakage, public PII projection review, authorization tests, upload scanning tests, and rate-limit tests pass |
| Performance | PRD mobile targets are measured on a representative mid-range Android/4G profile: FCP under 2s and TTI under 3.5s as targets [1] |
| Operational | Backup restore, reconciliation, alert delivery, rollback, and admin runbook rehearsal pass |
| Human approval | Payment, financial-summary, vote, child-safety, moderation, and legal/compliance gates are signed off |

## 2. Unit test expectations

### Money and summary math

All money values are integer paise. Tests must cover zero rows, one row, multiple rows, large but valid values, failed and pending donations, expenses by category, balance equal to raised minus spent, negative balances, duplicate records, and formatting into rupees. Include property-style tests where practical: adding a successful donation increases the raised total by exactly its paise amount; adding an expense decreases balance by exactly its paise amount; failed/pending donations do not increase raised totals.

Test that pagination and filters do not change summary totals, that amounts cannot be fractional or negative, and that JavaScript safe-integer boundaries are handled deliberately. If values may exceed safe integer limits, use a database/serialization strategy that preserves `BIGINT` exactly.

### Authorization and privacy

Test every API level: public, donor-session, community-member, verified member, admin, and super-admin. Verify that a donor token cannot access another donation, a member cannot set their own verification status, a client cannot set `admin_id` or `member_id`, and public responses exclude phone, email, DOB, private receipt URLs, kanyadan case details, and individual votes.

### Vote logic

Test active/inactive/closed issue windows, invalid options, unverified members, suspended members, missing sessions, expired sessions, duplicate attempts, concurrent attempts, aggregate totals, empty results, and secret-ballot response projections. A vote must be accepted at most once per `(issue_id, member_id)`.

### Moderation and uploads

Test media type/size validation, filename/path handling, scan failure, quarantine status, publish/removal transitions, removed-content filtering, report creation, duplicate report throttling, admin-only queue access, and audit events. Test that a removed object is no longer retrievable through its public URL.

## 3. Integration tests

### Database and migration tests

Run migrations against an empty database and a representative populated database. Verify foreign-key restrictions, status checks, positive amount checks, program references, audit inserts, partial/unique indexes, and the mandatory `votes(issue_id, member_id)` unique constraint. Test that a referenced program/admin/member cannot be deleted in a way that orphans financial or accountability history.

### Razorpay webhook flow

Use test-mode fixtures and do not use live secrets in CI. For each fixture, assert HTTP result, database state, audit event, receipt state, and public-summary effect.

| Case | Expected result |
|---|---|
| Valid successful event | One successful donation, provider IDs stored, receipt queued, totals updated after commit |
| Same event delivered twice | Second delivery is idempotent; no second donation, receipt, or total increment |
| Same payment ID with a different event | Conflicting event is rejected or routed to reconciliation; no duplicate financial row |
| Invalid HMAC signature | No state change; security log without raw sensitive payload |
| Malformed JSON/body | Safe error; no partial write |
| Out-of-order payment events | Only valid state transition applied; stale event ignored or current provider state fetched |
| DB unavailable before commit | Non-2xx or safe failure; provider retry/reconciliation can recover |
| Commit succeeds, email fails | Donation remains successful; receipt delivery is retryable and visible in admin |
| Webhook absent | Pending intent remains excluded from totals; reconciliation identifies provider status |
| Failed payment | Donation is failed and excluded from totals; donor receives retry guidance |

Razorpay documents raw-body HMAC validation, unique event IDs, duplicate delivery, out-of-order events, and retry behavior; the tests must encode those properties rather than assume one callback in one order. [2] [3]

### Admin ledger flows

Test valid expense/offline donation creation, invalid category/program combinations, duplicate idempotency keys, admin role restrictions, audit event atomicity, receipt upload handling, and export filtering. Simulate a transaction rollback and assert that neither the ledger row nor its audit event remains half-created.

### Public ledger and polling

Test summary response after each committed mutation, successful/pending/failed filtering, stable pagination at equal timestamps, manual refresh, polling interval cleanup, tab-hidden behavior if implemented, provider/database outage state, and no stale hardcoded fallback. A public page may show “temporarily unavailable”; it must not silently display an old balance as live.

## 4. Vote unique-constraint test

The release test must run two concurrent cast requests for the same verified member and issue. Both requests may pass an initial pre-check; the database must accept exactly one insert and reject the other with a handled unique violation/`409 Conflict`. Assert that:

```sql
SELECT COUNT(*)
FROM votes
WHERE issue_id = :issue_id AND member_id = :member_id;
```

returns `1`, the aggregate result increases by one, and no retry or client refresh can increase it again. Repeat with different members on the same issue and the same member on different issues to prove the constraint is scoped correctly.

## 5. Manual mobile and low-bandwidth QA

Test on representative Android devices and Chromium/Safari where available at widths below and above 760px. Use a throttled 4G profile and an offline/online transition.

| Area | Checks |
|---|---|
| First load | Hero, mission, donate CTA, summary, and navigation become usable without waiting for non-critical gallery media |
| Donation flow | Presets/custom amount, Hindi labels, validation, checkout handoff, back navigation, retry, pending, failure, and receipt status are understandable |
| Ledger | Amount/date/description remain readable; no clipped columns; stacked mobile row or announced horizontal scroll works; refresh state is clear |
| Admin | Add expense and offline donation can be completed with one hand; duplicate submit is prevented; file upload failure is recoverable |
| Typography | Devanagari vowel marks do not collide; mixed Hindi/English wraps; browser text zoom to 200% remains usable |
| Accessibility | Keyboard focus, screen-reader labels, form errors, live-region updates, contrast, reduced motion, and touch targets pass |
| Resilience | Slow network, lost network, reload during pending payment, provider timeout, and expired session show safe states |
| Privacy | Public screens contain no hidden PII in HTML, JSON, image alt text, URLs, analytics events, or page titles |

Measure the PRD targets of FCP under 2 seconds and TTI under 3.5 seconds on the chosen mid-range 4G profile, but treat real-world pilot feedback as an additional release signal. [1]

## 6. Security and abuse QA

Run dependency and secret scans, verify production headers, test CSRF/session expiry, rate-limit login/donation/vote/post/report endpoints, fuzz JSON fields and pagination parameters, and attempt path traversal in upload filenames. Confirm error logs redact authorization headers, cookies, payment signatures, donor contacts, kanyadan notes, and private media URLs.

Test role escalation, IDOR attempts against donations/receipts/reports, provider webhook replay, duplicate vote race, post-removal URL access, malware fixture behavior, and reporter identity disclosure. Perform a manual public API inventory before launch; undocumented debug endpoints must not be deployed.

## 7. Pre-launch checklist

### Product and data

- The foundation’s approved name, contact information, registration status, trust/about copy, and donation receipt language are loaded.
- Program descriptions, progress metrics, and images are approved and consent-reviewed.
- Every public total is derived from database ledger rows; no hardcoded totals remain.
- Donor-wall default is Anonymous and opt-in display is explicit.
- Kanyadan public content is aggregate/anonymized unless written consent and safety review exist.

### Payments and finance

- Razorpay merchant onboarding and account ownership are complete for the approved launch scope.
- Test-mode checkout, valid/invalid signatures, duplicate/out-of-order webhooks, pending payments, failed payments, reconciliation, and receipt retry have passed.
- Live and test webhook URLs/secrets are distinct and stored outside Git.
- A named finance/admin owner reviews daily donation and expense reconciliation.
- Live payment launch has written founder/architect approval.

### Security, privacy, and moderation

- Privacy notice, donor consent language, retention/deletion process, and contact channel are approved.
- Public API and HTML have been checked for PII/minors-adjacent leakage.
- Admin 2FA recommendation, session expiry, backups, restore, and alerting are configured.
- Community posting/chat is disabled unless moderators, safeguarding escalation, Grievance Officer, guidelines, and retention policy are ready.
- Voting is disabled until verified-member workflow, rule selection, secret-ballot behavior, and race-condition tests pass.

### Operations and release

- Production environment variables are complete without exposing secrets to the browser.
- Database migrations and rollback/forward-fix plan are rehearsed.
- Monitoring alerts for webhook failures, error spikes, DB failures, receipt failures, and reconciliation age reach named recipients.
- Mobile/low-bandwidth QA, accessibility review, and smoke tests pass.
- Backup restore succeeds in a non-production environment.
- Launch owner, incident owner, and rollback decision-maker are documented.
- Soft launch cohort and support channel are confirmed.

## 8. Defect severity and release rule

A P0 defect blocks launch: incorrect financial total, duplicate donation, unverifiable successful payment, unauthorized PII exposure, child-safety publication, vote double-counting, or inability to recover the source ledger. A P1 defect blocks the affected module: broken receipt recovery, admin authorization flaw, moderation queue failure, or unusable mobile donation flow. P2 defects may ship only with an owner and date. No agent may downgrade a P0/P1 defect to meet a deadline without human approval.

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: https://razorpay.com/docs/webhooks/validate-test/ "Razorpay Docs — Validate and Test Webhooks"
[3]: https://razorpay.com/docs/webhooks/best-practices/ "Razorpay Docs — Webhook Best Practices"
