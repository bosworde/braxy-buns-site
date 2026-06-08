"use client"

import { useState } from "react"
import Link from "next/link"
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
}

export default function TunnelWelcomePage() {
  const [plate, setPlate] = useState("")
  const [member, setMember] = useState<Member | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  async function lookupPlate() {
    setLoading(true)
    setMessage("")
    setMember(null)

    const cleanPlate = plate.replace(/\s+/g, "").toLowerCase()

    if (!cleanPlate) {
      setMessage("Enter a license plate.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .not("license_plate", "is", null)

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    const found =
      data?.find(
        (m) =>
          String(m.license_plate || "")
            .replace(/\s+/g, "")
            .toLowerCase() === cleanPlate
      ) || null

    if (!found) {
      setMessage("No member found for this plate.")
    } else {
      setMember(found)
    }

    setLoading(false)
  }

  const fullName = member
    ? `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
      member.email
    : ""

  const vehicle = member
    ? `${member.vehicle_color || ""} ${member.vehicle_make || ""} ${
        member.vehicle_model || ""
      }`.trim()
    : ""

  const isActive = member?.membership_status === "active"

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Braxy Buns Tunnel
            </p>
            <h1 className="mt-2 text-4xl font-bold">Tunnel Welcome Screen</h1>
            <p className="mt-2 text-slate-400">
              Simulate the customer-facing welcome display at the wash entrance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Dashboard
            </Link>
            <Link href="/admin/tunnel" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Tunnel Lookup
            </Link>
            <Link href="/admin/checkin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Check In
            </Link>
          </div>
        </div>

        <section className="rounded-2xl bg-white/10 p-6">
          <h2 className="text-2xl font-bold">Enter License Plate</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            <input
              className="w-full max-w-md rounded-xl bg-white p-4 text-xl font-bold uppercase text-slate-950"
              placeholder="ABC1234"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") lookupPlate()
              }}
            />

            <button
              onClick={lookupPlate}
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 disabled:opacity-50"
            >
              {loading ? "Looking..." : "Show Welcome Screen"}
            </button>
          </div>

          {message && (
            <p className="mt-4 font-semibold text-cyan-300">{message}</p>
          )}
        </section>

        {member && (
          <section className="overflow-hidden rounded-[2rem] border border-cyan-300/40 bg-slate-900 shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-1">
              <div className="rounded-[1.8rem] bg-slate-950 p-10 text-center">
                <p className="text-lg font-bold uppercase tracking-[0.5em] text-cyan-300">
                  Welcome Back
                </p>

                <h2 className="mt-6 text-6xl font-black uppercase tracking-wide md:text-8xl">
                  {fullName}
                </h2>

                <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
                  <WelcomeCard title="Membership" value={member.membership_plan || "Prospect"} />
                  <WelcomeCard title="Status" value={member.membership_status || "inactive"} />
                  <WelcomeCard title="Plate" value={member.license_plate || "—"} />
                </div>

                <div className="mx-auto mt-6 grid max-w-5xl gap-4 md:grid-cols-3">
                  <WelcomeCard title="Braxy Bucks" value={`${member.rewards_points || 0} pts`} />
                  <WelcomeCard title="Lifetime Washes" value={member.lifetime_washes || 0} />
                  <WelcomeCard title="Vehicle" value={vehicle || "Not added"} />
                </div>

                <div
                  className={`mx-auto mt-10 max-w-3xl rounded-2xl p-6 text-3xl font-black uppercase ${
                    isActive
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {isActive ? "Clear To Wash" : "See Attendant"}
                </div>

                <p className="mx-auto mt-8 max-w-3xl text-2xl font-bold text-white">
                  Thank you for supporting meaningful employment for
                  neurodiverse team members.
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function WelcomeCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        {title}
      </p>
      <p className="mt-3 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  )
}