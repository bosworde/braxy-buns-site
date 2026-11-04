import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { serviceDatabase, MemberError } from "@/lib/member/server"
import { stripeClient, objectId } from "@/lib/billing/stripe"
import { billingLock } from "@/lib/billing/lock"
import { saveSubscription } from "@/lib/billing/sync"
export const runtime = "nodejs"
const handled = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "customer.subscription.paused", "customer.subscription.resumed", "invoice.paid", "invoice.payment_failed", "invoice.payment_action_required"])
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 })
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 })
  let stripe: Stripe
  try { stripe = stripeClient() } catch { return NextResponse.json({ error: "Billing environment is not configured." }, { status: 503 }) }
  let event: Stripe.Event
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret) }
  catch { return NextResponse.json({ error: "Invalid signature." }, { status: 400 }) }
  if (event.livemode !== /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY || "")) return NextResponse.json({ error: "Billing mode mismatch." }, { status: 400 })
  if (!handled.has(event.type)) return NextResponse.json({ received: true })
  try {
    let subscriptionId: string | null = null
    if (event.type.startsWith("checkout.session.")) subscriptionId = objectId((event.data.object as Stripe.Checkout.Session).subscription)
    else if (event.type.startsWith("customer.subscription.")) subscriptionId = (event.data.object as Stripe.Subscription).id
    else subscriptionId = objectId((event.data.object as Stripe.Invoice).parent?.subscription_details?.subscription)
    if (!subscriptionId) return NextResponse.json({ received: true }) // Non-subscription invoices.
    const db = serviceDatabase()
    const { data: processed, error: processedError } = await db.from("braxy_billing_events").select("event_id").eq("event_id", event.id).maybeSingle()
    if (processedError) throw new MemberError("Billing migration is required.", 503)
    if (processed) return NextResponse.json({ received: true })
    const initial = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["latest_invoice"] })
    const customerId = objectId(initial.customer)
    const { data: existing, error } = await db.from("members").select("email,stripe_subscription_id").eq("stripe_customer_id", customerId).maybeSingle()
    if (error) throw new MemberError("Member lookup failed.", 503)
    let email = existing?.email as string | undefined
    if (!email) {
      // New accounts must come from authenticated checkout, not caller-provided email metadata.
      const userId = initial.metadata.auth_user_id
      if (!userId) throw new MemberError("Unlinked legacy subscription needs review.", 409)
      const { data, error: authError } = await db.auth.admin.getUserById(userId)
      if (authError || !data.user?.email_confirmed_at || !data.user.email) throw new MemberError("Membership identity could not be verified.", 409)
      email = data.user.email.trim().toLowerCase()
    }
    const ownerEmail = email
    await billingLock(db, ownerEmail, async token => {
      // Retrieve after acquiring the lock; old events must reconcile today's Stripe state.
      let current = await stripe.subscriptions.retrieve(subscriptionId!, { expand: ["latest_invoice"] })
      const { data: latest, error: latestError } = await db.from("members").select("stripe_subscription_id").eq("email", ownerEmail).maybeSingle()
      if (latestError) throw new MemberError("Member lookup failed.", 503)
      if (latest?.stripe_subscription_id && latest.stripe_subscription_id !== current.id) {
        const linked = await stripe.subscriptions.retrieve(latest.stripe_subscription_id, { expand: ["latest_invoice"] })
        if (linked.created >= current.created) current = linked
      }
      if (objectId(current.customer) !== customerId) throw new MemberError("Billing account mismatch.", 409)
      await saveSubscription(db, current, ownerEmail, token, event.id)
    })
    return NextResponse.json({ received: true })
  } catch {
    // Do not acknowledge a failed write: Stripe retries this event. Do not log payloads or personal data.
    console.error("Stripe membership synchronization failed", { eventId: event.id, type: event.type })
    return NextResponse.json({ error: "Membership synchronization failed. Retry this event." }, { status: 503 })
  }
}
