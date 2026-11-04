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

## Review before production launch

This pull request is a draft integration, not evidence that live services or the entire pre-existing platform are secure.

1. **Database policies:** inspect Supabase RLS and grants on `members`, `wash_visits`, and operational tables. Ensure anonymous clients cannot read member profiles, and authenticated users cannot edit billing IDs, plans, statuses, points, or other customers. No SQL policy/schema files are present in this repository. Client-side admin guards are not a database security boundary. Review policy changes alongside the existing admin workflows.
2. **Pre-existing cancellation endpoint:** `/api/cancel-subscription` accepts caller-supplied member/subscription IDs without server authentication. It must be protected and the admin caller updated before customer launch. This draft does not modify that separate admin workflow.
3. **Subscription lifecycle:** the current Stripe webhook only handles checkout completion. Verify payment status and synchronize renewals, failed payments, cancellations, and subscription changes before relying on the stored `membership_status` to grant wash eligibility. Stripe portal changes otherwise may leave the local status stale.
4. **Operational APIs:** audit server authentication on LPR/check-in/tunnel actions and validate real eligibility at every admission. A downloaded member-ID QR identifies a member; it is not proof of a currently paid subscription.
5. **Existing admin logging:** remove session logging in `app/admin/AdminGuard.tsx` before launch; it includes session data in the browser console.
6. **Account matching:** existing membership emails should be normalized to lowercase and unique. Verify `wash_visits.member_id` links to the correct member. The app reports history failures separately from profile failures.
7. **Paid signup:** the existing `/join` and checkout implementation are reused, not replaced. Verify the existing Stripe price IDs, return URLs, webhook delivery, duplicate-subscription handling, terms, and opening policy before accepting payments.

## Verification

Run `node --test tests/member-security.test.cjs` for focused regression tests covering missing/invalid authentication, verified-email ownership, vehicle-field allowlisting, billing ownership, and rewards boundaries.

Run `npx tsc --noEmit` and `npm run build` with the required environment configured. Placeholder values can validate compilation but cannot validate sign-in, database access, Stripe, or tunnel operations.

In a test deployment, verify: email-link login; a member with no linked record; active/inactive pass display; sign-out; vehicle validation and reload; cross-account denial; empty/error/loaded wash history; billing return; all legacy redirects; mobile layout; home-screen installation. Do not test with real charges or live tunnel controls.

### Local validation for this draft

- TypeScript check passed.
- Production build passed, including `/app`, `/api/member`, the app manifest, and icons. Build-only placeholder environment values were used; no live credentials or transactions were involved.
- All six focused regression tests passed.
- Browser QA was blocked by the managed preview launcher passing Vite-style `--host` and `--strictPort` flags to Next.js. No application runtime was changed to work around the launcher. Verify the responsive screens and interactions on the Vercel preview before merge.
