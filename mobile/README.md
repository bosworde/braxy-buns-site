# Braxy Buns mobile release

The first release is a free pre-opening app for iPhone and Android. It uses
the same accounts and saved profiles as braxybuns.com. It provides club
comparison, a garage, registration confirmation, and a rewards preview.
Wash passes, earning and redeeming rewards, and paid enrollment open later.

## Run and build

1. From this directory run `npm ci`. Copy `.env.example` to `.env.local`
   and set the Supabase project URL and publishable key. Never use a service
   role key. Use a test project and deployment for deletion tests.
2. In Supabase Auth, include the one-time code variable `{{ .Token }}` in
   the confirmation and magic-link emails and keep `{{ .ConfirmationURL }}`
   for the existing website. Configure production SMTP if needed. Verify
   code delivery to a new customer and a returning customer, and verify
   that the website link still works.
3. Merge and deploy the website changes before connecting the production
   build. Verify `/privacy` and `/delete-account` are reachable and an
   unsigned request to `POST /api/account/delete` returns HTTP 401.
4. Link this directory to a Braxy Buns-owned Expo project with
   `npx eas-cli@latest build:configure`. Set the three public environment
   variables in the Expo preview and production environments. Use
   `npx eas-cli@latest build --platform all --profile production` for the
   store builds. Use a build image with Xcode 26+ and iOS 26 SDK. The
   project targets Android API 36. Build signing requires the owner’s
   Apple team access and a company-managed Android upload key.

## Store records

- Display name: **Braxy Buns Car Wash** (subject to store availability).
- iOS Bundle ID and Android package: `com.braxybuns.washclub`.
- App Store Connect SKU suggestion: `BRAXY-IOS-001`.
- Category: Lifestyle. Primary language: English (U.S.).
- Support: https://www.braxybuns.com/contact
- Privacy: https://www.braxybuns.com/privacy
- Google Play deletion URL: https://www.braxybuns.com/delete-account
- Pricing: Free.

Apple Account Holder: select the Braxy Buns LLC team in Apple Developer,
create an explicit App ID with the bundle ID above, then create the iOS
record in App Store Connect. Use the legal company name if the first app
creation asks for a developer name. Review any outstanding agreements in
App Store Connect. For Google Play, complete organization verification and
create the app as a free app.

## Draft store copy

**Subtitle:** Car wash club and garage

**Short description:** Explore Braxy Buns wash clubs and save your vehicle before opening.

**Description:** Get ready for Braxy Buns Car Wash. Compare the planned
Gecko, Iguana, and Dragon wash clubs, save your favorite club, and keep your
vehicle details in My Garage. Join free during pre-opening and update your
profile from your phone. Braxy Buns is building a premium car wash around
a mission of creating meaningful employment for neurodiverse people.

This release offers free pre-opening registration. Wash access, paid
memberships, and earning or redeeming rewards will be available later.

## Beta and review

- Use TestFlight and Google Play internal testing. Validate on real
  iPhone and Android devices. Exercise new email registration, returning
  sign-in, app relaunch, each club selection, optional vehicle fields,
  failed saves, confirmation visibility, sign-out, and deletion with a
  disposable account. Confirm the account cannot sign in after deletion
  and the pre-opening row is gone. Also confirm no payment is submitted.
- Provision a disposable, non-admin password account for each store's
  reviewers. The Garage tab has a **Sign in to a demo account** option.
  Add working credentials in the private review form. Give reviewers a
  separate disposable account for destructive deletion testing so they
  can continue using the primary review account. Keep credentials out
  of Git, public listings, and screenshots.
- Capture real build screenshots after testing. Suggested set: Home,
  Clubs, My Garage, and registration confirmation with sample data.
- Complete age/content ratings and Apple App Privacy / Google Data
  Safety forms. Verify categories against the final build and production
  providers. This source explicitly uses name, email, account ID,
  preferred club, optional vehicle details and license plate; hosting
  and authentication providers also process service and security data.
  The mobile app does not request camera or location or use payments.
- In review notes explain that the pre-opening app saves and manages real
  profiles and garage preferences, and that wash access and rewards
  redemption have not opened. A store may still find pre-opening utility
  insufficient. If it does, keep the beta available for testing and
  revisit public submission when customer wash access is ready.
