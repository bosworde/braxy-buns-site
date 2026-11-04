# Launch verification — November 4, 2026

## Scope and result
Preview only. Do not represent this as production or physical-equipment certification.

The customer flow is plan selection → authenticated Checkout → Stripe webhook → member status → paid wash pass → administrator admission.

## Verified and repaired
- All three sandbox prices are active USD monthly prices: Gecko 2499, Iguana 3499, Dragon 4499 cents. Automated route tests cover each selected tier and replacement of another tier's open checkout.
- Portal configuration allows payment-method updates, invoice history, and cancellation at period end. Subscription switching is disabled. This verifies configuration, not a completed portal interaction.
- Dedicated preview webhook is enabled for checkout, subscription lifecycle, and invoice success/failure/action-required events.
- Security advisors show no disabled-RLS table warning. Three no-policy notices are intentional server-only billing tables. Leaked-password protection remains disabled.
- Automated tests cover cross-account denial, paid eligibility, cancellations, failed-payment reconciliation, event replay, and duplicate checkout.
- Replaced five separate browser-side wash writers with one admin-authenticated admission endpoint. It retrieves current Stripe payment eligibility and refuses admission on unavailable billing, unsupported/inactive subscriptions, and customer mismatch.
- A service-only database function fences the billing lease, locks the member and plate, applies the existing one-wash-per-Central-day rule, and atomically writes the visit, rewards, and waiting queue. Tests cover duplicate requests, rollback on queue failure, expired leases and client-role denial.
- LPR photo scans with multiple plates or confidence below 90% require manual confirmation. This is a conservative initial threshold, not a calibrated hardware acceptance result.
- Signup fields now have explicit minimum widths to prevent narrow form-column overflow.
- Admission messaging explicitly says no physical equipment is activated. Existing legacy admin direct-write permissions remain available to the main deployment; operational rollout must migrate all writers before restricting those grants.

- Live database rollback test passed: one visit/reward increment, duplicate denial, and no client RPC access. All temporary changes rolled back. Migration version 20261104205507 is applied.

## Remaining launch gates
- Complete hosted, authenticated sandbox Checkout for each tier, portal payment update/cancellation, failure/recovery, and resulting member-pass state. Current session has no browser tool or customer session; unit tests are not a substitute.
- Verify iPhone/Android layout, email-link return and home-screen installation on devices. Prior desktop screenshots verified plan alignment; new mobile sizing is not device-tested.
- Only the sandbox Stripe account is connected. Live account readiness, live products/prices, production credentials, webhook signing secret and payment terms remain unverified. Do not enable real charges.
- Preview and production currently share Supabase and some environment definitions. Use isolated test data and move sandbox verification to a dedicated database before inviting external testers.
- Old sandbox webhook still sends checkout-completed events to main, which shares the database. Retire that legacy writer in a controlled cutover; do not silently disable existing website billing.
- Refund/dispute/fraud events now create durable administrator review alerts, linked through Stripe charge/payment/invoice/subscription records. Synchronization failures create alerts and successful retries resolve them. Staff review and external outage notification remain required; no automatic refunds or access revocation are implied.
- Confirm applicable tax treatment and registration with the business's accountant before configuring tax collection; sandbox prices currently have unspecified tax behavior.
- Configure durable error alerting. Recent 20-minute preview error-log query returned no records; that is not proof that all customer flows succeed.

## Physical LPR acceptance checklist
At the installed lane, test authorized, unknown, canceled and unpaid plates; day/night/glare/rain; approach angles and moving cars; ambiguous plates and repeated frames; network/camera outage; and actual controller acknowledgments. Confirm an outage cannot activate equipment. Have the equipment installer verify vehicle sensors, emergency stop and gate/tunnel interlocks. No software test here verifies physical safety or throughput.

## Deployment
Keep the work in feature/member-app and its preview. Production merge requires completion of the remaining gates, not merely a successful build.

## Additional completion pass
- 36 automated tests pass, including multi-invoice risk mapping, replay handling, alert isolation and production billing gates. Build and TypeScript checks pass.
- Signup preserves plan selection in its URL, on canceled Stripe checkout, and across same-browser email-link sign-in. Other-browser login returns safely to the app.
- Checkout uses Dashboard-controlled payment methods; delayed-payment eligibility remains gated on paid invoice and active subscription.
- Production billing refuses sandbox keys and missing explicit live price IDs.
- Admin dashboard displays open billing review alerts; alert access and review actions require server-verified admin identity. Alerts store Stripe resource IDs, not customer names, emails, card details or raw webhook payloads.
- Alert migration 20261104210537 applied; anonymous/customer direct reads denied.
- See [cutover and rollback procedure](launch-cutover.md). Public production deployment remains unchanged.

## Payment recovery follow-up (21:47 UTC onward)
- User screenshots/report verified sandbox portal cancellation at period end (December 4), wash pass still visible during the paid period, and cancellation reversal.
- Separate QA customer `cus_VZKd8uqSSdf9kC`, subscription `sub_1UYBzF193rp9H3JHC7zH5SYy`: initial Gecko invoice paid and deployed webhook set member active. A prorated Gecko-to-Iguana change with a declining test source produced a $10 open invoice and past_due status; the deployed webhook persisted past_due. Replacing the test source paid that same invoice and restored active status through the webhook. This was a subscription-update payment, NOT a time-advanced monthly renewal.
- Ran the actual admission route logic locally against the captured Stripe states: active accepted, past_due rejected (409) without calling admission RPC, recovered active accepted. Authentication/DB boundaries were stubbed for this local check; it was not an authenticated hosted admission request.
- Canceled the QA subscription after verification; deployed webhook persisted cancelled. No visits or rewards were created. Dennis's account was not mutated.
- Repaired the failed-payment screen: plain-language payment-needed status, direct secure billing action rather than signup, separate pending-payment and verification-outage wording. Render tests cover the actual MemberApp: no QR for unpaid states, QR restored when active, and offline recovery controls disabled.
- 40 automated tests pass. A signed-in browser test of the failed-payment UI remains outstanding.
- Monthly test-clock rollover is still outstanding: the connected Stripe tool exposes clock creation but no clock-advance operation. Dashboard fallback reaches the Stripe sign-in page; dashboard authentication is needed to continue. No unused clock was created.
