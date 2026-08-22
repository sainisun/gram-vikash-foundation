# API Contracts

**Project:** Gram Vikash Foundation
**Status:** Implementation baseline
**Audience:** Frontend/backend engineers and AI coding agents
**Source:** [`PRD.md`](../PRD.md), [`database-schema.md`](database-schema.md), [`architecture-design.md`](architecture-design.md) [1]

> The contracts below use JSON over HTTPS. Monetary values are integer paise in requests/responses unless a response explicitly contains a display-only formatted string. Public responses are projections, not direct database rows. Sensitive donor, kanyadan, member, and vote fields are never returned by default.

## 1. Shared conventions

### 1.1 Authentication levels

| Level | Meaning |
|---|---|
| `public` | No session required; rate limited and privacy-filtered |
| `member-session` | Authenticated unified Member session; may access only that Member’s own donation status/receipt |
| `registered-member` | Authenticated unified Member; may donate and, when enabled, browse/post/comment/report/chat subject to account status |
| `verified-voter` | Authenticated unified Member with approved document-based voter verification and voting eligibility |
| `admin` | Authenticated administrator with role checks; financial mutations and moderation are audited |
| `super-admin` | Admin operation requiring elevated approval, such as role/2FA or destructive configuration changes |
| `razorpay-provider` | HTTPS webhook with raw-body signature validation; no browser session |

### 1.2 Standard error envelope

```ts
type ApiError = {
  error: {
    code: string;              // stable machine-readable code
    message: string;           // safe user-facing message
    field_errors?: Record<string, string[]>;
    request_id: string;
  };
};
```

Common status codes are `400` invalid input, `401` unauthenticated, `403` authenticated but not allowed, `404` not found, `409` state/conflict or duplicate vote, `413` upload too large, `415` unsupported media, `422` semantically invalid state, `429` rate limited, and `500/502/503` temporary server/provider failure. Error bodies must not disclose PII, payment secrets, internal SQL, or private moderation evidence.

### 1.3 Pagination and privacy

List endpoints accept `limit` (default 20, maximum 100) and either `page` for the MVP or a future opaque `cursor`. Responses include `items`, `next_cursor` or `page`, `has_more`, and `generated_at`. Public ledger results include only explicitly public names or `Anonymous`. Dates are ISO-8601 strings; public monetary display is derived from `amount_paise` and a localized formatter.

## 2. Donations and payment

### `POST /api/donations/checkout`

**Auth:** `registered-member`
**Purpose:** Validate an authenticated Member’s donation intent and create a Razorpay order plus a pending donation record. Registration and login happen before this endpoint; an unauthenticated request returns `401` with `code = registration_required` so the client can redirect to register/login.

```ts
// Request — identity and public-display preference come from the authenticated Member profile
{
  amount_paise: number;                 // positive integer
  program_id?: string | null;
}

// 201 Response
{
  donation_id: string;
  razorpay_order_id: string;
  amount_paise: number;
  currency: 'INR';
  checkout_options: { key_id: string; name: string; description: string };
}
```

Reject unsupported amounts, inactive program IDs, or an inactive/unverified Member session. Public anonymity means that the registered Member’s name is not shown on the donor wall; it never means guest checkout. Apply per-member, per-IP, and per-device rate limits; never log the full Member profile or payment credentials.

### `POST /api/donations/confirm`

**Auth:** `member-session`
**Purpose:** Accept the browser’s checkout result as a prompt status check; it is not a replacement for the provider webhook.

```ts
// Request
{
  donation_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// 200 Response
{ donation_id: string; status: 'pending' | 'success' | 'failed'; receipt_status: string }
```

The server validates ownership of the donation session and the payment signature according to Razorpay’s integration guidance. A successful browser confirmation may trigger a provider API fetch, but only the server’s verified payment state can transition the financial record. [2]

### `POST /api/donations/webhook`

**Auth:** `razorpay-provider`
**Purpose:** Receive asynchronous payment events and apply idempotent ledger transitions.

```ts
// Request: raw JSON body from Razorpay; exact event schema is provider-defined.
// Headers: X-Razorpay-Signature, x-razorpay-event-id

// 200 Response after valid, safely consumed or already-processed event
{ received: true; event_id: string }
```

Verify the HMAC signature against the **raw request body** before parsing, record/check the unique provider event ID, handle duplicate and out-of-order events, and return a non-2xx response only when the event has not been safely consumed. Invalid signatures return `400` or `401` without changing donation state. Razorpay documents at-least-once delivery, event IDs, raw-body signature validation, and retry behavior. [3] [4]

### `GET /api/donations/:donation_id/status`

**Auth:** `registered-member` (own donation only) or `admin`
**Purpose:** Return a Member’s own or an admin’s donation state.

```ts
// 200 Response
{
  donation_id: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'reversed';
  amount_paise: number;
  program: { id: string; name: string } | null;
  receipt_status: 'not_requested' | 'pending' | 'sent' | 'failed';
  created_at: string;
}
```

Return `404` rather than revealing whether another Member’s donation ID exists. Do not return provider secrets or raw payment payloads.

### `GET /api/donations/:donation_id/receipt`

**Auth:** `registered-member` (own receipt only) or `admin`
**Purpose:** Return a short-lived signed download URL or stream the authenticated Member’s own successful receipt.

```ts
// 200 Response
{ receipt_url: string; expires_at: string }
```

Return `409` if the donation is not successful and `404` if no receipt has been generated. Log admin access to a private receipt.

## 3. Public ledger, summary, and programs

### `GET /api/summary`

**Auth:** `public`
**Response:**

```ts
{
  total_raised_paise: number;   // successful donations only
  total_spent_paise: number;    // recorded expenses
  balance_paise: number;
  donor_count: number;
  generated_at: string;
}
```

The values must be computed from the source ledger tables on every canonical request; no hardcoded or manually maintained total is permitted. Phase 1 clients poll this endpoint every 30–60 seconds. [1]

### `GET /api/ledger/donations`

**Auth:** `public`
**Query:** `page`, `limit`, `program_id`, `from`, `to`
**Response:**

```ts
{
  items: Array<{
    id: string;
    date: string;
    donor_display_name: string; // opt-in name or Anonymous
    amount_paise: number;
    program: { id: string; name: string } | null;
    payment_mode: 'razorpay' | 'cash' | 'cheque';
  }>;
  page: number;
  has_more: boolean;
  generated_at: string;
}
```

Only `success` rows are public. Apply a modest anonymous-read rate limit and reject invalid date ranges with `400`.

### `GET /api/ledger/expenses`

**Auth:** `public`
**Query:** `page`, `limit`, `category`, `program_id`, `from`, `to`
**Response:**

```ts
{
  items: Array<{
    id: string;
    date: string;
    description: string;
    category: 'coaching' | 'library' | 'kanyadan' | 'admin';
    amount_paise: number;
    program: { id: string; name: string } | null;
    receipt_available: boolean;
  }>;
  page: number;
  has_more: boolean;
  generated_at: string;
}
```

Do not expose private receipt URLs directly; use a separate controlled download route if a receipt is approved for public access.

### `GET /api/donor-wall`

**Auth:** `public`
**Query:** `limit`, `program_id`
**Response:**

```ts
{ items: Array<{ display_name: string; amount_paise?: number; donated_at: string }> }
```

Return only registered Members who explicitly opted in to public display; otherwise use `Anonymous` or omit the entry according to the published donor-wall policy. Public anonymity is a display setting, not an unregistered donation state.

### `GET /api/programs` and `GET /api/programs/:slug`

**Auth:** `public`
**Response:**

```ts
type ProgramPublic = {
  id: string; name: string; slug: string; description: string;
  cover_image_url: string | null;
  target_metric: string | null; current_metric_value: number;
};
```

Only active and published content is returned. Program updates are admin-only.

## 4. Admin API

### `POST /api/admin/expenses`

**Auth:** `admin`
**Request:**

```ts
{
  amount_paise: number;
  category: 'coaching' | 'library' | 'kanyadan' | 'admin';
  description: string;
  receipt_image_url?: string | null;
  program_id?: string | null;
  idempotency_key: string;
}
```

**Response:** `201 { expense: ExpenseAdminView; audit_log_id: string }`. Validate positive integer amount, category/program compatibility, file ownership, and idempotency. Insert the expense and audit event in one transaction. Rate limit to protect against accidental repeated submissions; never allow a client-supplied `entered_by_admin_id`.

### `POST /api/admin/donations/offline`

**Auth:** `admin`
**Request:**
```ts
{
  member_id: string;                    // existing registered Member
  amount_paise: number;
  program_id?: string | null;
  payment_mode: 'cash' | 'cheque';
  received_at: string;
  notes?: string;
  idempotency_key: string;
}
```
**Response:** `201 { donation: DonationAdminView; audit_log_id: string }`. The server verifies that `member_id` belongs to an active registered Member. Offline rows appear in the same public ledger after validation, but are entered with `entered_by_admin_id` and must never be presented as Razorpay payments. Public anonymity is read from the Member’s display preference and never removes the internal Member link.

### `GET /api/admin/audit-log`

**Auth:** `admin`
**Query:** `page`, `limit`, `entity_type`, `admin_id`, `from`, `to`
**Response:** `200 { items: AuditLogAdminView[]; page: number; has_more: boolean }`. Redact secrets and unnecessary PII. The audit log is append-only from the application’s perspective.

### `GET /api/admin/dashboard`

**Auth:** `admin`
**Response:**

```ts
{
  today: { donations_paise: number; expenses_paise: number };
  pending_payment_count: number;
  pending_kanyadan_count: number;
  receipt_failures: number;
  moderation_open_count: number;
}
```

### `PATCH /api/admin/programs/:id`

**Auth:** `admin`
**Request:** `{ name?: string; description?: string; cover_image_url?: string; target_metric?: string; current_metric_value?: number; is_active?: boolean }`
**Response:** `200 { program: ProgramAdminView; audit_log_id: string }`. Record before/after changes and validate that progress values are non-negative.

### `GET /api/admin/export/ledger`

**Auth:** `admin`
**Query:** `format=csv|pdf`, `from`, `to`, `include_receipt_links=false|true`
**Response:** File download or `202 { export_id, status_url }` for an asynchronous export. Exports must be access-logged and should default to omitting sensitive donor contact fields.

### `POST /api/admin/uploads/presign`

**Auth:** `admin` or `registered-member`
**Request:** `{ purpose: 'expense_receipt'|'program_photo'|'community_media'|'voter_id_document'; filename: string; content_type: string; size_bytes: number }`
**Response:** `{ upload_url: string; object_key: string; expires_at: string }`. Validate type/size, use server-generated object keys, place community media in quarantine, and place voter ID documents in a private encrypted/restricted area. Never allow arbitrary bucket paths.

### `POST /api/members/me/voter-verification-document`

**Auth:** `registered-member`
**Request:** `{ object_key: string; id_document_type: 'aadhaar'|'voter_id'|'other_government_photo_id' }`
**Response:** `202 { verification_tier: 'registered'; id_document_status: 'submitted'; review_status_url: string }`. Confirm that the object belongs to the Member, passed type/size/security checks, and is in restricted storage. Do not return the document URL or expose it to another Member.

### `GET /api/admin/members/:member_id/voter-verification-document`

**Auth:** `admin` with voter-verification permission
**Response:** `200 { secure_document_url: string; id_document_type: string; id_document_status: string; uploaded_at: string }`. Return a short-lived signed URL only to an authorized verifying admin, audit the access, and never copy the document into logs, analytics, public storage, or audit diffs.

## 5. Unified Members, posts, comments, and chat

### `POST /api/members` and `GET /api/members/me`

**Auth:** `public` for registration; `registered-member` for profile
**Purpose:** Create the single account used for donation and community access. There is no separate Donor and CommunityMember entity.

**Registration request:** `{ name: string; phone: string; email?: string; password: string; dob: string; village_ward: string; profile_photo_url?: string; is_anonymous?: boolean }`
**Registration response:** `{ member_id: string; verification_tier: 'registered'; session_token: string }`. Registration is rate limited, phone/email verification is required according to the selected auth policy, and the village/ward field is mandatory. The community is intended only for village-affiliated people; admins may manually suspend accounts that do not satisfy that acceptance policy. Do not accept self-declared age or Tier 1 registration as sufficient for voting.

`GET /api/members/me` returns the Member’s own profile, `verification_tier`, village/ward affiliation, public-display preference, and voting-eligibility explanation. It never returns another Member’s PII or the raw ID document.

### `GET /api/community/posts`

**Auth:** `public` or `registered-member`
**Query:** `page`, `limit`, `before`, `after`
**Response:**

```ts
{
  items: Array<{
    id: string; author: { id: string; display_name: string };
    text: string | null; media: Array<{ url: string; type: string; alt_text: string }>;
    created_at: string; comment_count: number; can_report: boolean;
  }>;
  has_more: boolean;
}
```

Return published posts only. Author display names must follow the community profile policy; never include phone, DOB, verification metadata, or minors’ identifying information.

### `POST /api/community/posts`

**Auth:** `registered-member`
**Request:** `{ text?: string; media_object_keys?: string[] }`
**Response:** `201 { post: PostView; status: 'under_review'|'published' }`. Enforce text/media length limits, upload ownership, rate limits, and moderation status. Media requires scan and policy review before publication.

### `GET /api/community/posts/:id/comments` and `POST /api/community/posts/:id/comments`

**Auth:** `public` for published comments; `registered-member` to create
**Request:** `{ text: string }`
**Response:** `200/201 { items: CommentView[] }` or `{ comment: CommentView }`. Rate-limit creation, reject comments on removed posts, and queue/report content according to moderation policy.

### `POST /api/community/reports`

**Auth:** `registered-member`
**Request:** `{ target_type: 'post'|'comment'|'chat_message'|'poll_proposal'; target_id: string; reason: string }`
**Response:** `201 { report_id: string; status: 'open' }`. Rate-limit duplicate reports by member/target and do not reveal reporter identity to the reported user.

### `GET /api/community/chat/channels/:channel_id/messages`

**Auth:** `registered-member`
**Query:** `before`, `limit`
**Response:** `{ items: ChatMessageView[]; next_cursor: string | null }`. Only public group channels are supported in the MVP; no private DMs. Messages remain available to authorized moderators for the operational retention period.

### `POST /api/community/chat/channels/:channel_id/messages`

**Auth:** `registered-member`
**Request:** `{ text?: string; media_object_key?: string }`
**Response:** `201 { message: ChatMessageView }`. Rate-limit aggressively, scan media, reject suspended members, and retain moderation status. Realtime delivery is an adapter concern; persistence must occur before a message is announced as published.

### `POST /api/community/members/:member_id/block` and `/mute`

**Auth:** `registered-member`
**Request:** `{ reason?: string }`
**Response:** `204`. These endpoints require supporting `member_blocks` and `member_mutes` tables or an approved equivalent before implementation. They are not substitutes for moderator removal or safety escalation.

## 6. Voting and poll proposals

### `GET /api/voting/issues`

**Auth:** `public`
**Query:** `status=active|closed|archive`
**Response:** `{ items: VoteIssuePublicView[]; generated_at: string }`. Do not return individual votes or member IDs.

### `GET /api/voting/issues/:issue_id/results`

**Auth:** `public`
**Response:**

```ts
{
  issue_id: string;
  status: 'proposed'|'active'|'closed'|'cancelled';
  totals: Array<{ option_id: string; label: string; count: number }>;
  total_votes: number;
  generated_at: string;
}
```

Aggregate counts only. The server validates that the issue can be viewed publicly and never joins results to member identity.

### `POST /api/voting/issues/:issue_id/votes`

**Auth:** `verified-voter`
**Request:** `{ option_id: string }`
**Response:** `201 { accepted: true; issue_id: string; results_url: string }`. The server derives the member ID from the session, validates issue window and option, applies rate limits/CAPTCHA as needed, and inserts under `UNIQUE (issue_id, member_id)`. A second attempt returns `409` without changing counts. This constraint is the non-negotiable integrity guarantee in the PRD. [1]

### `GET /api/voting/proposals`

**Auth:** `public` or `registered-member`
**Query:** `status=open|shortlisted|archive`, `page`, `limit`
**Response:** `{ items: PollProposalView[]; page: number; has_more: boolean }`.

### `POST /api/voting/proposals`

**Auth:** `registered-member`
**Request:** `{ title: string; description?: string }`
**Response:** `201 { proposal: PollProposalView; status: 'open'|'under_review' }`. Rate-limit submissions, moderate title/description, and prevent spam or duplicate bursts.

### `POST /api/voting/proposals/:proposal_id/upvote`

**Auth:** `registered-member`
**Response:** `201 { accepted: true; upvote_count: number }` or `409` if the member already upvoted. Use the supporting unique key `(proposal_id, member_id)`; never accept a client-supplied count.

### `POST /api/admin/voting/issues` and `PATCH /api/admin/voting/issues/:id`

**Auth:** `admin`
**Request:** `{ title: string; description: string; options: Array<{ id: string; label: string }>; starts_at: string; ends_at: string; status?: 'proposed'|'active'|'closed'|'cancelled' }`
**Response:** `{ issue: VoteIssueAdminView; audit_log_id: string }`. Once active, option IDs and ballot semantics are immutable without a reviewed cancellation/recreation process.

## 7. Moderation API

### `GET /api/admin/moderation/queue`

**Auth:** `admin`
**Query:** `target_type`, `status`, `risk`, `page`, `limit`
**Response:** `{ items: ModerationQueueItem[]; page: number; has_more: boolean }`. Sensitive media and reporter details are admin-only.

### `PATCH /api/admin/moderation/:target_type/:target_id`

**Auth:** `admin`
**Request:** `{ action: 'publish'|'remove'|'restore'|'dismiss_report'; reason: string }`
**Response:** `{ target_id: string; status: string; audit_log_id: string }`. Removal is normally a soft state transition with a reason, actor, and timestamp. Child-safety incidents require immediate escalation and must not be resolved through an ordinary “dismiss” action.

### `PATCH /api/admin/reports/:report_id`

**Auth:** `admin`
**Request:** `{ status: 'in_review'|'resolved'|'dismissed'; resolution_notes: string }`
**Response:** `{ report: ReportAdminView; audit_log_id: string }`. Status changes and evidence access are audit logged.

### `PATCH /api/admin/members/:member_id/voter-verification`

**Auth:** `admin`
**Request:** `{ action: 'approve'|'reject'|'request_resubmission'|'expire'; id_document_type?: 'aadhaar'|'voter_id'|'other_government_photo_id'; notes?: string }`
**Response:** `{ member_id: string; verification_tier: 'registered'|'voter_verified'; id_document_status: 'submitted'|'approved'|'rejected'|'expired'|'deleted'; verified_at: string | null; audit_log_id: string }`. The MVP uses restricted document upload and admin review: the verifier checks approved identity, date-of-birth, and address evidence before granting `voter_verified`. The raw document URL is never returned. Do not add automated Aadhaar e-KYC without separate privacy, security, consent, and legal approval. [1]

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
[2]: https://razorpay.com/docs/payments/server-integration/nodejs/payment-gateway/build-integration/ "Razorpay Docs — Server Integration"
[3]: https://razorpay.com/docs/webhooks/validate-test/ "Razorpay Docs — Validate and Test Webhooks"
[4]: https://razorpay.com/docs/webhooks/best-practices/ "Razorpay Docs — Webhook Best Practices"
