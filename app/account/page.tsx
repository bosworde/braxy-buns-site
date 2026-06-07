"use client"

import { useEffect, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  membership_plan: string | null
  membership_status: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  license_plate: string | null
  rewards_points: number | null
  lifetime_washes: number | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
}

export default function AccountPage() {
  const [email, setEmail] = useState("")
  const [member, setMember] = useState<Member | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [billingLoading, setBillingLoading] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem("braxy_member_email")

    if (savedEmail) {
      setEmail(savedEmail)
      findAccount(savedEmail)
    }
  }, [])

  async function findAccount(emailOverride?: string) {
    setMessage("")
    setMember(null)
    setLoading(true)

    const cleanEmail = (emailOverride || email).trim().toLowerCase()

    if (!cleanEmail) {
      setMessage("Enter your email address.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("email", cleanEmail)
      .maybeSingle()

    setLoading(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data) {
      setMessage("No membership found for that email.")
      return
    }

    localStorage.setItem("braxy_member_email", cleanEmail)
    setEmail(cleanEmail)
    setMember(data)
  }

  function logout() {
    localStorage.removeItem("braxy_member_email")
    setEmail("")
    setMember(null)
    setMessage("You have been logged out.")
  }

  function downloadQrCode() {
    const canvas = document.getElementById(
      "member-qr-code"
    ) as HTMLCanvasElement | null

    if (!canvas || !member) {
      setMessage("QR code not ready yet.")
      return
    }

    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")

    const fileName = `${member.first_name || "braxy"}-${
      member.last_name || "buns"
    }-qr-pass.png`
      .toLowerCase()
      .replace(/\s+/g, "-")

    link.href = image
    link.download = fileName
    link.click()
  }

  async function manageBilling() {
    if (!member?.stripe_customer_id) {
      setMessage("No Stripe customer ID found for this member.")
      return
    }

    setBillingLoading(true)
    setMessage("")

    try {
      const res = await fetch("/api/create-customer-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: member.stripe_customer_id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Could not open billing portal.")
        setBillingLoading(false)
        return
      }

      window.location.href = data.url
    } catch (err: any) {
      setMessage(err.message || "Could not open billing portal.")
      setBillingLoading(false)
    }
  }

  const fullName = member
    ? `${member.first_name || ""} ${member.last_name || ""}`.trim()
    : ""

  const vehicle = member
    ? `${member.vehicle_color || ""} ${member.vehicle_make || ""} ${
        member.vehicle_model || ""
      }`.trim()
    : ""

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <h1 className="text-4xl font-bold">My Braxy Buns Pass</h1>

      <p className="mt-3 max-w-xl text-slate-300">
        Log in with your membership email to view your digital wash pass and
        manage your billing.
      </p>

      {!member && (
        <div className="mt-8 flex max-w-2xl gap-3">
          <input
            className="w-full rounded-xl bg-white p-4 text-slate-950"
            placeholder="Email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={() => findAccount()}
            className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </div>
      )}

      {message && <p className="mt-6 font-semibold text-cyan-300">{message}</p>}

      {member && (
        <>
          <div className="mt-6 flex max-w-3xl flex-wrap gap-3">
            <button
              onClick={() => findAccount(member.email)}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Refresh Pass
            </button>

            <button
              onClick={downloadQrCode}
              className="rounded-xl bg-white/10 px-5 py-3 font-bold text-white"
            >
              Download QR
            </button>

            <button
              onClick={manageBilling}
              disabled={billingLoading}
              className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-slate-950 disabled:opacity-50"
            >
              {billingLoading ? "Opening..." : "Manage Billing"}
            </button>

            <button
              onClick={logout}
              className="rounded-xl bg-white/10 px-5 py-3 font-bold text-white"
            >
              Log Out
            </button>
          </div>

          <section className="mt-6 max-w-md rounded-3xl bg-white p-6 text-slate-950">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
              Braxy Buns
            </p>

            <h2 className="mt-2 text-3xl font-bold">{fullName || "Member"}</h2>

            <p className="mt-1 font-semibold text-cyan-700">
              {member.membership_plan || "Prospect"}
            </p>

            <div className="mt-2 inline-block rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">
              {member.membership_status || "inactive"}
            </div>

            <div className="mt-6 flex justify-center">
              <QRCodeCanvas id="member-qr-code" value={member.id} size={220} />
            </div>

            <div className="mt-6 space-y-2 text-sm">
              <p>
                <span className="font-bold">Email:</span> {member.email}
              </p>

              <p>
                <span className="font-bold">Plate:</span>{" "}
                {member.license_plate || "Not added"}
              </p>

              <p>
                <span className="font-bold">Vehicle:</span>{" "}
                {vehicle || "Not added"}
              </p>

              <p>
                <span className="font-bold">Braxy Bucks:</span>{" "}
                {member.rewards_points || 0}
              </p>

              <p>
                <span className="font-bold">Lifetime Washes:</span>{" "}
                {member.lifetime_washes || 0}
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Show this QR pass at the tunnel check-in.
            </p>
          </section>
        </>
      )}
    </main>
  )
}