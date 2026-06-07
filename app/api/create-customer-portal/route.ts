import { NextResponse } from "next/server"
import Stripe from "stripe"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export async function POST(req: Request) {
  try {
    const { customerId } = await req.json()

    if (!customerId) {
      return NextResponse.json(
        { error: "Missing Stripe customer ID" },
        { status: 400 }
      )
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: "https://www.braxybuns.com/account",
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err: any) {
    console.error("Customer portal error:", err)

    return NextResponse.json(
      { error: err.message || "Could not create customer portal session" },
      { status: 500 }
    )
  }
}