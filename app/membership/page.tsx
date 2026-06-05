"use client"

import { useState } from "react"
import BottomNav from "@/components/BottomNav"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const plans = [
  {
    name: "Basic Wash Club",
    price: "$24.99/mo",
    description: "Great for routine exterior washes.",
  },
  {
    name: "Plus Wash Club",
    price: "$34.99/mo",
    description: "Our best everyday value with upgraded shine.",
  },
  {
    name: "Max Shine Club",
    price: "$44.99/mo",
    description: "Premium wash experience with our top package.",
  },
]

export default function MembershipPage() {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [loadingPlan, setLoadingPlan] = useState("")

  async function joinPlan(planName: string) {
    setLoadingPlan(planName)
    setMessage("")

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user

    if (!user?.email) {
      setMessage("Please log in first.")
      router.push("/login")
      return
    }

    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        planName,
        email: user.email,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      setMessage(data.error || "Unable to start checkout.")
      setLoadingPlan("")
      return
    }

    window.location.href = data.url
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 pb-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Unlimited Wash Club
        </p>

        <h1 className="mt-4 text-4xl font-bold">Choose your membership</h1>

        <p className="mt-4 max-w-2xl text-slate-300">
          Join Braxy Buns Wash Club and keep your car clean all month while
          supporting meaningful employment for neurodiverse team members.
        </p>

        {message && <p className="mt-6 text-cyan-300">{message}</p>}

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-2xl bg-white/10 p-6">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="mt-3 text-slate-300">{plan.description}</p>
              <p className="mt-6 text-3xl font-bold">{plan.price}</p>

              <button
                onClick={() => joinPlan(plan.name)}
                disabled={loadingPlan === plan.name}
                className="mt-6 w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-60"
              >
                {loadingPlan === plan.name ? "Opening Checkout..." : "Join Now"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}