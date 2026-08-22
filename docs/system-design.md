# System Design

**Project:** Gram Vikash Foundation  
**Status:** Implementation baseline  
**Audience:** Backend engineers, frontend engineers, AI coding agents, and reviewers  
**Prerequisites:** [`architecture-design.md`](architecture-design.md), [`PRD.md`](../PRD.md)

> This document resolves the lower-level decisions that the high-level architecture leaves open. It favors a small, auditable system over premature infrastructure: PostgreSQL is the financial source of truth, the Phase 1 dashboard polls, and every money- or vote-sensitive mutation is transactional and reviewable.

## 1. Database choice and expected scale

Use **managed PostgreSQL** through Supabase, Neon, or an equivalent provider. The PRD requires relational integrity for donations, expenses, programs, audit logs, and the one-vote-per-member rule; PostgreSQL provides foreign keys, check constraints, unique constraints, transactions, row locks, and mature backup tooling in one operational surface. [1]

The initial scale assumption is village-level usage: dozens to low hundreds of concurrent visitors, a small number of administrators, and low-to-moderate daily ledger mutations. The platform should be optimized for fast indexed reads and safe writes, not sharded databases, event-sourcing infrastructure, or a distributed cache. A single managed database with connection pooling, reasonable indexes, and scheduled backups is the correct starting point. Revisit the design only after observed traffic, ledger volume, or community-media volume justifies it.

All internal monetary values use `BIGINT amount_paise`, never floating-point rupees. Formatting into `₹` and decimal rupees happens only at the display boundary. A donation and its payment metadata are distinct from a receipt-delivery attempt so that a temporary email failure cannot alter the financial record.

## 2. Transaction and consistency rules

Every financial mutation runs in a database transaction. The successful Razorpay webhook transaction locks the matching donation intent, verifies that the state transition is allowed, stores the provider payment ID, writes an audit event, and commits once. Offline donation and expense creation perform validation, insert the ledger row, and write the audit event in the same transaction. There is no manual “total” field that can drift away from the rows.

Public summary and ledger reads should use a consistent database snapshot where the provider supports it. Summary queries include only successful donations and valid expenses, order ledger pagination by `(created_at DESC, id DESC)`, and use a stable cursor or a page query with a deterministic tie-breaker. For a small dataset, offset pagination is acceptable in the first release; cursor pagination should be preferred once records become large enough for offset scans to matter.

Use soft deletion or status transitions for financial records. A mistaken expense is corrected with a compensating entry or a controlled reversal process, not by deleting the source row. Any exceptional correction requires an authorized admin, a reason, and an audit diff. Programs should be archived rather than deleted if referenced by a donation or expense.

## 3. Caching strategy

The canonical dashboard query always reads ledger tables directly. A cache, if introduced, is only a performance layer and must never be treated as the financial record. Phase 1 should begin with database-backed requests and ordinary HTTP caching disabled for personalized/admin responses.

| Endpoint or view | Phase 1 policy | Later option |
|---|---|---|
| `/api/summary` | Query PostgreSQL directly; poll every 30–60 seconds; include `generated_at` | Short TTL response cache with mutation invalidation and visible freshness timestamp |
| Public donation ledger | Indexed database query; paginate; cache only anonymous pages if headers and invalidation are correct | CDN cache for page fragments with a very short TTL |
| Public expense ledger | Same as donation ledger; receipt URLs remain controlled | CDN for non-sensitive metadata only |
| Program content | Read from database or CMS table; cache after publish | ISR/revalidation on content mutation |
| Admin dashboard | No shared cache; authenticated request | Per-user client cache with explicit invalidation |
| Vote results | Database aggregation after every cast; no stale result presented as final | Short client refresh interval or SSE after integrity is proven |
| Chat messages | Provider-managed realtime stream; persist the canonical message state | Provider-specific presence and delivery features |

If a summary cache is used, every successful donation, expense, reversal, or status correction must invalidate it after commit. Cache invalidation failures must trigger an alert and a manual refresh path; they must not overwrite or mutate ledger rows. A stale response should be labeled with its generation time rather than silently presented as live.

## 4. Polling versus WebSocket/SSE

The PRD’s Phase 1 plan is polling: the browser fetches `/api/summary` every 30–60 seconds, while the full ledger is loaded initially and refreshed manually. This is sufficient for expected traffic and is easier to observe, test, deploy, and recover than a persistent push channel. [1]

| Consideration | Polling, Phase 1 | WebSocket/SSE, Phase 2 |
|---|---|---|
| Implementation | Simple HTTP endpoint and timer | Connection lifecycle, fan-out, reconnect, auth, backpressure |
| User freshness | Up to the polling interval unless manually refreshed | Near-instant push |
| Dozens/low hundreds concurrent users | Predictable and inexpensive | Works, but adds complexity without clear need |
| Mobile networks | Requests can resume after sleep or connectivity loss | Requires reconnect and offline-state handling |
| Failure handling | Each request independently retries or shows unavailable state | Must recover dropped streams and replay missed events |
| Data authority | Each response reads PostgreSQL | Push payload still needs database-backed authority |
| Recommended use | Summary totals and public ledgers | Chat and, only later, dashboard updates if engagement justifies it |

A future SSE implementation should push an invalidation signal, not an untrusted replacement total; the client then refetches `/api/summary`. This keeps the database query as the source of truth and makes reconnect behavior safe.

## 5. Vote integrity design

Voting is enabled only after the community-member verification process and moderation operation are approved. A member may browse and post while unverified, but the cast-vote service requires `verification_status = 'verified'`, an age/eligibility decision recorded by an admin, an active account, and an active issue window.

The `votes` table must enforce `UNIQUE (issue_id, member_id)`. The API may first check for an existing vote to provide a friendly response, but the insert itself is the integrity guarantee. Two concurrent requests can pass a pre-check; only the database constraint reliably prevents both from being accepted. The service catches the unique-violation error, rolls back the transaction, and returns `409 Conflict`.

Additional controls are layered rather than substituted for the constraint:

1. Use authenticated community-member sessions with a verified account ID; never accept `member_id` from a browser request as authority.
2. Validate that the issue is active and the option belongs to the issue inside the transaction.
3. Apply per-account and per-IP rate limits, with CAPTCHA or stepped-up verification if automated abuse is detected.
4. Store issue start/end timestamps in UTC and evaluate them server-side.
5. Keep individual vote selections private by default; expose only aggregate counts.
6. Record issue lifecycle changes, option changes before activation, verification actions, suspicious-rate alerts, and moderation actions in the audit log.
7. Never permit an admin UI or import script to bypass the unique constraint. Any correction must use a reviewed migration or documented administrative procedure.

## 6. Moderation and media pipeline

All community uploads begin in a private quarantine area. A public URL is not generated until the file passes validation and the content policy allows publication.

```text
Upload request
  -> authenticate + rate limit
  -> validate declared type, extension, size, and dimensions/duration
  -> store in private quarantine
  -> malware scan
  -> create under_review record + audit event
  -> moderator review, or controlled post-publish review for low-risk text
  -> publish with controlled URL OR remove/reject
  -> retain decision, actor, reason, and timestamp
```

Images, videos, and PDFs require file-type sniffing rather than trusting the filename or browser MIME type. Reject executable content, polyglots, oversized files, and media with unsupported codecs. Video compression can be added after the initial release through a managed service or worker; the original should remain private and access-controlled.

Children’s images and kanyadan-related materials are high-risk. They require guardian consent on file, a group/classroom framing where possible, and no identifying caption that combines name, image, and financial detail. The public application should show aggregate impact rather than case-level sensitive details. [1]

Use **soft removal** for already-published content: set status to `removed`, revoke public URLs or make the object private, preserve a minimal evidence record, and retain the moderator’s reason in the audit log. Do not silently hard-delete the audit trail. Hard deletion of the underlying media may occur under a documented retention or legal request process, but the system should retain that a moderation action occurred without retaining unnecessary personal content.

## 7. Payment failure and reconciliation design

Razorpay webhook delivery is asynchronous, may be retried, and may arrive more than once or out of order. Razorpay recommends validating the raw-body signature, using the unique event ID for idempotency, and using API fetches when an immediate critical status is required. [2] [3]

| Failure mode | Required behavior |
|---|---|
| Webhook never arrives | Keep donation intent `pending`; scheduled reconciliation fetches order/payment status from Razorpay and creates an admin exception if unresolved |
| Signature invalid | Reject with non-success response, log security event without sensitive payload, do not change donation status |
| Duplicate webhook | Detect provider event ID or already-applied payment ID; return success without a second donation or receipt |
| Event arrives out of order | Apply only valid state transitions; ignore stale transitions; fetch current provider state when necessary |
| Payment succeeds, DB write fails | Return non-2xx so Razorpay retries; if the response is ambiguous, reconciliation locates the payment by order ID/payment ID and applies an idempotent transaction |
| DB commits, receipt fails | Keep donation successful; mark receipt delivery pending/failed and retry independently |
| Payment remains pending | Show a clear donor status, do not count it as raised, retry provider fetch, and route aged intents to admin review |
| Razorpay unavailable | Leave existing records intact; disable or clearly label new checkout attempts; retry only through controlled backoff |
| Refund or reversal | Record a compensating/reversal transaction or dedicated status according to approved accounting policy; never rewrite historical source data silently |

Razorpay may retry a webhook for delivery failures and may disable a webhook after prolonged failure, so monitoring must alert on non-2xx responses, signature failures, reconciliation age, and provider dashboard status. [4]

## 8. Backups and disaster recovery

Enable managed PostgreSQL point-in-time recovery where available, plus an independent encrypted logical backup at least daily. Retain daily backups for 30 days and a weekly backup for at least 12 weeks as an initial operational policy, subject to the provider plan and the foundation’s legal/accounting retention requirements. Store backup credentials separately from application credentials and restrict restore access.

The recovery procedure is:

1. Declare the incident and stop financial writes if data integrity is uncertain.
2. Record the last known good timestamp, provider payment exceptions, and current deployment version.
3. Restore a copy to a separate database and run schema, checksum, row-count, and summary reconciliation checks.
4. Compare donations and expenses against Razorpay exports, offline admin records, and the audit log.
5. Obtain human approval from the founder/architect before switching production traffic.
6. Rotate credentials if compromise is suspected, restore the application, and run smoke tests for public summary, ledger, admin login, and webhook verification.
7. Communicate any donor-facing impact and retain an incident report with timestamps, decisions, and follow-up actions.

Target an initial **RPO of 24 hours or better** from daily backups and an **RTO of one business day** for a non-catastrophic provider outage; improve these targets only when budget and operational maturity support them. Test a restore at least quarterly and after material schema changes.

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: https://razorpay.com/docs/webhooks/ "Razorpay Docs — About Webhooks"
[3]: https://razorpay.com/docs/webhooks/validate-test/ "Razorpay Docs — Validate and Test Webhooks"
[4]: https://razorpay.com/docs/webhooks/best-practices/ "Razorpay Docs — Webhook Best Practices"
