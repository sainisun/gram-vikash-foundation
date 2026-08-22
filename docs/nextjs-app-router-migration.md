# Next.js App Router Migration Boundary

**Decision:** The application will migrate from the active React/Vite + Express/tRPC presentation shell to a **Next.js App Router** application. The target route groups are `app/(public)`, `app/(donor)`, `app/(community)`, `app/(admin)`, and `app/api`.

## Preserved invariants

| Area | Migration rule |
|---|---|
| Database | Retain the MySQL/Drizzle schema, migrations, integer-paise money model, and existing data. |
| Identity | Preserve the unified `members` model and server-derived admin permissions. A user’s public anonymity never removes the internal financial association. |
| Audit | Admin financial, program, and export actions continue to create audit evidence. |
| Payments | Razorpay remains disabled until merchant credentials, legal/finance review, test-mode evidence, and human approval are complete. |
| Community and voting | Route groups may exist, but all interactive functionality remains feature-gated pending their documented operational approvals. |

## Migration sequence

1. Install Next.js and introduce the App Router foundation without deleting the legacy source tree.
2. Move route rendering into the public, donor, community, and admin route groups.
3. Add Next route handlers which call server-only database and authorization services.
4. Revalidate public projections, Member ownership, admin authorization, audit evidence, payment gates, and feature flags.
5. Remove legacy Vite/Express runtime only after the Next production build and preview flows pass.

## Rollback approach

The legacy `client/` and `server/` folders remain intact until the Next.js routes, API boundaries, and production build are verified. Database migrations are **not** rolled back as part of this presentation-layer migration. If the Next runtime fails validation, restore the prior WebDev checkpoint and retain the existing database state.

## References

[1]: implementation-plan.md "Gram Vikash Foundation Implementation Plan"
[2]: workspace-reconciliation.md "Active Workspace Reconciliation"
