# Braxy Buns launch and rollback procedure

## Current state
The public main deployment is unchanged. feature/member-app is the review preview. Sandbox checkout uses the dedicated preview webhook. Preview and main currently share Supabase: this is a launch blocker for unrestricted external testing.

## Before scheduling launch
1. Connect and verify the live Stripe account. Confirm account activation, payout setup, approved membership terms, cancellation/refund terms, opening date and charge start date. Confirm tax treatment and any required registration with the accountant. Do not silently enable taxes or begin charging founding members early.
2. Create live monthly USD products/prices for Gecko $24.99, Iguana $34.99, Dragon $44.99; provide all three production price overrides. Configure live credentials as sensitive production-only variables and sandbox credentials as preview-only. Never put secrets in source or client code. The app now refuses production billing with test keys or missing explicit live prices.
3. Separate staging Supabase from production before inviting testers. Apply migrations in order, configure the correct auth callback allowlist, and seed only dedicated test identities. Do not clone personal data unnecessarily.
4. Verify all three hosted signup flows using dedicated test accounts, then check sign-out, email-link return, canceled checkout, payment failure/recovery, duplicate submissions, portal updates/cancellation and the resulting pass status. A repeated visit should never add points twice. Perform iOS and Android device checks.
5. Agree an operational policy for refund, dispute and fraud alerts. Alerts create a durable review task; they do not automatically cancel subscriptions, refund money or suspend membership. Staff must review and act in Stripe. Configure external delivery/monitoring for database outages as well: an in-app alert cannot be saved when its database is down.

## Controlled production cutover
- Record the currently serving production deployment ID, environment-variable versions and database backup/recovery capability. Do not record plaintext secrets.
- Register the production webhook with the verified live account and production URL; set its production-only signing secret. Use the events implemented in app/api/stripe-webhook/route.ts, including refund/dispute/fraud events. Keep live and test destinations separate.
- Retire the old sandbox webhook to main only after confirming it has no remaining dependent workflow. Its old checkout-only handler shares the database and must not compete with the new writer. Preserve event IDs and replay any failed/unprocessed events to the correct endpoint after cutover.
- Merge the reviewed branch and wait for the production build. Verify redirects, anonymous denial on account/admin APIs, signature rejection, and a dedicated approved live transaction only after the business authorizes the amount and subscription. Never use a customer's account for testing.
- Begin with invited members; monitor Stripe deliveries and admin billing alerts. Confirm signed-in users see only their account and plan.
- Keep automatic gate/tunnel activation disabled until the installer validates physical interlocks, actual controller acknowledgments, network failure behavior and real camera performance. Recording admission does not start equipment.

## Rollback
- Stop accepting new signups before restoring an old build if the old billing handler is incompatible with the current schema or credentials.
- Restore the recorded compatible deployment and its correctly scoped configuration through Vercel. Do not blindly restore main's historical checkout-only webhook.
- Keep database additions in place; do not drop billing-event, alert, lease or visit records. These are audit and idempotency data.
- If rolling back to a build without risk-event handling, pause/route those webhook events deliberately and retain their IDs for replay; otherwise they could be acknowledged without review alerts.
- Inspect failed Stripe deliveries and reconcile current subscriptions after recovery. Do not issue refunds or recreate subscriptions as a generic rollback step.
- Re-run account isolation, one tier checkout, webhook sync and admission duplicate tests before reopening.

## Browser walkthrough status
Desktop plan selection confirmed Gecko/Iguana/Dragon update the selected-plan summary and button to $24.99/$34.99/$44.99. This browser is signed out; hosted authenticated checkout and portal tests still require sign-in. Unit tests and a successful build do not replace those tests.
