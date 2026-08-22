# Database Schema

**Project:** Gram Vikash Foundation  
**Database:** PostgreSQL  
**Status:** Implementation baseline; review with the selected managed-Postgres provider before migration  
**Source of truth:** [`PRD.md`](../PRD.md), especially §§8–9 and §§14.5–14.5 [1]

> The schema treats PostgreSQL as the source of truth for money, public ledgers, administration, moderation, and vote integrity. Monetary values are stored as integer paise. Financial and sensitive records are corrected through controlled state changes or compensating entries rather than silent deletion.

## 1. Conventions

All timestamps are stored as `TIMESTAMPTZ` in UTC. Amounts use `BIGINT` paise and must be positive unless a future, explicitly approved reversal model says otherwise. Public APIs must project only approved fields; database columns are not automatically public. PII and minors-adjacent fields are annotated in comments and should be protected through application authorization and, where supported, row-level security.

`ON DELETE RESTRICT` is used for records that provide financial or accountability history. An admin, donor, program, member, or issue should be deactivated or archived rather than deleted when historical records depend on it. `ON DELETE CASCADE` is used only for subordinate non-financial records whose existence has no independent audit value, such as comments under a permanently removed post; the application should normally soft-remove the parent instead.

## 2. DDL

```sql
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Admin accounts authorize privileged actions and are referenced by audit records.
-- PII: name and email. Security-sensitive: password_hash and 2FA fields.
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 160),
  email TEXT NOT NULL UNIQUE CHECK (position('@' IN email) > 1),
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor'
    CHECK (role IN ('super_admin', 'editor')),
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unified registered Member identity for donation and community access. Public projections
-- expose only an explicit opt-in display name or Anonymous.
-- PII: name, email, phone, DOB, village/ward, display_name_public. Highly sensitive: ID document URL/type.
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE,
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 160),
  display_name_public TEXT,
  email TEXT,
  phone TEXT NOT NULL UNIQUE,
  dob DATE NOT NULL,
  village_ward TEXT NOT NULL CHECK (length(trim(village_ward)) BETWEEN 1 AND 200),
  profile_photo_url TEXT,
  is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  receipt_consent BOOLEAN NOT NULL DEFAULT TRUE,
  verification_tier TEXT NOT NULL DEFAULT 'registered'
    CHECK (verification_tier IN ('registered', 'voter_verified')),
  id_document_url TEXT,
  id_document_type TEXT,
  id_document_status TEXT NOT NULL DEFAULT 'not_submitted'
    CHECK (id_document_status IN ('not_submitted', 'submitted', 'approved', 'rejected', 'expired', 'deleted')),
  verified_by_admin_id UUID REFERENCES admin_users(id) ON DELETE RESTRICT,
  verified_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (display_name_public IS NULL OR length(trim(display_name_public)) BETWEEN 1 AND 160),
  CHECK (email IS NULL OR position('@' IN email) > 1),
  CHECK (dob >= DATE '1900-01-01'), -- application code must also reject future dates
  CHECK (NOT is_anonymous OR display_name_public IS NULL),
  CHECK (verification_tier = 'registered' OR (id_document_url IS NOT NULL AND id_document_type IS NOT NULL AND verified_by_admin_id IS NOT NULL AND verified_at IS NOT NULL AND id_document_status = 'approved'))
);

-- Program catalog and public progress metrics used to tag donations and expenses.
-- Public by design: name, slug, description, cover image, and approved metrics.
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  target_metric TEXT,
  current_metric_value BIGINT NOT NULL DEFAULT 0 CHECK (current_metric_value >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Donations are the incoming financial ledger. Successful rows feed public totals.
-- PII-adjacent: member_id, email/phone through members. Sensitive: provider IDs and receipt URL.
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  program_id UUID REFERENCES programs(id) ON DELETE RESTRICT,
  payment_mode TEXT NOT NULL
    CHECK (payment_mode IN ('razorpay', 'cash', 'cheque')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('success', 'pending', 'failed', 'cancelled', 'reversed')),
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  provider_event_id TEXT,
  receipt_url TEXT,
  receipt_status TEXT NOT NULL DEFAULT 'not_requested'
    CHECK (receipt_status IN ('not_requested', 'pending', 'sent', 'failed')),
  entered_by_admin_id UUID REFERENCES admin_users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ,
  CHECK (payment_mode = 'razorpay' OR entered_by_admin_id IS NOT NULL),
  CHECK (status <> 'success' OR paid_at IS NOT NULL),
  CHECK (payment_mode <> 'razorpay' OR razorpay_order_id IS NOT NULL)
);

-- Expenses are the outgoing financial ledger and must remain traceable to an admin action.
-- Sensitive: receipt_image_url may contain vendor, bank, or beneficiary information.
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_paise BIGINT NOT NULL CHECK (amount_paise > 0),
  category TEXT NOT NULL
    CHECK (category IN ('coaching', 'library', 'kanyadan', 'admin')),
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 1000),
  receipt_image_url TEXT,
  program_id UUID REFERENCES programs(id) ON DELETE RESTRICT,
  entered_by_admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kanyadan applications are private case-management records; public surfaces show aggregates only.
-- Highly sensitive/minors-adjacent: family_name, village, application details, sanctioned amount.
CREATE TABLE kanyadan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL CHECK (length(trim(family_name)) BETWEEN 1 AND 200),
  village TEXT NOT NULL CHECK (length(trim(village)) BETWEEN 1 AND 200),
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'funded', 'rejected')),
  amount_sanctioned_paise BIGINT CHECK (amount_sanctioned_paise IS NULL OR amount_sanctioned_paise > 0),
  reviewed_by_admin_id UUID REFERENCES admin_users(id) ON DELETE RESTRICT,
  review_notes TEXT,
  consent_to_public_identification BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status = 'pending' OR reviewed_by_admin_id IS NOT NULL),
  CHECK (status IN ('approved', 'funded') OR amount_sanctioned_paise IS NULL OR amount_sanctioned_paise > 0)
);

-- Immutable-style record of privileged changes; application code must append rather than edit.
-- Sensitive: admin identity, entity references, before/after diff data.
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  action_type TEXT NOT NULL CHECK (length(trim(action_type)) BETWEEN 1 AND 100),
  entity_type TEXT NOT NULL CHECK (length(trim(entity_type)) BETWEEN 1 AND 100),
  entity_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  diff_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  CHECK (jsonb_typeof(diff_json) = 'object')
);

-- Community activity belongs to the unified members table; there is no separate
-- CommunityMember identity. Posts, comments, and chat rows reference members(id).

-- Community posts contain user-generated content and pass through moderation states.
-- PII: author_id. Minors-adjacent: media may depict children and must be consent-reviewed.
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  text TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'under_review'
    CHECK (status IN ('under_review', 'published', 'removed', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  removed_at TIMESTAMPTZ,
  removed_by_admin_id UUID REFERENCES admin_users(id) ON DELETE RESTRICT,
  removal_reason TEXT,
  CHECK (NULLIF(trim(COALESCE(text, '')), '') IS NOT NULL OR cardinality(media_urls) > 0),
  CHECK (status = 'published' OR published_at IS NULL OR status = 'removed'),
  CHECK (status <> 'removed' OR (removed_at IS NOT NULL AND removed_by_admin_id IS NOT NULL))
);

-- Comments are subordinate user-generated content attached to a post.
-- PII: author_id. Content may be sensitive or reportable.
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  text TEXT NOT NULL CHECK (length(trim(text)) BETWEEN 1 AND 3000),
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'under_review', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at TIMESTAMPTZ,
  removed_by_admin_id UUID REFERENCES admin_users(id) ON DELETE RESTRICT,
  removal_reason TEXT,
  CHECK (status <> 'removed' OR (removed_at IS NOT NULL AND removed_by_admin_id IS NOT NULL))
);

-- Chat messages are persisted for moderation and are scoped to a public channel identifier.
-- PII: author_id. Media may be sensitive and must be private until scanned/published.
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id TEXT NOT NULL CHECK (length(trim(channel_id)) BETWEEN 1 AND 120),
  author_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  text TEXT,
  media_url TEXT,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('published', 'under_review', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at TIMESTAMPTZ,
  removed_by_admin_id UUID REFERENCES admin_users(id) ON DELETE RESTRICT,
  removal_reason TEXT,
  CHECK (NULLIF(trim(COALESCE(text, '')), '') IS NOT NULL OR media_url IS NOT NULL),
  CHECK (status <> 'removed' OR (removed_at IS NOT NULL AND removed_by_admin_id IS NOT NULL))
);

-- Official issue definitions. Individual votes remain separate and are not publicly attributed.
-- Public by design after publication: title, description, options, status, and aggregate results.
CREATE TABLE vote_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 300),
  description TEXT NOT NULL CHECK (length(trim(description)) BETWEEN 1 AND 10000),
  options JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'active', 'closed', 'cancelled')),
  created_by_admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (jsonb_typeof(options) = 'array'),
  CHECK (jsonb_array_length(options) BETWEEN 2 AND 10),
  CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at),
  CHECK (status <> 'active' OR (starts_at IS NOT NULL AND ends_at IS NOT NULL))
);

-- One cast per member per issue is enforced by the mandatory unique constraint.
-- Sensitive: member-to-option selection must not be exposed in public API responses.
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES vote_issues(id) ON DELETE RESTRICT,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  option_selected TEXT NOT NULL CHECK (length(trim(option_selected)) BETWEEN 1 AND 200),
  cast_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (issue_id, member_id)
);

-- Poll proposals represent community suggestions for future official issues.
-- PII: proposed_by_member_id. Public fields require moderation and publication policy.
CREATE TABLE poll_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 300),
  description TEXT,
  proposed_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'shortlisted', 'became_official_vote', 'rejected', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supporting table for one-member-one-upvote integrity; the PRD's upvote_count is derived.
-- PII: member_id. Never accept a client-supplied upvote count as authoritative.
CREATE TABLE poll_proposal_upvotes (
  proposal_id UUID NOT NULL REFERENCES poll_proposals(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (proposal_id, member_id)
);

-- Reports are polymorphic moderation cases because targets span posts, comments, and chat.
-- PII: reporter identity and free-text reason. Keep access admin-only.
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type TEXT NOT NULL
    CHECK (target_type IN ('post', 'comment', 'chat_message', 'poll_proposal')),
  target_id UUID NOT NULL,
  reported_by_member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (length(trim(reason)) BETWEEN 1 AND 2000),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed')),
  resolved_by_admin_id UUID REFERENCES admin_users(id) ON DELETE RESTRICT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  CHECK (status IN ('open', 'in_review') OR (resolved_by_admin_id IS NOT NULL AND resolved_at IS NOT NULL))
);

COMMIT;
```

## 3. Required indexes

```sql
-- Public financial ledgers: deterministic newest-first pagination.
CREATE INDEX idx_donations_public_success_created
  ON donations (created_at DESC, id DESC)
  WHERE status = 'success';

CREATE INDEX idx_expenses_public_created
  ON expenses (created_at DESC, id DESC);

CREATE INDEX idx_donations_status_program
  ON donations (status, program_id, created_at DESC);

CREATE INDEX idx_expenses_category_program_created
  ON expenses (category, program_id, created_at DESC);

CREATE INDEX idx_donations_member
  ON donations (member_id, created_at DESC);

CREATE INDEX idx_members_verification
  ON members (verification_tier, id_document_status, created_at DESC);

CREATE INDEX idx_members_village_ward
  ON members (village_ward);

CREATE INDEX idx_donations_razorpay_order
  ON donations (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX uq_donations_razorpay_payment
  ON donations (razorpay_payment_id)
  WHERE razorpay_payment_id IS NOT NULL;

CREATE UNIQUE INDEX uq_donations_provider_event
  ON donations (provider_event_id)
  WHERE provider_event_id IS NOT NULL;

CREATE INDEX idx_audit_logs_timestamp
  ON audit_logs (timestamp DESC, id DESC);

CREATE INDEX idx_audit_logs_entity
  ON audit_logs (entity_type, entity_id, timestamp DESC);

CREATE INDEX idx_kanyadan_status_date
  ON kanyadan_applications (status, application_date DESC);

-- Community feeds and moderation queues.
CREATE INDEX idx_posts_published_created
  ON posts (created_at DESC, id DESC)
  WHERE status = 'published';

CREATE INDEX idx_posts_moderation
  ON posts (status, created_at ASC);

CREATE INDEX idx_comments_post_created
  ON comments (post_id, created_at ASC)
  WHERE status <> 'removed';

CREATE INDEX idx_chat_channel_created
  ON chat_messages (channel_id, created_at DESC);

CREATE INDEX idx_chat_moderation
  ON chat_messages (status, created_at ASC);

-- Voting and proposal aggregation.
CREATE INDEX idx_votes_issue
  ON votes (issue_id, cast_at);

CREATE INDEX idx_poll_proposals_status_created
  ON poll_proposals (status, created_at DESC);

CREATE INDEX idx_poll_upvotes_proposal
  ON poll_proposal_upvotes (proposal_id);

CREATE INDEX idx_reports_status_created
  ON reports (status, created_at ASC);

CREATE INDEX idx_reports_target
  ON reports (target_type, target_id);
```

## 4. Schema-level implementation notes

The public summary should aggregate `donations.amount_paise` where `status = 'success'` and `expenses.amount_paise` for valid expenses. Do not add `total_raised`, `total_spent`, or `balance` columns to a mutable summary table. The balance is a derived value and should be recomputed from the ledgers on every canonical summary request. Every donation references the unified registered `members` table; an Anonymous donor is still an identified Member internally. [1]

The `options` JSONB array should contain stable option identifiers and display labels, for example `[ {"id":"yes","label":"Yes"}, {"id":"no","label":"No"} ]`. The vote-casting service must validate `option_selected` against the active issue’s stored option IDs inside the same transaction. A production migration may normalize issue options into a separate table if option-level reporting or multilingual labels require it; the unique vote constraint remains mandatory.

`reports.target_id` is intentionally polymorphic because PostgreSQL cannot enforce a foreign key across multiple target tables without a more complex trigger design. The moderation service must validate target existence and target-type compatibility before creating a report. If the product requires database-enforced referential integrity later, replace this with separate nullable foreign keys plus a check that exactly one is populated.

The schema does not create a public view over all Member columns. Build explicit API projections that return only the fields allowed by the consent and privacy rules. In particular, never join `members.dob`, `phone`, `village_ward`, ID-document fields, or verification metadata into public posts, vote results, donor ledgers, or proposal feeds. ID-document objects must be encrypted/restricted outside the public bucket.

## References

[1]: ../PRD.md "Gram Vikash Foundation Product Requirements Document"
