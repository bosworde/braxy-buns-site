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
  try {
    const { memberId, subscriptionId } = await req.json()

    if (!memberId) {
      return NextResponse.json(
        { error: "Missing member ID" },
        { status: 400 }
      )
    }

    if (subscriptionId) {
      await stripe.subscriptions.cancel(subscriptionId)
    }

    const { error } = await supabase
      .from("members")
      .update({ membership_status: "cancelled" })
      .eq("id", memberId)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: subscriptionId
        ? "Stripe subscription cancelled and member marked cancelled."
        : "Member marked cancelled. No Stripe subscription ID found.",
    })
  } catch (err: any) {
    console.error("Cancel subscription error:", err)

    return NextResponse.json(
      { error: err.message || "Cancellation failed" },
      { status: 500 }
    )
  }
}