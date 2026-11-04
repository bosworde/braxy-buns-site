import { NextResponse } from "next/server"
import { authenticatedAdmin, MemberError } from "@/lib/member/server"
import { stripeClient, objectId } from "@/lib/billing/stripe"
import { billingLock } from "@/lib/billing/lock"
import { saveSubscription } from "@/lib/billing/sync"
export const runtime = "nodejs"
export async function POST(request: Request) {
  try {
    const { db } = await authenticatedAdmin(request)
    const body = await request.json().catch(() => null)
    if (!body || typeof body.memberId !== "string" || !/^[0-9a-f-]{36}$/i.test(body.memberId)) throw new MemberError("A valid member ID is required.", 400)
    const { data: member, error } = await db.from("members").select("id,email,stripe_customer_id,stripe_subscription_id").eq("id", body.memberId).maybeSingle()
    if (error) throw new MemberError("Couldn’t load the membership.", 503)
    if (!member) throw new MemberError("Membership not found.", 404)
    if (!member.stripe_subscription_id || !member.stripe_customer_id) throw new MemberError("No Stripe subscription is linked. Review this membership manually.", 409)
    const stripe = stripeClient()
    await billingLock(db, member.email, async token => {
      // Supplied subscription IDs are ignored. Only the member's stored Stripe relationship is used.
      const subscription = await stripe.subscriptions.retrieve(member.stripe_subscription_id, { expand: ["latest_invoice"] })
      if (objectId(subscription.customer) !== member.stripe_customer_id) throw new MemberError("Billing account mismatch. Contact support.", 409)
      const canceled = subscription.status === "canceled" ? subscription : await stripe.subscriptions.cancel(subscription.id)
      await saveSubscription(db, canceled, member.email, token)
    })
    return NextResponse.json({ success: true, message: "Subscription cancelled and membership updated." }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof MemberError ? error.message : "Cancellation could not be confirmed. Refresh before trying again." }, { status: error instanceof MemberError ? error.status : 500 })
  }
}
