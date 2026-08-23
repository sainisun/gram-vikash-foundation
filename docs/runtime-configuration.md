# Managed Runtime Configuration

**Status:** Operational guidance for the active Next.js deployment. This guide contains names, ownership, and validation rules only; it never contains secret values.

## Environment boundary

| Configuration class | Managed location | Rule |
|---|---|---|
| Database and session configuration | Hosting provider’s encrypted server environment | Server-only. Never expose database URLs or session secrets to the browser. |
| Managed OAuth configuration | Hosting provider’s encrypted environment | The public app identifier and portal URL support sign-in; session creation, token exchange, and callback validation remain server-side. |
| Payment configuration | Hosting provider’s encrypted environment | Keep live credentials absent until the A4 staged-test and human approval gates are complete. |
| Feature approvals | Database feature-flag records plus documented human sign-off | `payments_live`, community, and voting functionality must fail closed unless both configuration and approval are present. |
| Public browser configuration | Explicit `VITE_*` values approved for browser use | Never put a credential, webhook secret, database URL, private receipt location, or restricted-document location in a browser-visible variable. |

## Active configuration names

The managed project provides `DATABASE_URL`, `JWT_SECRET`, `OAUTH_SERVER_URL`, `VITE_APP_ID`, `VITE_OAUTH_PORTAL_URL`, and the owner identifiers required by the current auth and application runtime. Payment, storage, email, and monitoring variables are not added merely to activate code paths; each needs an assigned owner, approved environment scope, and test evidence first. [1]

## Release validation

Before an environment is promoted, a named technical owner should verify that the production origin is HTTPS, OAuth callbacks use the browser-provided origin, server secrets are absent from the client bundle, security headers are present, and the required gates remain closed. Preview and staging must use non-sensitive fixtures and must never copy production Member, donor, restricted-document, or receipt data. [1]

## Configuration changes

Configuration changes require the following sequence: document the variable name and owner, add the value through managed secret controls, run the related test-mode or staging check, record the result in the release evidence, and only then consider a human gate approval. Do not commit local `.env` files or secret examples to the repository.

## References

[1]: deployment-runbook.md "Deployment Runbook"
