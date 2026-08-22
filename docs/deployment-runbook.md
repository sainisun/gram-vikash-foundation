# Deployment Runbook

**Project:** Gram Vikash Foundation  
**Target:** Vercel application + managed PostgreSQL + object storage  
**Status:** Working operational runbook — rehearse in staging before production  
**Sources:** [`architecture-design.md`](architecture-design.md), [`system-design.md`](system-design.md), [`PRD.md`](../PRD.md) [1]

> This runbook is for a donation system. Production deployment is not complete until payment, database, receipt, backup, monitoring, and rollback checks are performed. Keep Razorpay in test mode until the foundation’s merchant onboarding and human launch approval are complete.

## 1. Deployment environments

| Environment | Purpose | Payment mode | Data policy |
|---|---|---|---|
| Local | Developer work and fixtures | Razorpay test or mocked adapter | Synthetic data only |
| Preview | Pull-request review | Test mode | Ephemeral or non-sensitive fixtures |
| Staging | End-to-end rehearsal | Razorpay test mode | Synthetic donor/admin data; real production PII prohibited |
| Production | Live foundation service | Live mode after approval | Real data; restricted access and backups |

Use separate database instances or schemas, storage buckets, auth configuration, email credentials, and Razorpay webhook secrets for each environment. Never copy production donor, kanyadan, member, report, or private receipt data into preview or local environments.

## 2. Environment variable checklist

Store values in the hosting provider’s encrypted environment configuration. Commit only names and safe examples in `.env.example`; do not commit values.

| Variable | Required | Scope | Purpose |
|---|---:|---|---|
| `APP_BASE_URL` | Yes | Server | Canonical HTTPS origin for links and receipt URLs |
| `DATABASE_URL` | Yes | Server | Pooled application database connection |
| `DIRECT_DATABASE_URL` | Migration | Server/CI only | Direct connection for migrations where provider requires it |
| `AUTH_SECRET` | Yes | Server | Session signing/encryption secret |
| `AUTH_URL` | Yes | Server | Auth callback/canonical URL |
| `RAZORPAY_KEY_ID` | Yes for online donations | Public/server | Checkout identifier; only this non-secret identifier may reach the browser |
| `RAZORPAY_KEY_SECRET` | Yes for online donations | Server | Server-side order/API credential |
| `RAZORPAY_WEBHOOK_SECRET` | Yes for online donations | Server | Raw-body webhook HMAC validation |
| `RAZORPAY_MODE` | Yes | Server | `test` or `live`; deployment guard prevents accidental mismatch |
| `STORAGE_ENDPOINT` | Yes for files | Server | Object-storage endpoint |
| `STORAGE_BUCKET_PRIVATE` | Yes | Server | Private receipts, evidence, and sensitive files |
| `STORAGE_BUCKET_PUBLIC` | Optional | Server | Approved public program/community objects only |
| `STORAGE_ACCESS_KEY_ID` | Yes for files | Server | Storage access identity |
| `STORAGE_SECRET_ACCESS_KEY` | Yes for files | Server | Storage secret |
| `EMAIL_PROVIDER_API_KEY` | Yes for receipts | Server | Receipt and operations email provider |
| `EMAIL_FROM` | Yes for receipts | Server | Verified sender address |
| `SENTRY_DSN` | Recommended | Server/client as appropriate | Error monitoring; scrub PII before sending |
| `SENTRY_AUTH_TOKEN` | CI only | CI | Source-map upload if enabled |
| `RECONCILIATION_CRON_SECRET` | Yes for job | Server | Authenticate scheduled reconciliation endpoint |
| `ADMIN_BOOTSTRAP_TOKEN` | Temporary only | Server | One-time bootstrap, remove immediately after use |
| `COMMUNITY_FEATURE_FLAG` | Yes | Server/client | Keep Module 2 disabled until approved |
| `VOTING_FEATURE_FLAG` | Yes | Server/client | Keep voting disabled until Phase C approval |

The application must fail closed if production has `RAZORPAY_MODE=live` but required live secrets, webhook configuration, or launch approval metadata are missing. Log configuration names and validation status, never secret values.

## 3. Prerequisites and approvals

Before deployment, confirm the foundation’s legal identity, bank/PAN and merchant onboarding, approved donation/receipt copy, named admin operators, privacy notice, retention process, and incident contacts. The PRD identifies trust/society registration, Razorpay onboarding, and review of 80G/12A/FCRA matters as non-engineering dependencies; foreign contribution paths remain disabled until qualified legal advice approves them. [1]

Confirm that the repository’s CI passes, the database migration has been reviewed, the selected email/storage providers are available in the intended region/plan, the production domain has HTTPS, and the named founder/architect has approved the release checklist.

## 4. Initial managed-Postgres setup

1. Create a production database project with the selected managed provider and restrict administrative access to named operators.
2. Create application and migration credentials with the minimum required permissions. Do not use a superuser in the application runtime.
3. Configure connection pooling if the provider supports it and set the deployment connection limit conservatively for the expected village-scale traffic.
4. Enable automated backups and point-in-time recovery when available; configure the independent backup procedure described in [`system-design.md`](system-design.md).
5. Apply migrations in a controlled staging run first. Confirm that `votes` has `UNIQUE (issue_id, member_id)`, ledger amount checks exist, and financial foreign keys use the intended delete behavior.
6. Run schema smoke queries: successful raised total, expense total, balance, pending count, newest donation/expense, and audit-log append.
7. Record migration version, database provider, backup status, and last restore-test date in the release record.

## 5. Storage and email setup

Create separate private and approved-public buckets. Set object lifecycle rules only after the retention policy is approved. Configure presigned uploads with short expiry, server-generated object keys, content-type/size checks, quarantine for community media, and malware scanning before publication.

Configure a verified email sender and test receipt delivery to a controlled address. Confirm that a failed email does not roll back a successful donation, that retry state appears in admin, and that receipt links are short-lived/private. Do not put donor contacts, kanyadan case details, or payment payloads into email subject lines or third-party analytics.

## 6. Vercel/application deployment

1. Connect the repository to the Vercel project or equivalent Next.js host and select the production branch.
2. Set build and install commands according to the application package manager; enable strict TypeScript, lint, and test checks in CI before a production deploy is promoted.
3. Add environment variables to the correct environment scopes. Review every variable name, mode, and secret before saving.
4. Run the production build against a staging database or migration-safe preview. Do not run destructive seed data.
5. Apply database migrations through the approved migration pipeline before routing production traffic. If migration compatibility requires it, deploy additive schema first, then deploy code, then remove deprecated fields in a later release.
6. Configure the canonical domain and HTTPS. Confirm redirect behavior, security headers, cookie settings, and no preview domain is used in generated receipts.
7. Keep `COMMUNITY_FEATURE_FLAG=false` and `VOTING_FEATURE_FLAG=false` for Module 1 launch.
8. Promote the deployment only after staging smoke tests pass and the founder/architect signs the release record.

## 7. Razorpay setup and verification

Configure separate Test and Live webhook URLs on the Razorpay side. The webhook endpoint must be HTTPS, validate `X-Razorpay-Signature` over the raw body, record/check `x-razorpay-event-id`, and handle duplicate/out-of-order events. Razorpay recommends webhooks for asynchronous automation, API fetches for critical immediate status, and idempotent handling because duplicate deliveries can occur. [2] [3] [4]

Staging verification sequence:

1. Create a test order from the staging donation flow.
2. Complete a test payment and capture the webhook request metadata without logging the secret or full PII payload.
3. Confirm the signature is accepted, one donation becomes successful, one audit event exists, a receipt is queued, and public totals update after commit.
4. Replay the same webhook and confirm no second donation, receipt, or total increment.
5. Send an invalid-signature fixture and confirm no state change.
6. Simulate a database failure and verify provider retry/reconciliation behavior.
7. Test an aged pending donation and confirm the reconciliation report identifies it.
8. Only after written approval, switch the live deployment to live credentials and configure the live webhook URL.

## 8. Smoke tests after every production deploy

Run these checks from a controlled device and a mobile viewport:

- Public home page loads with an explicit generated timestamp and no hardcoded financial totals.
- Summary equals the approved database reconciliation query.
- Donation and expense ledgers paginate, filter, and display Anonymous correctly.
- Program pages and donation CTA work in English and the planned Hindi/Devanagari content path.
- Admin login, session expiry, Add Expense, offline donation, audit log, and export work for the intended role.
- Test or approved live checkout state is correct for the environment.
- Webhook endpoint returns the expected safe status for a valid test event and rejects an invalid signature.
- Receipt generation/email retry state is visible.
- Public HTML/JSON contains no donor email/phone, kanyadan private data, community DOB, or individual vote selection.
- Monitoring receives a deliberate test error in staging or the approved production alert test path.

## 9. Monitoring and alerting

Route alerts to a named technical owner and a backup owner; payment discrepancies also go to the founder/finance owner. Alert payloads should contain request IDs and safe identifiers, not donor PII, payment secrets, raw webhook bodies, or private media.

| Alert | Trigger | Initial response |
|---|---|---|
| Webhook signature failures | Any unexpected spike or repeated failures | Check endpoint, secret, deployment, replay attempts, and provider delivery log |
| Webhook non-2xx/timeouts | Any sustained failure; urgent if multiple events age | Inspect logs and DB health; restore endpoint; reconcile affected orders |
| Reconciliation backlog | Pending payments exceed approved age or job fails | Run controlled reconciliation; notify finance owner; do not inflate totals |
| Receipt delivery failures | Retry queue grows or one donor remains failed beyond SLA | Check email provider, regenerate/retry receipt, notify donor through approved channel |
| Application 5xx spike | Error rate above baseline | Roll back or disable affected feature; inspect release and database health |
| Database connection/latency | Pool exhaustion or sustained latency | Check provider, reduce non-critical load, fail safe for financial writes |
| Unauthorized admin attempts | Repeated login failures or role-denial spike | Lock/rotate affected account, inspect audit/security logs |
| Upload scan failures | Scanner unavailable or quarantine backlog grows | Keep files private; restore scanner or suspend uploads |
| Backup failure | Any missed scheduled backup | Open incident; retry and verify restore point before next release |
| Unexpected public-total drift | Reconciliation query differs from API | Disable cached layer if any, investigate code/data, never edit total manually |

## 10. Rollback procedure

### Application rollback

1. Declare the release incident and identify whether the failure affects payments, public reads, admin writes, or only a non-critical page.
2. If the new release can create incorrect financial records, disable the affected route or payment flow before rollback.
3. Roll back to the last known-good application deployment using the hosting provider’s immutable deployment history.
4. Do not automatically roll back database migrations that may already have accepted data. Use a backward-compatible forward fix or a reviewed restore plan.
5. Re-run summary, ledger, admin, webhook, receipt, and privacy smoke tests.
6. Reconcile provider orders/payments created during the incident and record any compensating entries under human finance approval.
7. Keep the incident log, deployment IDs, migration version, alert timeline, and decision owner.

### Database recovery

If data integrity is uncertain, stop financial writes, preserve logs, restore a backup/PITR copy to an isolated database, compare row counts and totals against Razorpay/admin records, and obtain founder/architect approval before switching. Follow the recovery steps in [`system-design.md`](system-design.md); never repair a discrepancy by hardcoding or editing the displayed balance.

## 11. Scheduled operations

Run reconciliation at least daily during the initial launch and more frequently if payment volume or pending age requires it. Review backup status, webhook delivery, receipt failures, admin audit events, error rate, and public summary consistency. Export or inspect a financial reconciliation report using an access-controlled admin workflow. Community moderation and voting schedules remain disabled until their phase gates are approved.

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: https://razorpay.com/docs/webhooks/ "Razorpay Docs — About Webhooks"
[3]: https://razorpay.com/docs/webhooks/validate-test/ "Razorpay Docs — Validate and Test Webhooks"
[4]: https://razorpay.com/docs/webhooks/best-practices/ "Razorpay Docs — Webhook Best Practices"
