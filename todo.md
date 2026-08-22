# Project TODO

- [x] Reconcile the Next.js/PostgreSQL/password documentation baseline with the initialized React, Express, tRPC, MySQL, and managed-auth workspace.
- [x] Update the repository technical documents with the actual workspace architecture and production payment/auth prerequisites.
- [x] Define the Phase A database schema for unified Member profiles, programs, donations, expenses, audit events, feature flags, and derived financial totals.
- [x] Apply the Phase A database migration and implement typed tRPC queries and mutations for public transparency data.
- [x] Implement registration-gated Member access, self-service profile management, and public-display controls.
- [x] Build the mobile-first public homepage, program pages, live-style summary, public ledgers, and opt-in donor wall.
- [x] Build the protected admin operations area for auditable offline donations, expenses, and ledger review.
- [x] Prepare Razorpay checkout, webhook, reconciliation, and receipt workflows behind explicit configuration gates without enabling live payments.
- [x] Add disabled feature-flag scaffolding for community, restricted voter-document review, and voting.
- [x] Add and run Vitest coverage for financial derivation, authentication, and payment-gate behavior.
- [x] Verify the responsive UI, development build, and core user flows before delivery.
- [x] Push the reconciled documentation and implementation to GitHub.
- [x] Add editable full-profile management for existing Members, including accurate contact and village/ward updates.
- [x] Add individual public program detail routes and link each program listing to its detail page.
- [x] Add gated Razorpay workflow scaffolding for order preparation, webhook signature-validation entrypoint, reconciliation, and receipts without enabling live payments.
- [x] Add explicit disabled voter-document-review API and UI scaffolding bound to feature flags.
- [x] Verify safe Member/admin UI states and exercise the server-enforced payment gate through an authenticated typed-contract test without creating production financial or identity records.
