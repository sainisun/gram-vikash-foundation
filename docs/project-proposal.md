# Project Proposal

**Project:** Gram Vikash Foundation Transparent Donation & Impact Platform  
**Version:** 1.0 working draft  
**Owner:** Sunil, Founder  
**Prepared for:** Foundation leadership, engineering, volunteers, and implementation partners  
**Source:** [`PRD.md`](../PRD.md) [1]

> **Purpose.** This proposal translates the product requirements into a fundable and executable project brief. It is not a legal, tax, accounting, or fundraising compliance opinion; registration, 80G/12A, FCRA, payment onboarding, and privacy obligations require qualified professional review.

## Executive summary

Gram Vikash Foundation is a village-run charitable organization that provides free coaching for poor children, a community library, and kanyadan financial support for poor families’ daughters. The proposed platform will make trust visible: donors, beneficiaries, journalists, and the public will be able to inspect live, traceable donation and expense records instead of relying only on promises or periodic updates.

The project should launch with a focused **Donation & Transparency Platform**. It will include a mobile-first public website, Razorpay online payments, offline donation and expense entry, public ledgers, live summary metrics, program pages, an opt-in donor wall, email receipts, and a secure admin panel. A separate community and voting module is intentionally sequenced after the donation platform because it introduces materially higher identity, moderation, child-safety, and governance risk. [1]

## Why this project matters

Village-level charities often face a trust gap because donors cannot easily see how money moves from contribution to program outcome. This platform makes transparency structural by computing public totals from ledger records and exposing a traceable history of donations and expenses. The result is intended to increase repeat giving, improve local and diaspora confidence, simplify founder operations, and demonstrate program impact through verifiable metrics.

## Objectives and success measures

| Objective | Proposed measure |
|---|---|
| Make financial activity verifiable | 100% of donations and expenses visible or appropriately anonymized within 24 hours of transaction |
| Increase local and diaspora giving | Monthly donation volume and repeat-donor rate measured monthly |
| Show program impact | Coaching enrollment, library visits/books, and kanyadan cases supported tracked from approved source records |
| Reduce founder administration | A trained admin can record an expense from a phone in under 60 seconds |
| Reach mobile users | More than 70% of traffic from mobile and target page-load performance on 4G |
| Protect trust and privacy | No public minor-identifying disclosures; successful payments and receipts reconcile without duplicate entries |

These measures should be baselined during the first month after soft launch and reviewed monthly rather than treated as guaranteed outcomes. [1]

## Primary users

| User | Need | Platform response |
|---|---|---|
| Local/NRI donor | Donate securely, receive a receipt, and see money used well | Razorpay checkout, receipt email, donor consent, public ledgers |
| Village visitor/beneficiary family | Understand available coaching, library, and kanyadan support | Clear program pages, eligibility information, contact path |
| Founder/trusted volunteer admin | Record transactions and manage content quickly | Mobile admin forms, audit log, exports, dashboard |
| Public trust verifier | Confirm legitimacy and impact | Trust page, registration/audit documents, transparent totals, ledger history |

## Proposed scope

### Included in first release

The first release includes the public marketing and trust site; coaching, library, and kanyadan program pages; amount and program selection; Razorpay UPI/card/netbanking checkout; manual cash/cheque donation entry; expense entry with receipt upload; public donation and expense ledgers; summary totals; opt-in donor wall; PDF receipts by email; program content editing; admin authentication; audit logs; and CSV/PDF exports.

### Deliberately deferred

The second phase may add online kanyadan applications, instant push updates, WhatsApp notifications, automated 80G receipts, Hindi/English switching, and a volunteer attendance portal. Native mobile apps, FCRA/foreign contribution handling, and a full community/voting system are not part of the first launch. The community module should be treated as a separate program of work with its own moderation, identity, privacy, and governance approvals. [1]

## Delivery approach

The recommended delivery sequence is:

| Stage | Outcome | Indicative effort from PRD |
|---|---|---:|
| 0 | Finalize design and decisions | Prototype/design finalization marked done in PRD |
| 1 | Database, admin auth, manual donations and expenses | 1–2 weeks |
| 2 | Public site connected to live database | 1 week |
| 3 | Razorpay, webhook, and receipts | 3–5 days |
| 4 | Mobile/low-bandwidth QA and village soft launch | 3–5 days |
| Parallel | Trust paperwork, merchant onboarding, tax/compliance review | Starts immediately |

The timeline is an initial planning estimate, not a commitment. Merchant onboarding, registration documents, content approvals, payment review, and the availability of Sunil/trusted volunteers are critical-path dependencies.

## Technology approach

The baseline stack is Next.js/React with Tailwind CSS, managed PostgreSQL, Razorpay, private object storage, managed authentication, an email provider, and application/error monitoring. The platform should remain a modular monolith at first, with a separate worker introduced only when receipt delivery, reconciliation, media scanning, or compression needs justify it. All financial totals are computed from PostgreSQL ledger rows; no alternate counter or manually maintained total is allowed. [1]

## Trust, safety, and compliance commitments

The site will default donor display to Anonymous unless a donor explicitly opts in. It will show aggregate program impact rather than identifying children or vulnerable families. Kanyadan case information will be anonymized by default. Payment credentials will be handled by the payment gateway rather than stored by the application. Donor, applicant, member, and moderation data will be minimized, access-controlled, retained only under an approved policy, and subject to a documented incident process.

The foundation must resolve trust/society registration, Razorpay merchant onboarding, 80G/12A status, FCRA boundaries, privacy notices, guardian consent, data retention, and the Grievance Officer/moderator role before enabling the relevant features. These are launch dependencies, not post-launch polish.

## Key risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Payment webhook or database failure | Incorrect donation status or missed receipt | Signature verification, idempotency, retries, reconciliation, alerts, backups |
| Public privacy leak | Harm to donors, children, or vulnerable families | Explicit API projections, privacy review, consent workflow, least privilege |
| Founder/admin overload | Delayed expense entry and stale transparency | Thumb-friendly quick entry, volunteer roles, daily operating checklist |
| Legal/merchant onboarding delay | Online donations cannot launch | Start paperwork in parallel; use test mode; keep foreign/FCRA paths disabled |
| Community abuse or unsafe media | Harm and loss of trust | Postponed Phase B, quarantine/scanning, moderation queue, escalation playbook |
| Voting manipulation | Governance decisions lose legitimacy | Manual verification, database unique constraint, rate limiting, staged pilot |

## Decisions requested

Leadership should confirm the organization’s registration status, intended admins, domain/hosting plan, budget and timeline, offline versus online kanyadan intake for MVP, donor receipt wording, data-retention owner, and the sequence for community features. Before Phase C, leadership must choose the trending-proposal rule, voting verification method, Grievance Officer, moderators, and safeguarding escalation contacts.

## Proposed approval

Approve Phase A planning and implementation subject to legal/merchant onboarding work proceeding in parallel. Require written human review before live payments, before any public content involving minors or vulnerable families, before community posting/chat, and before voting. Measure the first release against the success indicators above and use the pilot to decide whether later modules are justified.

## Reference

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
