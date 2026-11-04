import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { authenticatedMember, MemberError } from "@/lib/member/server"
import { stripeClient, prices, siteOrigin } from "@/lib/billing/stripe"
import { billingLock } from "@/lib/billing/lock"
export const runtime = "nodejs"
export async function POST(request: Request) {
  try {
    const { db, user, member } = await authenticatedMember(request)
    const email = user.email!.trim().toLowerCase()
    const body = await request.json().catch(() => null)
    if (!body || typeof body.planName !== "string" || !Object.prototype.hasOwnProperty.call(prices(), body.planName)) throw new MemberError("Choose a valid wash plan.", 400)
    const profile: Record<string, string> = { auth_user_id: user.id, email, planName: body.planName }
    for (const field of ["firstName", "lastName", "licensePlate", "vehicleMake", "vehicleModel", "vehicleColor"]) {
      if (typeof body[field] !== "string" || body[field].trim().length > 50) throw new MemberError("Please complete your member and vehicle details.", 400)
      profile[field] = body[field].trim()
    }
    profile.licensePlate = profile.licensePlate.replace(/\s+/g, "").toUpperCase()
    if (!profile.firstName || !profile.lastName || !/^[A-Z0-9-]{2,10}$/.test(profile.licensePlate)) throw new MemberError("Enter your name and a valid license plate.", 400)
    const stripe = stripeClient()
    const result = await billingLock(db, email, async token => {
      const { data: previous, error: readError } = await db.from("braxy_checkout_state").select("*").eq("email", email).maybeSingle()
      if (readError) throw new MemberError("Checkout setup is not ready.", 503)
      let customerId = member?.stripe_customer_id || previous?.customer_id
      if (!customerId) {
        const customer = await stripe.customers.create({ email, metadata: { auth_user_id: user.id } }, { idempotencyKey: `braxy-customer:${user.id}` })
        customerId = customer.id
      }
      const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 100 })
      if (subscriptions.has_more || subscriptions.data.some(s => !["canceled", "incomplete_expired"].includes(s.status))) {
        throw new MemberError("You already have a subscription. Manage your existing membership instead of purchasing another.", 409)
      }
      if (previous?.session_id) {
        const session = await stripe.checkout.sessions.retrieve(previous.session_id)
        if (session.status === "open" && session.url) {
          if (previous.price_id === prices()[body.planName]) return { url: session.url, resumed: true }
          // Close the old unpaid session before creating checkout for a different plan.
          // If payment completed concurrently, expiration fails and this request stops.
          await stripe.checkout.sessions.expire(session.id)
        }
        if (session.status === "complete") {
          // A completed checkout may be waiting on its webhook. Do not create a second subscription.
          const linked = typeof session.subscription === "string" ? await stripe.subscriptions.retrieve(session.subscription) : null
          if (!linked || !["canceled", "incomplete_expired"].includes(linked.status)) throw new MemberError("Your checkout is being synchronized. Refresh your membership shortly.", 409)
        }
      }
      // Persist the attempt and exact parameters before calling Stripe, so retries use the same key and data.
      if (previous && !previous.session_id && previous.price_id !== prices()[body.planName]) {
        throw new MemberError("Your previous checkout is still being prepared. Retry the original plan before switching plans.", 409)
      }
      const reuseAttempt = previous && !previous.session_id
      const attempt = reuseAttempt ? previous.attempt_id : randomUUID()
      const details = reuseAttempt ? previous.profile as Record<string, string> : profile
      const price = reuseAttempt ? previous.price_id : prices()[body.planName]
      const baseUrl = reuseAttempt ? previous.return_origin : siteOrigin()
      const { error: saveError } = await db.rpc("braxy_save_checkout", { p_email: email, p_token: token, p_state: { customer_id: customerId, attempt_id: attempt, profile: details, price_id: price, return_origin: baseUrl, session_id: null } })
      if (saveError) throw new MemberError("Couldn’t prepare checkout. Please try again.", 503)
      const session = await stripe.checkout.sessions.create({
        mode: "subscription", customer: customerId, client_reference_id: user.id,
        line_items: [{ price, quantity: 1 }],
        success_url: `${baseUrl}/app?checkout=success`, cancel_url: `${baseUrl}/join?plan=${details.planName.split(" ")[0].toLowerCase()}&canceled=true`,
        metadata: details, subscription_data: { metadata: details },
      }, { idempotencyKey: `braxy-checkout:${attempt}` })
      const { error: linkError } = await db.rpc("braxy_save_checkout", { p_email: email, p_token: token, p_state: { customer_id: customerId, attempt_id: attempt, profile: details, price_id: price, return_origin: baseUrl, session_id: session.id } })
      if (linkError || !session.url) throw new MemberError("Checkout could not be confirmed. Please try again.", 503)
      return { url: session.url }
    })
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof MemberError ? error.message : "Unable to start checkout. Please try again." }, { status: error instanceof MemberError ? error.status : 500 })
  }
}
