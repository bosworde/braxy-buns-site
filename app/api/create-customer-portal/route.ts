import { NextResponse } from "next/server"
import Stripe from "stripe"
import { authenticatedMember, MemberError } from "@/lib/member/server"
export const runtime = "nodejs"
export async function POST(request: Request) {
  try {
    const { member } = await authenticatedMember(request)
    if (!member?.stripe_customer_id) throw new MemberError("No billing account is linked to your membership.", 404)
    if (!process.env.STRIPE_SECRET_KEY) throw new MemberError("Billing is temporarily unavailable.", 503)
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const portal = await stripe.billingPortal.sessions.create({
      customer: member.stripe_customer_id,
      return_url: new URL("/app", process.env.NEXT_PUBLIC_SITE_URL || "https://braxybuns.com").toString(),
    })
    return NextResponse.json({ url: portal.url }, { headers: { "Cache-Control": "private, no-store" } })
  } catch (error) {
    return NextResponse.json({ error: error instanceof MemberError ? error.message : "We couldn’t open billing. Please try again." }, { status: error instanceof MemberError ? error.status : 500 })
  }
}
