# Next.js App Router Migration Boundary

**Status:** Migration completed. The application now runs on **Next.js App Router** using the authoritative `app/(public)`, `app/(member)`, `app/(admin)`, and `app/api` structure. There is no separate `(donor)` or `(community)` identity group: all authenticated user journeys share the unified Member model. [1]

## Preserved invariants

| Area | Migration rule |
|---|---|
| Database | Retain the MySQL/Drizzle schema, migrations, integer-paise money model, and existing data. |
| Identity | Preserve the unified `members` model and server-derived admin permissions. A user’s public anonymity never removes the internal financial association. |
| Audit | Admin financial, program, and export actions continue to create audit evidence. |
| Payments | Razorpay remains disabled until merchant credentials, legal/finance review, test-mode evidence, and human approval are complete. |
| Community and voting | Route groups may exist, but all interactive functionality remains feature-gated pending their documented operational approvals. |

## Completed migration state

1. Next.js App Router is the active runtime for public, Member, administrative, and API routes.
2. Route rendering uses the public, unified Member, and administrative groups named in the authoritative folder structure.
3. Next route handlers call server-only database and authorization services.
4. Public projections, Member ownership, administrative authorization, audit evidence, payment gates, and feature flags have regression coverage and release validation.
5. Legacy Vite/Express directories may remain for historical or compatibility reasons, but they are not served by the active runtime.

## Rollback approach

Database migrations are **not** rolled back as part of the presentation-layer migration. If a future Next runtime change fails validation, restore the prior WebDev checkpoint and retain the existing database state. Do not revive legacy endpoints as a bypass for Member authorization, audit logging, or server-controlled feature gates.

## References

[1]: implementation-plan.md "Gram Vikash Foundation Implementation Plan"
[2]: workspace-reconciliation.md "Active Workspace Reconciliation"
