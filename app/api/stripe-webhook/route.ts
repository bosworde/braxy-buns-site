import { NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"

export const runtime = "nodejs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function supabaseRequest(path: string, options: RequestInit = {}) {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase URL or service role key.")
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })

  const text = await response.text()

  if (!response.ok) {
    throw new Error(text || `Supabase request failed with ${response.status}`)
  }

  return text ? JSON.parse(text) : null
}

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
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error("Stripe webhook signature error:", error)

    return NextResponse.json(
      { error: "Invalid Stripe webhook signature." },
      { status: 400 }
    )
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      const email = session.customer_email || session.metadata?.email || ""
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

      const cleanEmail = email.trim().toLowerCase()
      const cleanPlate = licensePlate.trim().toUpperCase()

      const existingMembers = await supabaseRequest(
        `members?select=id&or=(email.eq.${encodeURIComponent(
          cleanEmail
        )},license_plate.eq.${encodeURIComponent(cleanPlate)})`
      )

      if (!existingMembers || existingMembers.length === 0) {
        await supabaseRequest("members", {
          method: "POST",
          headers: {
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
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
          }),
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown webhook processing error.",
      },
      { status: 500 }
    )
  }
}