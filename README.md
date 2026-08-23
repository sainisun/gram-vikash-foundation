# Gram Vikash Foundation

Gram Vikash Foundation is a village-run charitable organization supporting free coaching for disadvantaged children, a community library, and Kanyadan assistance for eligible poor families. This repository contains the Phase A Next.js application and its supporting product, engineering, and operational documentation. Every donation requires a registered unified Member account; public anonymity controls only whether that Member’s name appears on the donor wall. The public dashboard and ledgers derive their numbers from source donation and expense records rather than hardcoded or manually maintained totals. [1]

> **Current status:** The Phase A application is implemented on Next.js App Router with public transparency views, unified Member journeys, protected administration, audit evidence, and three approved public program records. Live payments, community activity, voter-document review, and voting remain disabled until their documented human approval gates are complete.

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
| [`docs/nextjs-app-router-migration.md`](docs/nextjs-app-router-migration.md) | Approved migration boundary, preserved safeguards, sequence, and rollback approach for the Next.js App Router transition |
| [`docs/implementation-plan.md`](docs/implementation-plan.md) | Sequenced Phase A/B/C task plan with dependencies, definitions of done, and human checkpoints |
| [`docs/a2-human-review-checklist.md`](docs/a2-human-review-checklist.md) | Evidence and sign-off record required before payment activation or any Phase B work |
| [`docs/security-and-privacy.md`](docs/security-and-privacy.md) | Data classification, access control, payment security, minors’ privacy, retention, uploads, and incidents |
| [`docs/content-moderation-playbook.md`](docs/content-moderation-playbook.md) | Day-to-day moderation, reports, removals, grievance handling, templates, and child-safety escalation |
| [`docs/testing-qa-plan.md`](docs/testing-qa-plan.md) | Unit, integration, webhook, vote, mobile/low-bandwidth, security, and pre-launch testing |
| [`docs/deployment-runbook.md`](docs/deployment-runbook.md) | Vercel/managed-Postgres deployment, environment variables, Razorpay setup, monitoring, rollback, and recovery |
| [`docs/runtime-configuration.md`](docs/runtime-configuration.md) | Managed configuration names, secret boundaries, approval ownership, and fail-closed feature-gate rules |
| [`docs/phase-b-activation-checklist.md`](docs/phase-b-activation-checklist.md) | Evidence and human sign-off required before enabling community capability |
| [`docs/approved-program-content.md`](docs/approved-program-content.md) | Version-controlled source copy for the published Coaching, Library, and Kanyadan program records |

## Current implementation boundary

The implemented Phase A boundary comprises managed-auth Member registration and profiles; the database and audit foundation; approved program publication; public ledgers and summary; protected offline donation, expense, program, export, and readiness operations; and payment-readiness screens that fail closed. Community posting/chat must remain disabled until moderation staffing, privacy notices, safeguarding escalation, and the Grievance Officer process are approved. Voting must remain disabled until the community pilot proves that document-based voter verification and moderation operate reliably. [1]

## Local development setup

The repository contains the active Next.js App Router workspace. It uses React, TypeScript, Tailwind-style global CSS, Drizzle, MySQL/TiDB, managed OAuth, and server-side route handlers; see the reconciliation guide before changing implementation boundaries. The intended local setup is:

```bash
git clone https://github.com/sainisun/gram-vikash-foundation.git
cd gram-vikash-foundation
pnpm install
pnpm dev
```

Use no production donor, Kanyadan, community-member, report, receipt, or payment data in a local environment. The repository provides type-checking, unit testing, and production-build commands. Managed runtime configuration is supplied through the platform, not through committed environment files. Keep payment credentials in the provider’s secure configuration and use Razorpay test mode only after the payment gate receives the required human approval.

## Human review gates

Human approval is required before enabling live payments; merging payment order, webhook, receipt, reconciliation, or financial-summary logic; publishing content involving children or vulnerable families; enabling community posts/chat; or enabling voting and identity verification. The agent must report tests, migration impact, privacy impact, and unresolved decisions in each pull request.

## Legal and privacy note

The security, privacy, moderation, and deployment documents are working drafts for engineering and operational planning. They are not formal legal, tax, accounting, or compliance advice. A qualified Indian lawyer, privacy professional, and CA should review the foundation’s registration, 80G/12A, FCRA, payment, data-protection, child-safety, and intermediary/grievance obligations before the corresponding features go live.

## References

[1]: PRD.md "Gram Vikash Foundation Product Requirements Document"
