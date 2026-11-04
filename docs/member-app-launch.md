# Braxy Buns member app

The member experience is integrated into the existing Next.js site at `/app`. It does not need another domain, website, database, or Stripe account. The public homepage and shared site navigation now link to it. Existing `/account`, `/dashboard`, `/qr-pass`, and `/rewards` URLs redirect into the app.

## Included

- Responsive member dashboard, existing logo and tier artwork, and Gecko ($24.99), Iguana ($34.99), Dragon ($44.99) plan information.
- Supabase email-link sign-in and authenticated membership lookup. The existing auth callback returns to `/app`.
- Active-member QR passes using the existing member-ID format expected by check-in; inactive memberships do not receive a pass.
- Rewards milestones, recent wash history (up to 50 visits, Central time), vehicle updates, and Stripe billing portal access.
- Optional sample preview clearly separated from real accounts. Sample data never writes to the database or awards points.
- App-specific web manifest and icons, plus phone home-screen installation instructions. Online access is required; no private member responses are cached in a service worker.

## Configuration already used by this repository

Use the existing Vercel environment values. Do not commit secrets:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `STRIPE_SECRET_KEY` (server only)
- `NEXT_PUBLIC_SITE_URL` (canonical production origin, such as `https://braxybuns.com`)

The app-specific server routes verify the bearer token with Supabase and use the verified, confirmed email to locate the membership. They do not accept a caller-selected member or Stripe customer as proof of identity. Vehicle writes allow only make, model, color, and plate. The billing endpoint now requires a signed-in user and resolves the Stripe customer on the server.

The Supabase auth redirect allowlist must permit the canonical site's `/auth/callback` and the exact authorized preview callback URL when testing. Do not broadly allow arbitrary preview domains. Use a dedicated test environment and Stripe test mode for end-to-end verification.

## Foundation changes

Server-verified, confirmed-email identity now protects checkout, billing, vehicle edits, cancellation and LPR scanning. Cancellation and LPR require an existing administrator. Session logging was removed. Checkout serializes attempts per account and reuses Stripe idempotency keys; it rejects duplicate subscriptions. Webhooks verify signatures and mode, retrieve current subscription state, and record successful events transactionally. Renewals preserve points and customer-edited profiles. Paid eligibility requires a recognized, unpaused active subscription with a paid latest invoice. Member refresh fails closed when Stripe verification is unavailable. Preview deployments reject live Stripe keys.

The migration in `supabase/migrations/20261104194519_member_foundation.sql` adds normalized unique member identities, restrictive administrator policies, service-only billing state, fenced billing leases and atomic reconciliation functions. It fails on invalid existing identity data rather than merging accounts. Inspect the actual schema, grants, functions, views and existing data before applying. This migration has NOT been applied remotely.

## Connected-service verification — 2026-11-04

- Stripe sandbox account `acct_1TezBR193rp9H3JH`: all three configured price IDs exist, are active monthly USD prices, and match $24.99 / $34.99 / $44.99. These are test prices, not production prices.
- Existing sandbox webhook `we_1TfPNm193rp9H3JHgGPU8FRD` targets the main deployment and subscribes only to `checkout.session.completed`. Do not point it at unconfigured code. After the migration and environment are verified, configure a preview webhook with checkout completed/async success/async failure; subscription created/updated/deleted/paused/resumed; invoice paid/payment failed/payment action required. Set its signing secret server-side.
- Vercel project `braxy-buns-site` exists. Configuration access returned 403 requiring the user's team-access grant. Environment values have not been verified.
- Supabase connection lists the Gmail organization but no projects. The real database schema and auth redirect allowlist remain unverified.

## Required before launch

1. Expose the existing Supabase project to the connection. Inspect schema and identity conflicts; test the migration against that schema, then apply through migrations. Audit exposed views/functions and operational admission workflows independently.
2. Grant Vercel team access. Configure preview credentials for the correct Supabase environment and Stripe sandbox, `STRIPE_WEBHOOK_SECRET`, and the exact Supabase auth callback allowlist. Optional price overrides are `STRIPE_GECKO_PRICE_ID`, `STRIPE_IGUANA_PRICE_ID`, `STRIPE_DRAGON_PRICE_ID`.
3. Configure the preview webhook after deployment and verify email login, checkout, duplicate submission, invoice failure/recovery, cancellation, billing return, vehicle reload and cross-account denial end to end. Backfill legacy Stripe links only after confirming ownership; legacy subscriptions without a linked customer or verified auth metadata deliberately require review.
4. Verify current paid eligibility at every operational admission. A saved member-ID QR is identity, not proof of payment. LPR camera matching, gate/tunnel integration and physical hardware have not been tested.
5. Decide opening/payment terms and activate production Stripe prices and keys separately. Review this draft before merging to production.

## Validation

`node --test tests/*.test.cjs`: 28 passing tests, including real PostgreSQL migration/RLS tests using PGlite, billing concurrency and fencing, duplicate/out-of-order webhook delivery, signature rejection, account ownership, unauthorized cancellation/LPR, and duplicate checkout prevention. Fixtures and mocked Stripe calls do not prove hosted integration.

Run `npm run build` with the required environment; placeholder credentials validate compilation only. The existing color-matched preview was visually checked previously; foundation integration still needs the connected end-to-end checks above.

## Database deployment update — November 4, 2026

Applied migrations 20261104194519 and 20261104194657 to the confirmed Braxy Buns project yhzhfljkonedrhvcclpf after schema and duplicate-identity checks. This supersedes earlier database-access and migration blockers above. All six business tables now have restrictive administrator policies and RLS; three internal billing tables deny all client access. Removed client TRUNCATE privileges and public execution of the infrastructure event trigger. The admin predicate is in a private schema. Live transaction tests verified customer read/write denial, admin visibility of all five existing members, and service access; all test writes rolled back. Security advisors no longer report disabled RLS or public privileged functions. Remaining leaked-password protection warning requires auth settings review; internal no-policy notices are intentional server-only denial. Vercel configuration, Stripe preview webhook and end-to-end customer testing remain outstanding.
