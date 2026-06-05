import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

const priceMap: Record<string, string> = {
  "Basic Wash Club": "price_1TezMO193rp9H3JHdrEW84XD",
  "Plus Wash Club": "price_1TezNT193rp9H3JHptxSYLaJ",
  "Max Shine Club": "price_1TezO8193rp9H3JHyzHPvkOH",
}

export async function POST(request: Request) {
  const { planName, email } = await request.json()

  const priceId = priceMap[planName]

  if (!priceId) {
    return NextResponse.json(
      { error: "Invalid plan selected." },
      { status: 400 }
    )
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000/dashboard",
    cancel_url: "http://localhost:3000/membership",
    metadata: {
      planName,
      email,
    },
  })

  return NextResponse.json({ url: session.url })
}