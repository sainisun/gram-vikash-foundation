# Supabase Migration Planning Record

## Isolation decision

The user approved a dedicated Supabase organization and PostgreSQL project for Gram Vikash Foundation. No existing Supabase organization or project may be reused for this migration without a later explicit decision.

## Observed account context

The configured Supabase integration listed an existing, unrelated `kvastram-backend` project under the `Kvastram` organization. The authenticated browser dashboard also showed an existing `Ambulance booking system` organization and project. These existing resources are out of scope and must remain unchanged.

## Next controlled action

Create a new organization for Gram Vikash Foundation through the authenticated Supabase dashboard. Before creating its PostgreSQL project, obtain the platform cost quote and receive the user's explicit confirmation of the quoted amount and recurrence. The new project must be the sole target for the PostgreSQL schema conversion and approved Phase A record migration.

## Creation control

The authenticated Supabase organization form presents a default **Free — $0/month** organization plan and requires an hCaptcha human verification before submission. The organization must be named `Gram Vikash Foundation`; the human verification is a user-controlled browser step.

## Created migration target

| Resource | Verified value |
|---|---|
| Dedicated organization | `Gram Vikash Foundation` |
| Supabase project | `sainisun's Project` |
| Project reference | `bnntnowpookwwvggpkkv` |
| Project API URL | `https://bnntnowpookwwvggpkkv.supabase.co` |
| Region | South Asia (Mumbai), `ap-south-1` |
| Compute | Nano, Free |
| Status at verification | Healthy |

The target project has no tracked migrations, backups, or Git repository connection. It is the only approved destination for the PostgreSQL schema and authorized Phase A record migration.

## Completed baseline migration

The PostgreSQL baseline schema was applied to the dedicated project, followed by user-approved Row Level Security enablement on all Phase A tables. The authorized data migration transferred only one administrator account, the three approved public program records, and their three publication audit events. There were no Member profiles, donations, expenses, or feature flags to transfer.

The migration used database references returned within SQL statements rather than assuming destination serial IDs. The Supabase data-query channel rejected write transactions, so the reviewed idempotent data migration was applied through the provider migration channel and then scheduled for post-write verification.

## Security-advisor interpretation

Post-migration review reports seven informational `rls_enabled_no_policy` notices, one for each Phase A table. These notices are expected for the user-approved backend-only posture: no Supabase browser/anon client is used and there are intentionally no direct browser policies. Vercel’s backend service will access PostgreSQL through its private server-side connection; public, Member, and admin access remains enforced in the application layer and through the Vercel service boundaries. The notices are not permission grants and require reassessment before any direct Supabase client integration is introduced.
