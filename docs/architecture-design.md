# Architecture Design

**Project:** Gram Vikash Foundation Transparent Donation & Impact Platform  
**Status:** Implementation baseline  
**Audience:** Engineers and AI coding agents working under human review  
**Source of truth:** [`PRD.md`](../PRD.md) [1]

> This document defines the system boundaries, critical data flows, and implementation placement for the donation/transparency platform and the later community/voting module. It is a build guide rather than a conceptual architecture essay.

## 1. Architectural posture

The platform should begin as a **modular Next.js monolith** backed by PostgreSQL. The expected audience is village-scale traffic with local and diaspora donors, so a single deployable application minimizes operational overhead while preserving strong relational guarantees for money, audit records, and voting. Modules should be separated in code and by domain boundaries even though they share one runtime and database.

The architecture has two release surfaces. **Module 1** is the launch-critical registration-gated donation, ledger, program, receipt, and administration system. **Module 2** adds community posts, public group chat, moderation, and eventually voting; it must remain feature-flagged or separately route-gated until moderation and document-based voter verification processes are approved. One unified `Member` identity is used for donation and community access; public anonymity controls donor-wall display only. These boundaries follow the PRD’s recommendation to stabilize the donation platform before adding community and voting features. [1]

## 2. Component diagram

```text
                                    +-------------------------+
                                    |  Admin / Volunteer UI    |
                                    |  authenticated routes    |
                                    +------------+--------------+
                                                 |
+------------------+       HTTPS                v
| Donor / Public   | ----------------> +--------+---------+
| mobile browser   |                    | Next.js app      |
+------------------+ <---------------- |                  |
       |                               |  SSR pages        |
       |                               |  public API       |
       |                               |  admin API        |
       |                               |  webhook handler  |
       |                               |  auth/session     |
       |                               +---+----+----+-----+
       |                                   |    |    |
       |                                   |    |    +------------------+
       |                                   |    |                       |
       v                                   v    v                       v
+------+---------+                  +------+----+-----+      +----------+---------+
| Razorpay       |<-- Checkout ---> | PostgreSQL       |      | Object storage     |
| Checkout/API   |                  | source of truth |      | R2/Supabase        |
+------+---------+                  +------+-----------+      | receipts/photos   |
       |                                   |                  +----------+---------+
       | webhook                            |                             ^
       v                                   |                             |
+------+---------+                         |                             |
| Razorpay       | ------------------------+                             |
| webhook POST   |  verified, idempotent                                  |
+----------------+                                                        |

Module 2 (enabled only after approval):

+------------------+       +----------------------+       +-------------------+
| Community pages  | ----> | Realtime adapter     | ----> | Supabase Realtime |
| posts/comments   |       | chat/presence        |       | or Firebase       |
+--------+---------+       +----------------------+       +-------------------+
         |
         v
+--------+---------+       +----------------------+       +-------------------+
| Upload service   | ----> | Malware scan         | ----> | Moderation queue  |
| size/type check  |       | ClamAV/cloud API     |       | admin review      |
+------------------+       +----------------------+       +-------------------+
```

## 3. Service boundaries

| Boundary | Responsibilities | Phase | Placement and rationale |
|---|---|---:|---|
| Web presentation | Public pages, program pages, ledger views, donor flow, admin screens, responsive layout | 1 | Next.js App Router pages and shared components; SSR/streaming where useful for fast mobile loads |
| Application/API | Validation, authorization, ledger queries, summary aggregation, admin commands, receipts, exports | 1 | Next.js route handlers or a small internal service layer; one codebase keeps agent implementation simple |
| Payment adapter | Create Razorpay orders, verify client confirmation, consume webhooks, map payment states | 1 | Server-only module under `src/server/payments/`; no secret or payment-signature logic in browser code |
| Financial database | Members, donations, expenses, programs, audit records and immutable source values | 1 | Managed PostgreSQL; all totals are derived from this source of truth [1] |
| File storage | Receipt PDFs, expense receipts, program photos, community media | 1/2 | Private buckets for sensitive files; signed URLs or controlled proxy for authorized access |
| Authentication and authorization | Admin sessions, unified Member identity, role checks, restricted voter-document verification | 1/2 | NextAuth.js or Supabase Auth with application-level authorization checks |
| Receipt/email adapter | Generate a PDF receipt and deliver it by email | 1 | Server-side job/service invoked after a committed successful donation; failures remain retryable |
| Realtime adapter | Public summary polling in Phase 1; chat and eventual push updates in Phase 2 | 1/2 | Polling is deliberately kept in the monolith first; use Supabase Realtime/Firebase only for Module 2 chat if approved |
| Moderation pipeline | Scan uploads, queue review, publish/remove content, retain audit evidence | 2 | Application workflow plus scanner and object-storage quarantine area; no public media URL before required checks |
| Observability | Error tracking, payment/webhook alerts, request logs, admin audit log | 1 | Sentry/Vercel monitoring plus database audit records; money-related failures must be visible immediately [1] |

A separate microservice is **not required** for Phase 1. A worker process may be introduced later for receipt email, reconciliation, media scanning, and video compression if asynchronous volume or execution limits justify it. The worker must communicate through durable database state or a queue; it must not maintain an alternate financial ledger.

## 4. Critical flow A: donation to receipt

1. A visitor selects an amount and optional program earmark on the public donation page. Before payment, the visitor must register or log in as a `Member` with name, phone/email, password, date of birth, and village/ward affiliation; there is no guest or anonymous checkout. Amounts are converted to **paise** before any server request and validated as positive integers.
2. The authenticated server creates a pending donation intent linked to the Member and a Razorpay order using server-held credentials. The application stores the internal donation ID and Razorpay order ID, but never receives card, UPI, or bank credentials.
3. The browser opens Razorpay Checkout with the order ID. The browser may show an immediate success state only after the client response is locally validated and the server is consulted; the webhook remains authoritative for server-side state transition.
4. Razorpay sends an HTTPS webhook such as `order.paid` or the relevant payment event to `/api/donations/webhook`. Razorpay documents webhooks as asynchronous server-to-server notifications and recommends API verification for critical instant confirmation flows. [2]
5. The webhook handler reads the **raw request body**, verifies the `X-Razorpay-Signature` HMAC-SHA256 signature, and checks the unique event identifier. Signature verification must occur before parsing or acting on the payload. [3]
6. The handler starts a database transaction, locks the matching donation intent, and applies an idempotent state transition. A duplicate event returns a successful response without creating a second donation.
7. On a verified successful payment, the transaction records the payment ID, marks the donation successful, writes the audit event, and commits. Summary totals and public ledgers subsequently read this record directly.
8. A post-commit receipt operation creates the PDF and sends email. Receipt failure does not roll back the donation; it marks delivery as retryable and alerts the admin.
9. The public summary endpoint computes total raised, total spent, balance, and donor count from eligible ledger rows. It must not read a manually maintained total.
10. If the webhook is missing or contradictory, reconciliation fetches the Razorpay order/payment status and presents an exception to an authorized admin rather than silently altering the ledger.

## 5. Critical flow B: vote cast and result

1. A registered Member signs in and requests a vote issue. The server checks that the issue is active, the Member has Tier 2 `voter_verified` status based on an approved restricted ID-document review, the Member is at least 18 under the project’s verification policy, and the account is not suspended.
2. The server validates the selected option against the issue’s server-side option list, applies rate limits/CAPTCHA where configured, and starts a database transaction.
3. The server inserts one row into `Vote`. A unique constraint on `(issue_id, member_id)` is the final integrity barrier; application checks are useful for a friendly message but are not sufficient on their own.
4. If the unique constraint rejects the insert, the transaction rolls back and the API returns a conflict response without changing any count.
5. After commit, result queries aggregate votes by option for the issue. Individual member-to-option attribution is not returned by default.
6. The client refreshes results through polling in the initial implementation or a future push adapter. The result endpoint must filter by issue and current status and must not expose private Member identity fields or ID-document metadata.
7. The audit log records issue lifecycle and moderation actions, but secret-ballot vote rows are not copied into public analytics or donor-facing pages.

## 6. Live dashboard numbers

The dashboard’s canonical values are derived on every request from the source tables:

```sql
SELECT
  COALESCE((SELECT SUM(amount_paise) FROM donations WHERE status = 'success'), 0) AS total_raised_paise,
  COALESCE((SELECT SUM(amount_paise) FROM expenses), 0) AS total_spent_paise,
  COALESCE((SELECT SUM(amount_paise) FROM donations WHERE status = 'success'), 0)
    - COALESCE((SELECT SUM(amount_paise) FROM expenses), 0) AS balance_paise,
  (SELECT COUNT(DISTINCT member_id) FROM donations WHERE status = 'success') AS donor_count;
```

The production implementation should consolidate this into one parameterized query or database view and use a consistent transaction snapshot. It must never use hardcoded values, mutable counters, an eventually consistent analytics store, or a cache as the source of truth. A short-lived response cache may be added only if it is invalidated after every committed ledger mutation and the response clearly identifies its refresh time; the default Phase 1 approach is a lightweight `/api/summary` poll every 30–60 seconds, with manual ledger refresh. [1]

## 7. Third-party dependencies and failure behavior

| Dependency | Used for | Failure behavior |
|---|---|---|
| Razorpay | Checkout, order/payment status, webhook events | New online donations are paused or shown as unavailable; pending intents remain reconcilable; never mark a payment successful from an unverified browser-only result |
| Managed PostgreSQL | Financial and application source of truth | Public financial actions fail closed; read-only pages may show an explicit unavailable state rather than stale totals |
| Object storage | Receipts, evidence, photos, and media | Ledger entries remain intact; upload/receipt delivery is retried; private URLs are never replaced with public guesses |
| Auth provider | Admin/community sessions | Existing sessions follow expiry policy; new privileged actions fail closed |
| Email provider | Donation receipts and operational notices | Donation remains recorded; receipt delivery is queued/retried and surfaced in admin UI |
| Realtime provider | Module 2 chat and later push updates | Community chat becomes read-only/unavailable with an explicit status; core donations and ledger remain independent |
| Malware scanner | Uploaded community and receipt files | New media remains quarantined and cannot publish until a successful scan or manual override by an authorized reviewer |
| Sentry/monitoring | Operational alerts | Application continues, but alerts are mirrored to a configured operations email and checked during daily reconciliation |

## 8. Explicit Phase 1 non-goals

Phase 1 deliberately does not accept FCRA/foreign contributions or enable international payment paths without legal approval; does not ship a native iOS/Android application; does not implement WebSocket/SSE dashboard updates; does not publish individual kanyadan family identities; does not provide public individual vote attribution; and does not offer private direct messaging. These are scope, safety, or legal boundaries from the PRD, not deferred UI polish. [1]

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: https://razorpay.com/docs/webhooks/ "Razorpay Docs — About Webhooks"
[3]: https://razorpay.com/docs/webhooks/validate-test/ "Razorpay Docs — Validate and Test Webhooks"
