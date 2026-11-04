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
- Add explicit refund/dispute/fraud handling and operational alerts before public paid launch. Existing lifecycle handling alone does not cover these cases.
- Confirm applicable tax treatment and registration with the business's accountant before configuring tax collection; sandbox prices currently have unspecified tax behavior.
- Configure durable error alerting. Recent 20-minute preview error-log query returned no records; that is not proof that all customer flows succeed.

## Physical LPR acceptance checklist
At the installed lane, test authorized, unknown, canceled and unpaid plates; day/night/glare/rain; approach angles and moving cars; ambiguous plates and repeated frames; network/camera outage; and actual controller acknowledgments. Confirm an outage cannot activate equipment. Have the equipment installer verify vehicle sensors, emergency stop and gate/tunnel interlocks. No software test here verifies physical safety or throughput.

## Deployment
Keep the work in feature/member-app and its preview. Production merge requires completion of the remaining gates, not merely a successful build.
