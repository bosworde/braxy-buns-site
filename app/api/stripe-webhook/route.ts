import { NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { supabase } from "@/lib/supabase"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook signature or secret." },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error("Stripe webhook signature error:", error)

    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    )
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const email =
      session.customer_email ||
      session.metadata?.email ||
      ""

    const firstName = session.metadata?.firstName || ""
    const lastName = session.metadata?.lastName || ""
    const planName = session.metadata?.planName || "Max Shine Club"
    const licensePlate = session.metadata?.licensePlate || ""
    const vehicleMake = session.metadata?.vehicleMake || ""
    const vehicleModel = session.metadata?.vehicleModel || ""
    const vehicleColor = session.metadata?.vehicleColor || ""

    if (!email) {
      return NextResponse.json(
        { error: "Missing customer email." },
        { status: 400 }
      )
    }

    const cleanEmail = email.toLowerCase()
    const cleanPlate = licensePlate.toUpperCase()

    const { data: existingMember } = await supabase
      .from("members")
      .select("id")
      .or(`email.eq.${cleanEmail},license_plate.eq.${cleanPlate}`)
      .maybeSingle()

    if (!existingMember) {
      const { error } = await supabase.from("members").insert({
        first_name: firstName,
        last_name: lastName,
        email: cleanEmail,
        license_plate: cleanPlate,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_color: vehicleColor,
        membership_plan: planName,
        membership_status: "active",
        rewards_points: 0,
        lifetime_washes: 0,
      })

      if (error) {
        console.error("Supabase member creation error:", error)

        return NextResponse.json(
          { error: "Unable to create member." },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}