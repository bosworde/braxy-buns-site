// app/api/stripe-webhook/route.ts

import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err: any) {
    console.error("Stripe webhook signature error:", err.message)
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    )
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata || {}

      const email =
        metadata.email ||
        session.customer_email ||
        session.customer_details?.email ||
        ""

      const fullName = session.customer_details?.name || ""

      const firstName =
        metadata.firstName ||
        fullName.split(" ")[0] ||
        ""

      const lastName =
        metadata.lastName ||
        fullName.split(" ").slice(1).join(" ") ||
        ""

      const { error } = await supabase
        .from("members")
        .upsert(
          {
            email,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            membership_plan: metadata.planName || null,
            vehicle_make: metadata.vehicleMake || null,
            vehicle_model: metadata.vehicleModel || null,
            vehicle_color: metadata.vehicleColor || null,
            license_plate: metadata.licensePlate || null,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            membership_status: "active",
          },
          { onConflict: "email" }
        )

      if (error) {
        console.error("Supabase insert error:", error)
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error("Webhook handler error:", err)
    return NextResponse.json(
      { error: err.message || "Webhook failed" },
      { status: 500 }
    )
  }
}