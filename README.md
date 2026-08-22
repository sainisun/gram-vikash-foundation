# Gram Vikash Foundation

Gram Vikash Foundation is a village-run charitable organization supporting free coaching for disadvantaged children, a community library, and kanyadan assistance for poor families’ daughters. This repository contains the product requirements and engineering documentation for a mobile-first donation and impact platform whose defining feature is transparent, traceable financial reporting. Every donation requires a registered unified Member account; public anonymity controls only whether that Member’s name appears on the donor wall. The public dashboard and ledgers must derive their numbers from source donation and expense records rather than hardcoded or manually maintained totals. [1]

> **Current status:** Requirements and implementation documentation are ready. Application code, infrastructure provisioning, and live payment enablement remain future implementation work and require the human review gates described below.

## Start here for a new AI coding agent

Read [`AGENTS.md`](AGENTS.md) first. It defines the non-negotiable project rules, folder conventions, review gates, and how to handle ambiguity. Then read the documents in the sequence below before changing code.

## Documentation index

| Document | Purpose |
|---|---|
| [`PRD.md`](PRD.md) | Product requirements, scope, personas, data model, legal prerequisites, rollout, and open decisions |
| [`docs/project-proposal.md`](docs/project-proposal.md) | Leadership-ready project brief, outcomes, risks, delivery scope, and approval assumptions |
| [`docs/architecture-design.md`](docs/architecture-design.md) | High-level system components, boundaries, critical data flows, dependencies, and Phase 1 non-goals |
| [`docs/design-system.md`](docs/design-system.md) | Color, typography, spacing, component, ledger motif, responsive, accessibility, and Tailwind tokens |
| [`docs/system-design.md`](docs/system-design.md) | Database posture, caching, polling versus realtime, vote integrity, moderation pipeline, reconciliation, and disaster recovery |
| [`docs/database-schema.md`](docs/database-schema.md) | PostgreSQL DDL, constraints, indexes, foreign-key behavior, and data-sensitivity annotations |
| [`docs/api-contracts.md`](docs/api-contracts.md) | JSON API methods, paths, authorization, request/response shapes, errors, and rate limits |
| [`docs/folder-structure.md`](docs/folder-structure.md) | Original file-level Next.js target structure, route groups, access rules, auth helpers, naming, and feature placement guide |
| [`docs/workspace-reconciliation.md`](docs/workspace-reconciliation.md) | Active React, Express, tRPC, MySQL, and managed-auth implementation baseline with production gates |
| [`docs/implementation-plan.md`](docs/implementation-plan.md) | Sequenced Phase A/B/C task plan with dependencies, definitions of done, and human checkpoints |
| [`docs/security-and-privacy.md`](docs/security-and-privacy.md) | Data classification, access control, payment security, minors’ privacy, retention, uploads, and incidents |
| [`docs/content-moderation-playbook.md`](docs/content-moderation-playbook.md) | Day-to-day moderation, reports, removals, grievance handling, templates, and child-safety escalation |
| [`docs/testing-qa-plan.md`](docs/testing-qa-plan.md) | Unit, integration, webhook, vote, mobile/low-bandwidth, security, and pre-launch testing |
| [`docs/deployment-runbook.md`](docs/deployment-runbook.md) | Vercel/managed-Postgres deployment, environment variables, Razorpay setup, monitoring, rollback, and recovery |

## Recommended implementation order

Build the Donation & Transparency Platform first using the active workspace baseline in [`docs/workspace-reconciliation.md`](docs/workspace-reconciliation.md): unified Member profile completion through managed authentication, database and audit foundation, offline donation/expense entry, public ledgers and summary, gated payment readiness, then mobile/low-bandwidth QA and soft launch. Keep community posting/chat disabled until moderation staffing, privacy notices, safeguarding escalation, and the Grievance Officer process are approved. Add voting only after the community pilot proves that document-based voter verification and moderation operate reliably. [1]

## Local development setup

The repository contains the planning documentation. The initialized application workspace uses React, Express, tRPC, Drizzle, MySQL/TiDB, and managed OAuth; see the reconciliation guide before starting implementation. The intended local setup is:

```bash
git clone https://github.com/sainisun/gram-vikash-foundation.git
cd gram-vikash-foundation
pnpm install
cp .env.example .env.local
pnpm dev
```

Use synthetic data locally. Never copy production donor, kanyadan, community-member, report, receipt, or payment data into a developer environment. The first implementation should add commands for migrations, seed fixtures, linting, formatting, type checking, unit tests, integration tests, and end-to-end tests. It should also add Member registration/login, public-display consent, restricted voter-document upload/review, and the corresponding test fixtures before any payment or voting launch. Keep payment credentials in the provider/secret manager and use Razorpay test mode during development.

## Human review gates

Human approval is required before enabling live payments; merging payment order, webhook, receipt, reconciliation, or financial-summary logic; publishing content involving children or vulnerable families; enabling community posts/chat; or enabling voting and identity verification. The agent must report tests, migration impact, privacy impact, and unresolved decisions in each pull request.

## Legal and privacy note

The security, privacy, moderation, and deployment documents are working drafts for engineering and operational planning. They are not formal legal, tax, accounting, or compliance advice. A qualified Indian lawyer, privacy professional, and CA should review the foundation’s registration, 80G/12A, FCRA, payment, data-protection, child-safety, and intermediary/grievance obligations before the corresponding features go live.

## References

[1]: PRD.md "Gram Vikash Foundation Product Requirements Document"
