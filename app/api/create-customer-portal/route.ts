import { NextResponse } from "next/server"
import { stripeClient, siteOrigin } from "@/lib/billing/stripe"
import { authenticatedMember, MemberError } from "@/lib/member/server"
export const runtime = "nodejs"
export async function POST(request: Request) {
  try {
    const { member } = await authenticatedMember(request)
    if (!member?.stripe_customer_id) throw new MemberError("No billing account is linked to your membership.", 404)
    const stripe = stripeClient()
    const portal = await stripe.billingPortal.sessions.create({
      customer: member.stripe_customer_id,
      return_url: `${siteOrigin()}/app`,
    })
    return NextResponse.json({ url: portal.url }, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof MemberError ? error.message : "We couldn’t open billing. Please try again." }, { status: error instanceof MemberError ? error.status : 500 })
  }
}
