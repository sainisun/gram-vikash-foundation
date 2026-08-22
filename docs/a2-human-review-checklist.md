# A2 Human Review Checklist

**Status:** Required before enabling live payments, treating offline ledger operations as production-ready, or beginning Phase B community work.

> This checklist records evidence to be reviewed; it does not grant a payment, privacy, moderation, or legal approval. [1]

## Required evidence

| Review area | Evidence to inspect | Approval outcome |
|---|---|---|
| Admin authorization | Named administrators, role assignments, denied-access behavior, and audited admin mutations | Confirm only appropriate staff can record or export financial data. |
| Offline accounting | Staging examples for cash/cheque entries, duplicate-submission handling, paise calculations, and derived public totals | Confirm operational entries match the foundation’s accounting process. |
| Privacy and public display | Member registration flow, anonymous donor projection, public ledger fields, and export field inventory | Confirm no contact details, private notes, restricted documents, or minor identifiers reach public views or exports. |
| Audit evidence | Audit rows for financial mutation and export preparation | Confirm actor, action, entity, timestamp, and safe metadata are retained. |
| Payment readiness | Merchant onboarding status, test-mode credentials, webhook-signature tests, receipt wording, reconciliation ownership, and launch decision | Decide whether a separate A4 staged test is authorized. Live keys remain disabled absent written approval. |
| Phase B readiness | Recorded moderation owner, Grievance Officer decision, community guidelines, retention controls, and safeguarding escalation route | Phase B must not begin without these named operational controls. |

## Current technical position

The platform supports public ledger projections, Member profile management, protected offline entry, and audited preparation of minimized CSV exports. Razorpay checkout, live webhook ingestion, automatic receipts, community posting, restricted voter-document review, and voting remain server-gated. [1]

## Sign-off record

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Founder / authorized owner |  | Approve / hold |  |  |
| Finance reviewer |  | Approve / hold |  |  |
| Privacy or safeguarding reviewer |  | Approve / hold |  |  |
| Technical architect |  | Approve / hold |  |  |

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
