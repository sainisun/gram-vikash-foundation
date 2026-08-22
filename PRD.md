# PRD — ग्राम विकास फाउंडेशन (Village Development Foundation)
### Transparent Donation & Impact Platform — Full-Stack Website

**Version:** 1.1
**Owner:** Sunil (Founder)
**Prepared for:** Engineering execution (AI coding agents — Codex/Gemini) with Claude as architect/reviewer
**Date:** 22 Aug 2026

---

## 1. Vision & Problem Statement

A village-run charitable foundation providing free coaching for poor children, a free community library, and kanyadan (wedding) financial support for poor families' daughters. The core differentiator is **radical, real-time financial transparency** — every rupee donated and every rupee spent is visible to the public, live, with donor and expense attribution.

**Problem this solves:** Village-level charities in India struggle with donor trust because money flow is opaque. This platform makes trust structural, not promised — donors can verify impact themselves at any time.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Build donor trust through transparency | 100% of donations & expenses visible within 24 hrs of transaction |
| Grow recurring local + diaspora donations | Monthly donation volume, repeat-donor rate |
| Track program impact | # children enrolled in coaching, # library visits/books, # kanyadan cases supported |
| Operational simplicity for founder | Admin can log an expense in <60 seconds from phone |
| Mobile-first reach (village + diaspora) | >70% traffic mobile, page load <2.5s on 4G |

---

## 3. Users & Personas

1. **Registered Member (local donor, NRI donor, or village resident/community participant)** — must create one account with name, phone/email, password, date of birth, and village/ward affiliation. A Member can donate and, when community features are enabled, post, comment, and chat; voting requires the higher voter-verification tier. Community participation is intended for village-affiliated people, and admins may manually enforce that policy by suspending accounts that are not actually village-affiliated.
2. **Village visitor / beneficiary family** — wants to know what's available (coaching seats, library hours, kanyadan application process).
3. **Admin (Sunil + 1-2 trusted volunteers)** — manages Member accounts and verification, logs donations (for offline/cash gifts), logs expenses, manages program content, approves kanyadan applications, and moderates the community module.
4. **Public/general visitor** — journalists, other NGOs, general trust-verification browsing. Public visitors may browse approved content, but donation and community participation require Member registration.

---

## 4. Scope

### MVP (Phase 1 — ship first)
- Public marketing site (all sections from approved design prototype)
- Mandatory Member registration and authentication before any donation; no guest or anonymous checkout path
- Online donation via Razorpay (UPI/cards/netbanking)
- Manual expense + offline-donation entry via admin panel, associated with a registered Member
- Live public ledger (donations + expenses) — polling-based, not full websocket
- Donor wall (opt-in name display, opt-out to "Anonymous")
- Auto-generated donation receipt (PDF via email)
- Basic program pages (Coaching / Library / Kanyadan) with static+editable content
- Admin authentication (single/multi-admin, role: super-admin)

### Phase 2
- Real-time (websocket) live-updating dashboard instead of polling
- Kanyadan application workflow (family applies → admin reviews → approved → funded, with privacy safeguards)
- WhatsApp notifications to donors on receipt
- 80G tax receipt automation (if registration secured)
- Multi-language toggle (Hindi/English)
- Volunteer/coaching-teacher portal for attendance logging

### Out of scope (for now)
- FCRA/foreign contribution handling (requires separate legal registration — flag as blocker, see §10)
- Mobile app (site will be responsive PWA-capable instead)

### Deliberate registration tradeoff

Mandatory registration before donation is a deliberate founder decision in favor of a unified village community, stronger trust, accountable donor identity, and future community access. It may reduce donation conversion, especially for first-time donors and NRI donors who often prefer a minimal-friction checkout. This conversion risk should be measured after launch, but the platform must not reintroduce guest or anonymous checkout without revisiting the underlying trust and community decision.

---

## 5. Functional Requirements

### 5.1 Public Website
- FR1: Home page with live totals (total raised, total spent, balance, donor count)
- FR2: Program pages — Coaching, Library, Kanyadan — each with description, progress metrics, photo gallery (adult-safe imagery only, see §9)
- FR3: Donate flow — amount selection (preset + custom), program earmarking (optional: "donate to Kanyadan specifically" vs general fund), authenticated Member account, payment via Razorpay checkout. If unauthenticated, the user must register or log in before payment; guest/anonymous checkout is not supported.
- FR4: Live Transparency Dashboard — total in / total out / balance, updated on each new transaction (§7 for refresh mechanism)
- FR5: Donation Ledger (public) — paginated list: date, Member public display name (or "Anonymous"), amount, program tag
- FR6: Expense Ledger (public) — paginated list: date, description, category/program tag, amount, optional receipt image/PDF link
- FR7: Donor Wall — recent/top donors, opt-in display
- FR8: About/Trust page — registration number, audit reports (downloadable PDFs), founder note, contact info
- FR9: Kanyadan info page — eligibility, how families apply, past cases shown in aggregate (no identifying minor details, see §9)

### 5.2 Donation & Payment
- FR10: Razorpay integration — support UPI, cards, netbanking, wallets
- FR10a: Donation checkout requires an authenticated Member session; unauthenticated users are redirected to register/login before payment. Guest or anonymous checkout is not supported.
- FR11: On successful payment → auto-create donation record → auto-generate PDF receipt → email to donor
- FR12: Failed/pending payment states handled gracefully with retry option
- FR13: Admin can manually log offline (cash/cheque) donations only for an existing registered Member; an unregistered donor must complete registration before the donation is recorded. The Member may still opt out of public name display, and the entry appears identically on the public ledger.

### 5.3 Admin Panel
- FR14: Secure login (email+password, 2FA recommended for super-admin)
- FR15: Dashboard: today's donations, pending kanyadan applications, quick "Add Expense" button
- FR16: Expense entry form: date, amount, category (Coaching/Library/Kanyadan/Admin), description, optional receipt photo upload
- FR17: Donation entry form (for offline gifts): select an existing registered Member, amount, program, date, payment mode; public anonymity controls display only and never bypasses registration
- FR18: Content management for program pages (edit descriptions, upload photos, update progress numbers)
- FR19: Kanyadan application review queue (Phase 2)
- FR20: Export ledger (donations + expenses) as CSV/PDF for offline audit

### 5.4 Notifications
- FR21: Email receipt on donation (Phase 1)
- FR22: WhatsApp confirmation (Phase 2, via WhatsApp Business API or Twilio)

---

## 6. Non-Functional Requirements

- **Performance:** First Contentful Paint <2s, Time to Interactive <3.5s on mid-range 4G Android (this is the dominant device profile for the audience)
- **Availability:** 99.5% uptime target; ledger data must never silently fail to update
- **Mobile-first:** Design and test mobile viewport first; desktop is secondary
- **Accessibility:** Devanagari font legibility at small sizes tested; sufficient color contrast (esp. ledger red/green amounts)
- **Data integrity:** Every rupee shown publicly must be traceable to a source record — no manual override of totals; totals are always computed live from the ledger, never hardcoded
- **Auditability:** All admin actions (expense/donation entry, edits) logged with timestamp + admin identity (immutable audit log)

---

## 7. Real-Time Update Mechanism

- **Phase 1 (MVP):** Client polls a lightweight `/api/summary` endpoint every 30–60s for updated totals; full ledger list fetched on page load + manual refresh. Simple, cheap, sufficient for expected traffic volume.
- **Phase 2:** Move to WebSocket/Server-Sent Events for instant push updates on the dashboard, if traffic/engagement justifies the added complexity.

---

## 8. Data Model (high-level)

**Member**
`id, auth_user_id (managed by the authentication provider), name, phone, email, dob, village_ward, display_name_public (nullable → "Anonymous"), is_anonymous (bool), verification_tier (registered/voter_verified), id_document_url (encrypted/restricted), id_document_type, verified_by_admin_id, verified_at, created_at`

Registration requires a password managed by the authentication provider; plaintext passwords must never be stored in or exposed by the Member record. One unified Member account is used for donation and community access. Tier `registered` permits donation, posting, commenting, and chatting; tier `voter_verified` is required before voting, subject to the 18+ rule.

**Donation**
`id, member_id, amount, program_id (nullable = general fund), payment_mode (razorpay/cash/cheque), razorpay_payment_id (nullable), status (success/pending/failed), receipt_url, created_at, entered_by_admin_id (nullable, for offline entries)`

**Expense**
`id, amount, category (coaching/library/kanyadan/admin), description, receipt_image_url (nullable), program_id (nullable), entered_by_admin_id, created_at`

**Program**
`id, name, slug, description, cover_image_url, target_metric (e.g. "100 children"), current_metric_value`

**KanyadanApplication** (Phase 2)
`id, family_name (private), village, application_date, status (pending/approved/funded/rejected), amount_sanctioned, reviewed_by_admin_id — NOTE: public-facing display shows only aggregate counts, never individual family/child identifying data without explicit written guardian consent`

**AdminUser**
`id, name, email, password_hash, role (super_admin/editor), 2fa_enabled`

**AuditLog**
`id, admin_id, action_type, entity_type, entity_id, timestamp, diff_json`

---

## 9. Privacy, Safety & Compliance (critical — do not deprioritize)

- **Minors' data protection:** Children benefiting from coaching, and girls benefiting from kanyadan, are minors or from vulnerable families. The public site must **never** publish a child's full name + photo + family financial detail together. Use aggregate numbers ("64 children enrolled") and, if photos are used, only group/classroom shots with guardian consent on file — no individual identifying captions.
- **Kanyadan case privacy:** Public ledger can show "Kanyadan support — ₹51,000" without naming the bride/family unless the family explicitly consents in writing to public naming. Default to anonymized entries.
- **Member and donor privacy:** Donation and community access require a registered, internally identified Member account. The Member's public display name is opt-in; the default form should make "Show my name publicly" an explicit checkbox, not pre-checked in a way that assumes consent. Choosing Anonymous means "do not show my name publicly," not "donate without an account."
- **Legal ID document storage:** Documents submitted for voter verification (such as Aadhaar, Voter ID, or another approved government photo ID showing date of birth and address) must be encrypted at rest, stored in restricted private storage, accessible only to specifically authorized verifying admins, excluded from public APIs and logs, and covered by a documented retention/deletion policy for approved, rejected, expired, or withdrawn verifications.
- **Payment data:** No card/UPI credentials touch your servers — Razorpay Checkout handles this (PCI-DSS compliance offloaded to gateway).
- **Data retention:** Define a retention/deletion policy for Member PII, legal ID documents, and kanyadan applicant data in line with India's Digital Personal Data Protection Act (DPDP Act, 2023).

---

## 10. Legal Prerequisites (blockers to resolve before/parallel to build)

1. **Trust/Society registration** — needed for legal legitimacy and to display a registration number (builds trust, and required for §10.2/10.3).
2. **80G / 12A registration** — needed if donors want tax-deductible receipts. Not required for MVP launch but should be pursued in parallel.
3. **FCRA registration** — only needed if accepting donations from foreign/NRI donors above certain thresholds or in foreign currency. **Flag this explicitly to a CA/legal advisor before enabling international payments.**
4. **Razorpay merchant account** — requires PAN, bank account in the Trust's name, and (ideally) Trust registration docs.

*These are not engineering tasks but are hard dependencies for go-live of the donation flow — sequence accordingly.*

---

## 11. Tech Stack Recommendation

| Layer | Recommendation | Why |
|---|---|---|
| Frontend | Next.js (React) + Tailwind CSS | SSR for fast mobile load, SEO for the trust/about pages, matches your existing stack familiarity (Kvastram) |
| Backend | Next.js API routes or a lightweight Node/Express service | Keeps one codebase; easy for AI coding agents to execute against |
| Database | PostgreSQL (via Supabase or Neon) | Relational integrity for ledger data is non-negotiable — no NoSQL here |
| Payments | Razorpay (Checkout + Webhooks) | Best UPI support for Indian donors, handles receipts |
| File storage | Supabase Storage / Cloudflare R2 | Receipt images, program photos |
| Admin auth | NextAuth.js or Supabase Auth | Fast to implement, supports 2FA |
| Hosting | Vercel (frontend+API) + managed Postgres | Low-ops, matches Next.js |
| Email | Resend or SendGrid | Donation receipts |
| Monitoring | Vercel Analytics + Sentry | Catch payment/webhook failures fast — this is money, errors must be visible immediately |

---

## 12. Key API Endpoints (illustrative)

```
POST   /api/donations/checkout        → creates Razorpay order
POST   /api/donations/webhook         → Razorpay payment confirmation webhook
GET    /api/summary                   → { total_raised, total_spent, balance, donor_count }
GET    /api/ledger/donations?page=    → paginated public donation list
GET    /api/ledger/expenses?page=     → paginated public expense list
GET    /api/programs                  → list of programs + progress metrics

-- Admin (auth required) --
POST   /api/admin/expenses            → log new expense
POST   /api/admin/donations/offline   → log offline donation
PATCH  /api/admin/programs/:id        → update program content/metrics
GET    /api/admin/audit-log           → view admin action history
```

---

## 13. Rollout Plan

| Phase | Scope | Est. effort |
|---|---|---|
| 0 | Design finalization (prototype already built) | Done |
| 1 | DB schema + admin auth + expense/donation entry (manual) | 1–2 weeks |
| 2 | Public site wired to live DB (dashboard, ledgers, donor wall) | 1 week |
| 3 | Razorpay integration + webhook + receipts | 3–5 days |
| 4 | QA on mobile, low-bandwidth testing, launch soft-live to village | 3–5 days |
| 5 (parallel) | Trust/80G paperwork, Razorpay merchant onboarding | Runs alongside eng work — start immediately, it's the critical path |

---

## 14. Module 2 — Community & Village Voting Platform

This is a significant scope addition — effectively a mini social network + a governance/voting system layered on top of the donation platform. Treat it as a **separate phase** with its own registration, moderation, and legal considerations.

### 14.1 Community — Functional Requirements
- FR-C1: User registration — one unified Member account, not separate donor and community records — requires name, phone/email, password, village/ward, date of birth, and optional profile photo. Registration is mandatory before donation and provides the account used for community access.
- FR-C2: Village affiliation policy — the community is intended only for village-affiliated people. Village/ward is required at registration and may be manually enforced by admins through review or suspension; geo-verification is not required for the MVP.
- FR-C2a: Verification tier — Tier 1 Registered Members may donate, post, comment, and chat. Tier 1 is not sufficient to vote; Tier 2 Verified Voter status under §14.4 is required.
- FR-C3: Post creation — text, images, video, PDF attachments
- FR-C4: Comments on posts (threaded or flat — recommend flat for MVP)
- FR-C5: Group/public chat — real-time messaging among registered members
- FR-C6: Media upload pipeline — image/video compression, PDF preview, file size limits, virus/malware scan on upload
- FR-C7: Report/flag button on every post, comment, and chat message
- FR-C8: Block/mute user capability

### 14.2 Voting System — Functional Requirements
- FR-V1: Only Tier 2 Verified Voters who are verified 18+ registered Members can vote (see §14.4); Tier 1 registration alone is not sufficient.
- FR-V2: One member = exactly one vote per issue (hard constraint, enforced server-side, not just UI)
- FR-V3: Admin/moderator creates an official "issue vote" with title, description, options, start/end date
- FR-V4: Vote results computed live but individual votes are **not** publicly attributed by default (secret ballot) — only aggregate counts shown, unless the community explicitly decides on open voting for a given issue
- FR-V5: Any registered member can submit a **poll proposal** ("what should the next village vote be about?")
- FR-V6: Poll proposals are themselves voted/upvoted by the community; the highest-engagement proposal within a time window becomes the next official issue vote (this needs a clear, published rule — see §14.3)
- FR-V7: Voting history/archive — past issues, results, and (where applicable) what decision/action followed

### 14.3 Trending-to-Official-Vote Rule (needs your decision)
You described "jo trending mudda hoga wo next voting mein aayega" — this needs a precise, gameable-resistant rule before build, e.g.:
- Option A: Top upvoted proposal at the end of each week automatically becomes next week's official vote
- Option B: Top 3 proposals shortlisted by admin, then put to a "vote on what to vote on"
- Option C: Admin has final approval even on the trending pick (prevents manipulation/spam topics from becoming binding village decisions)
- **Recommendation:** Option C for MVP — open community input, but admin sign-off before something becomes an official binding-feeling vote. Fully automatic (Option A) is vulnerable to coordinated brigading with so few expected total users.

### 14.4 Two-tier registration and voter verification (final decision)

Donation and community access are no longer open or anonymous. Every person must use one unified Member account with a name, phone/email, password, date of birth, and village/ward affiliation. Registration creates a **Tier 1 Registered Member** account. It is sufficient to donate, post, comment, and participate in the public community chat when Module 2 is enabled, but it is not sufficient to vote.

Voting requires **Tier 2 Verified Voter** status. Before voting access is granted, the Member must submit a legal government photo ID document showing date of birth and address, such as an Aadhaar card, Voter ID, or another government-issued photo ID approved by the foundation. An authorized admin reviews the uploaded document and records `verification_tier = voter_verified`, `verified_by_admin_id`, and `verified_at` only after the document review is complete. The document URL is encrypted and restricted to verifying admins; it is never returned through public Member, community, vote, or donor APIs.

The MVP workflow is document-based admin review, not a phone call or self-declaration alone: Member submits document → system stores it in restricted private storage → authorized admin reviews identity, date of birth, and village/address evidence → admin approves, rejects, or requests resubmission → the Member can vote only after approval and only when the server confirms the Member is 18 or older. The system must record rejection and expiry/withdrawal handling without exposing the document publicly. Aadhaar e-KYC or an external verification provider is not required for the MVP; any future automation needs a separate privacy, consent, security, and legal review.

This two-tier model is the final product decision replacing the earlier open alternatives. The remaining open decisions are limited to which specific documents the foundation will accept, how to handle a village-affiliated person without an approved government ID, and the retention/deletion period for submitted documents.

### 14.5 Moderation & Safety (do not skip — this is the highest-risk part of this module)
- Open posting of photos/videos from a platform tied to a children's coaching program and vulnerable families creates real risk if unmoderated. Required before launch, not "nice to have":
  - Pre-publish or fast post-publish review queue for media uploads, especially anything involving children
  - Clear community guidelines: no photos/videos of minors without guardian consent, no harassment, no defamation of named individuals in vote-related debates
  - A designated moderator (could be Sunil + 1 trusted volunteer) with power to remove content and suspend accounts
  - **Grievance Officer requirement:** Under India's IT Rules 2021, a platform hosting user-generated content (posts/comments/chat) needs a published Grievance Officer name + contact, and a defined complaint-resolution timeline. This is a real legal obligation once this module ships, not optional polish.
- Chat is the hardest thing to moderate reactively (real-time, ephemeral) — recommend starting with public group chat only (no private DMs) for MVP, so all content stays visible for moderation.

### 14.5 Data Model Additions
**Member** (shared account; core identity and verification fields are defined in §8)
`id, auth_user_id, name, phone, email, dob, village_ward, profile_photo_url, display_name_public, is_anonymous, verification_tier (registered/voter_verified), id_document_url (encrypted/restricted), id_document_type, verified_by_admin_id, verified_at, created_at`

**Post**
`id, author_id, text, media_urls[], status (published/under_review/removed), created_at`

**Comment**
`id, post_id, author_id, text, status, created_at`

**ChatMessage**
`id, channel_id, author_id, text, media_url (nullable), created_at`

**VoteIssue**
`id, title, description, options[], status (proposed/active/closed), created_by_admin_id, starts_at, ends_at`

**Vote**
`id, issue_id, member_id, option_selected, cast_at` — *unique constraint on (issue_id, member_id) to hard-enforce one-vote-per-person*

**PollProposal**
`id, title, proposed_by_member_id, upvote_count, status (open/shortlisted/became_official_vote/rejected), created_at`

**Report** (moderation)
`id, target_type (post/comment/chat_message), target_id, reported_by_member_id, reason, status (open/resolved), resolved_by_admin_id`

### 14.6 Tech Stack Additions
| Need | Recommendation |
|---|---|
| Real-time chat | Supabase Realtime or Firebase (simpler than rolling custom WebSocket infra) |
| Media storage + transcoding | Cloudflare R2/Supabase Storage + a lightweight video compression step (e.g. via Cloudflare Stream or Mux if video volume grows) |
| Malware/content scanning on upload | ClamAV (self-hosted, cheap) or a cloud scanning API |
| Vote integrity | Server-side unique constraint (issue_id, member_id) + rate-limiting + optional CAPTCHA on vote submission |

### 14.7 Revised Phasing
Given the scope jump, recommend sequencing this **after** the donation platform (Module 1) is live and stable, not in parallel:
- **Phase A (Module 1):** Donation + transparency platform — as originally scoped
- **Phase B:** Community posting/chat (no voting yet) — lower risk, builds engagement
- **Phase C:** Voting system — only after moderation processes from Phase B are proven to work in practice with real village users

---

## 15. Open Decisions Needed From You

1. Trust/Society registration status — done, in progress, or not started?
2. Will you personally log all expenses initially, or do volunteers need admin access too?
3. Kanyadan applications — accept only in-person/offline initially, or build the online application form in MVP?
4. Any existing domain/hosting already set up, or starting fresh?
5. Budget/timeline constraint that should shape the phasing above?
6. Community/voting module — which trending-poll rule (§14.3, Option A/B/C)?
7. Which specific government photo IDs will be accepted for Tier 2 voter verification, and what approved alternative will be available to a village-affiliated Member who does not have one?
8. What retention/deletion period should apply to submitted voter-verification documents after approval, rejection, expiry, or withdrawal, subject to legal review?
9. Who will act as the platform's Grievance Officer (§14.5) — legally required once posting/chat goes live?
10. Should Module 2 (community) build only after Module 1 (donations) is stable, as recommended in §14.7, or do you need both in parallel?

---
*This PRD is a living document — update it as scope decisions above are resolved before handing sections to execution agents.*
