import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

const priceMap: Record<string, string> = {
  "Gecko Wash Club": "price_1TezMO193rp9H3JHdrEW84XD",
  "Iguana Wash Club": "price_1TezNT193rp9H3JHptxSYLaJ",
  "Dragon Wash Club": "price_1TezO8193rp9H3JHyzHPvkOH",
}

export async function POST(request: Request) {
  try {
    const {
      planName,
      email,
      firstName,
      lastName,
      licensePlate,
      vehicleMake,
      vehicleModel,
      vehicleColor,
    } = await request.json()

    const priceId = priceMap[planName]

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan selected." },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      )
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email.toLowerCase(),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/account?success=true`,
      cancel_url: `${baseUrl}/join?canceled=true`,
      metadata: {
        planName,
        email: email.toLowerCase(),
        firstName: firstName || "",
        lastName: lastName || "",
        licensePlate: licensePlate || "",
        vehicleMake: vehicleMake || "",
        vehicleModel: vehicleModel || "",
        vehicleColor: vehicleColor || "",
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)

    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    )
  }
}