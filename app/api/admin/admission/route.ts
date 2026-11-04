import { NextResponse } from "next/server"
import { authenticatedAdmin, MemberError } from "@/lib/member/server"
import { stripeClient, membershipState, objectId } from "@/lib/billing/stripe"
import { billingLock } from "@/lib/billing/lock"
export const runtime = "nodejs"
export async function POST(request: Request) {
  try {
    const { db } = await authenticatedAdmin(request)
    const body = await request.json()
    const id = typeof body.memberId === "string" ? body.memberId : ""
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new MemberError("Select a member first.", 400)
    const { data: member, error } = await db.from("members").select("id,email").eq("id", id).maybeSingle()
    if (error) throw new MemberError("Membership lookup unavailable.", 503)
    if (!member) throw new MemberError("Member not found.", 404)
    const result = await billingLock(db, member.email, async token => {
      const { data: current, error: readError } = await db.from("members").select("stripe_customer_id,stripe_subscription_id,license_plate").eq("id", id).single()
      if (readError) throw new MemberError("Membership lookup unavailable.", 503)
      if (!current?.stripe_customer_id || !current.stripe_subscription_id) throw new MemberError("Paid membership has not been verified. Do not admit.", 409)
      const subscription = await stripeClient().subscriptions.retrieve(current.stripe_subscription_id, { expand: ["latest_invoice"] })
      if (objectId(subscription.customer) !== current.stripe_customer_id) throw new MemberError("Billing account mismatch. Do not admit.", 409)
      const state = membershipState(subscription)
      if (state.status !== "active") throw new MemberError("Membership is not currently paid and active. Do not admit.", 409)
      const { data, error: writeError } = await db.rpc("braxy_admit_wash", {
        p_member: id, p_token: token, p_subscription: subscription.id,
        p_customer: current.stripe_customer_id, p_plan: state.plan,
        p_plate: current.license_plate, p_commit: body.commit === true,
      })
      if (writeError) throw new MemberError("Could not verify or record admission. Do not admit; retry shortly.", 503)
      return data
    })
    return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    const status = error instanceof MemberError ? error.status : 503
    if (status >= 500) console.error("Wash admission unavailable")
    return NextResponse.json({ error: error instanceof MemberError ? error.message : "Verification unavailable. Do not admit; retry shortly." }, { status, headers: { "Cache-Control": "private, no-store" } })
  }
}
