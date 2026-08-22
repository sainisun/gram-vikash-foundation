# Security and Privacy

**Project:** Gram Vikash Foundation  
**Status:** Working policy and engineering baseline — review before production use  
**Audience:** Founder, administrators, engineers, moderators, and AI coding agents  
**Sources:** [`PRD.md`](../PRD.md), [`database-schema.md`](database-schema.md) [1]

> **Working draft — review before relying on it.** This is an AI-prepared security and privacy baseline, not formal legal advice. A qualified Indian lawyer, privacy professional, and CA should confirm the foundation’s obligations, the applicability of the DPDP Act and IT Rules, tax/accounting retention requirements, FCRA boundaries, and the final public notices before launch.

## 1. Security objectives

The platform handles donation records, donor contact information, expense evidence, vulnerable-family information, community-generated content, and potentially children’s images. Security therefore has four priorities: preserve the accuracy and traceability of financial records; prevent unauthorized access to PII and case data; prevent publication of unsafe or identifying content about minors; and keep the public ledger available without presenting unverified or stale financial numbers as fact.

The foundation should act as a careful data custodian. Collect only fields needed for a specified purpose, show a clear notice, capture affirmative consent where consent is the processing basis, provide a withdrawal/request channel, and delete or anonymize data when the purpose ends unless a lawful retention obligation requires preservation. The DPDP Act defines a child as an individual who has not completed eighteen years and requires lawful processing, notice, appropriate safeguards, breach handling, and deletion when the purpose is no longer served subject to legal retention. [2]

## 2. Data classification

The database schema is not a public API. Every endpoint must select an explicit projection. The classifications below are the minimum baseline and should be refined with the foundation’s counsel and operational owner.

| Entity/fields | Classification | Public by design? | Required handling |
|---|---|---|---|
| `donors.name`, `email`, `phone` | PII / contact | No | Encrypt in transit and at rest where provider supports it; admin-only; redact logs |
| `donors.display_name_public`, `is_anonymous` | Consent-sensitive public profile | Only when opted in | Default to Anonymous; public display requires explicit affirmative checkbox |
| `donations.amount_paise`, `created_at`, approved program tag | Financial record; public ledger projection | Yes for successful rows, subject to policy | Preserve source row; expose amount/date/program, not donor contact or provider secrets |
| `donations.razorpay_*`, `provider_event_id` | Payment operational secret-adjacent | No | Server-only, strict admin access, redact logs, never expose raw payload |
| `donations.receipt_url` | Private document reference | No by default | Signed, short-lived access; donor self-access or admin audit |
| `expenses.amount_paise`, category, description, date | Financial record; public ledger projection | Usually yes after review | Avoid sensitive vendor/beneficiary details in description; expose approved receipt availability only |
| `expenses.receipt_image_url` | Sensitive document | No by default | Private object, admin access, malware scan, signed URLs, audit access |
| `programs.name`, `slug`, description, approved metrics | Public content | Yes | Content moderation/approval; no hidden beneficiary details in copy or metadata |
| `kanyadan_applications.family_name`, village, notes, sanctioned amount | Highly sensitive / vulnerable-family data | No | Admin-only, least privilege, case-level public display disabled by default |
| Kanyadan consent flag | Consent record | No | Keep with case audit; never infer consent from silence or an application alone |
| `admin_users.name`, email, role | Staff PII / authorization | No | Admin-only; least privilege; inactive rather than deleted when referenced by audit |
| `password_hash`, 2FA state | Credential/security data | No | Strong password hashing, secret manager, no logs, rotate/revoke on incident |
| `audit_logs` actor/entity/diff | Accountability record; may contain PII | No | Append-only application behavior, admin-only, redact secrets, protect from ordinary edits |
| `community_members.name`, phone, email, DOB, ward | PII; DOB is eligibility-sensitive | No | Phone verification, encrypted transport, strict member/admin projection, do not publish DOB |
| `verification_status`, reviewer, verification time | Eligibility-sensitive | No | Admin-only; voting service reads server-side; never accept client-supplied status |
| `posts.text`, media, author ID | User-generated content; potentially sensitive | Published subset only | Moderation state controls visibility; remove identifying minor content; retain minimal evidence |
| `comments.text`, author ID | User-generated content / PII link | Published subset only | Report, moderate, soft-remove; do not expose private account fields |
| `chat_messages` text/media/author | Real-time user content; sensitive | Published channel only | Public group chat only in MVP; persist for moderation; rate limit and soft-remove |
| `vote_issues` title/description/options/status | Public governance content after approval | Yes when published | Admin approval, immutable active options, no ballot identities |
| `votes.member_id`, selected option | Secret-ballot-sensitive | No | Strict server-side access; aggregate only in public results; unique constraint enforced |
| `poll_proposals` title/description/proposer | Community content with linked PII | Published subset only | Moderate spam/harassment; expose display name only under policy |
| `poll_proposal_upvotes.member_id` | Behavioral/eligibility data | No | Aggregate count only; unique key prevents duplicate upvote |
| `reports` reporter/reason/evidence | Sensitive moderation and safety data | No | Admin/moderator only; protect reporter identity; record resolution and escalation |

## 3. Authentication and authorization

### Donors

A donor may donate without a full account, but the system issues a short-lived donation-session token bound to the donation intent. That token can view only the corresponding status and receipt. An email or phone address is not sufficient by itself to authorize access to all donations associated with that contact. Public donor-wall display is a separate consent decision and defaults to Anonymous.

### Community members

Community registration is separate from the donor record. Phone verification and rate limiting are required before posting. An `unverified` member may browse and, if the community policy permits, post subject to moderation, but cannot vote. The voting service checks the session-derived member ID, active account status, verification status, age/eligibility decision, issue window, and suspension status on the server. A browser cannot set its own `member_id`, DOB, verification state, or role.

Manual admin verification is the recommended MVP approach in the PRD. Aadhaar/e-KYC should not be added as a shortcut: it would require separate provider, consent, privacy, and legal design. [1]

### Administrators

Admin sessions require secure cookies, CSRF protection for cookie-authenticated mutations, password hashing, rate-limited login, session expiry/revocation, and least-privilege role checks. Super-admin actions and 2FA enrollment should require stronger protection. Every expense, offline donation, content change, verification action, moderation action, and issue lifecycle change records the actor in the audit log.

### Authorization matrix

| Action | Public | Donor session | Community member | Verified member | Admin | Super-admin |
|---|---:|---:|---:|---:|---:|---:|
| Read approved programs/summary/ledgers | Yes | Yes | Yes | Yes | Yes | Yes |
| Read own receipt/status | No | Own only | No | No | Any, audited | Any, audited |
| Create online donation | Yes | Yes | Yes | Yes | Yes | Yes |
| Add offline donation/expense | No | No | No | No | Yes | Yes |
| Edit program content | No | No | No | No | Yes | Yes |
| Create post/comment/report | No | No | Yes | Yes | Optional support | Optional support |
| Cast vote | No | No | No | Yes | Not as a member | Not as a member |
| Review moderation queue | No | No | No | No | Yes | Yes |
| Change member verification | No | No | No | No | Yes, audited | Yes |
| Change roles/2FA policy | No | No | No | No | No/limited | Yes |

## 4. Payment security

Razorpay Checkout handles card/UPI/netbanking entry so those credentials must not touch the foundation’s servers. The application stores only the provider identifiers and the minimum metadata needed to reconcile the donation. Secret keys and webhook secrets belong in the deployment secret manager, never in Git, client JavaScript, screenshots, logs, or error messages.

The webhook endpoint must receive HTTPS traffic, validate the `X-Razorpay-Signature` HMAC-SHA256 value over the **raw** request body, use the provider event ID for idempotency, and handle duplicate/out-of-order delivery. A browser callback or displayed success screen is not sufficient to mark a donation successful. Razorpay’s documentation describes raw-body signature validation, duplicate-event handling, at-least-once delivery, and API verification for critical status checks. [3] [4]

Payment failure, DB failure, and missing-webhook reconciliation are defined in [`system-design.md`](system-design.md). A verified payment may be recorded exactly once; a receipt/email failure must not roll back a successful donation.

## 5. Minors and vulnerable-family data policy

The foundation must never publish a child’s full name, identifiable photograph, and family financial detail together. Public progress should use aggregate metrics such as children enrolled, library visits, books available, or cases supported. If photography is approved, prefer group/classroom images, obtain guardian consent through a documented process, and do not use an identifying caption. Do not publish school, address, phone number, exact village detail, or case narrative that makes a child or vulnerable family identifiable.

Kanyadan entries default to anonymized program-level ledger descriptions, such as “Kanyadan support,” without naming the bride or family. A written consent record, reviewed by the foundation’s safeguarding owner, is required before any case-level name or image is considered; consent does not override a safety risk. Public pages must never expose `kanyadan_applications` rows directly.

Moderators must not ask children to disclose more information, investigate suspected harm themselves, or circulate alleged evidence in public chat. They preserve only the minimum information needed to escalate through the foundation’s approved child-safety path and seek professional/authority guidance immediately.

The final notice and consent mechanism should be available in English and an appropriate Indian-language version. The DPDP Act requires clear notice and affirmative, specific consent where consent is the basis, and recognizes the parent/lawful guardian in relation to a child’s data. Counsel must confirm the final implementation and any rules that apply at launch. [2]

## 6. Retention, deletion, and correction

The following are **proposed operational defaults**, not legal retention advice. The foundation must map them against tax, accounting, payment-provider, employment, child-safeguarding, and applicable privacy obligations before publishing a final policy.

| Data class | Proposed default | Deletion/anonymization approach |
|---|---:|---|
| Pending/failed donation intent with no dispute | 180 days after closure | Delete contact fields or anonymize; retain minimal reconciliation reference if required |
| Successful donation and expense ledger | Duration required by accounting/tax/legal policy; provisional 8 years after financial close | Do not delete source rows casually; suppress unnecessary donor PII and use compensating corrections |
| Donor contact used for receipt | 8 years after last required financial record, subject to counsel | Remove or irreversibly tokenize contact fields once receipt/legal need ends |
| Receipt PDFs and expense evidence | Same as associated financial record unless a shorter policy is approved | Private deletion job with audit marker; retain only necessary metadata |
| Kanyadan application case data | Until case purpose and approved safeguarding/accounting period end; provisional 3 years after closure | Restrict first, then delete/anonymize with a documented case-owner decision |
| Community member account/profile | While active and for a short abuse/complaint window after closure; provisional 12 months | Delete profile PII while retaining non-identifying moderation/audit facts where justified |
| Posts/comments/chat media | Published life plus provisional 12-month moderation window | Remove public object; delete media after retention window; preserve minimal action record |
| Reports and moderation decisions | Provisional 3 years after closure | Restrict access; redact unnecessary reporter/evidence details |
| Individual votes | For the issue’s governance/audit period; provisional 3 years after closure | Aggregate results remain; delete or tokenize member linkage only after counsel-approved period |
| Backups | Daily/weekly retention per runbook | Expire through controlled backup lifecycle; legal hold pauses deletion |

Deletion requests should be acknowledged, identity-checked, triaged against legal/accounting/safeguarding holds, actioned by an authorized operator, and recorded without retaining the deleted payload. Withdrawal of consent should stop consent-based processing within a reasonable operational period unless another lawful basis or legal retention applies. The system should support correction of inaccurate contact/profile data without rewriting historical financial facts.

## 7. Upload security

Use private quarantine storage and a presigned upload flow with a short expiry. Validate extension, detected file type, declared MIME type, size, image dimensions, video duration/codec, and PDF structure. Reject executables, scripts, polyglot files, unsupported codecs, archive bombs, and oversized content. Scan with ClamAV or a reviewed cloud service before creating a public URL. Strip unnecessary image metadata where feasible, especially GPS metadata.

Use object keys generated by the server, not user filenames. Serve media through signed URLs or a controlled proxy with content-disposition and content-type headers. Community content remains `under_review` until the moderation policy allows publication. If later removed, revoke or privatize the object, soft-remove the record, and retain only the minimum moderation evidence.

## 8. Incident response

### Suspected data breach

1. The discoverer records the time, affected service, and safe request ID without forwarding secrets or sensitive content into chat.
2. The on-call admin isolates the affected route, object bucket, account, or credential; do not destroy evidence.
3. The architect and qualified legal/privacy contact classify the data, scope, likely users, and whether a provider or authority notification is required.
4. Rotate exposed credentials, revoke sessions, patch the issue, and preserve relevant audit/log evidence with restricted access.
5. Notify affected people and authorities when required by applicable law or approved counsel; use clear, factual language and do not speculate.
6. Restore normal operation only after tests confirm authorization, public projections, storage controls, and monitoring.
7. Complete a post-incident report with root cause, timeline, impact, correction, and prevention tasks.

### Payment discrepancy

Pause the affected automation if necessary, preserve the donation row and provider event IDs, compare Razorpay order/payment status with the database and admin records, and have a founder/finance owner approve any compensating entry. Never “fix” a discrepancy by editing a public total or deleting a transaction. If the webhook may have failed, run idempotent reconciliation and inspect provider delivery status.

### Child-safety incident

Immediately remove or restrict the public content while preserving a minimal internal reference, inform the designated safeguarding owner, and follow the foundation’s approved escalation to qualified child-protection professionals or authorities. Do not investigate independently, contact an alleged perpetrator, publish identifying details, or circulate images/evidence. The moderation playbook provides the operational flow.

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf "Ministry of Electronics and Information Technology — Digital Personal Data Protection Act, 2023"
[3]: https://razorpay.com/docs/webhooks/validate-test/ "Razorpay Docs — Validate and Test Webhooks"
[4]: https://razorpay.com/docs/webhooks/best-practices/ "Razorpay Docs — Webhook Best Practices"
