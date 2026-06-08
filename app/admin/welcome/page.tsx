"use client"

import { useState } from "react"
import Image from "next/image"
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
  const [fullscreenMode, setFullscreenMode] = useState(false)

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
    ? [member.vehicle_color, member.vehicle_make, member.vehicle_model]
        .filter(Boolean)
        .join(" ")
    : ""

  const isActive = member?.membership_status === "active"

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening"

  const plan = member?.membership_plan || "Prospect"

  const planBadgeClass = plan.includes("Max")
    ? "bg-yellow-400 text-slate-950"
    : plan.includes("Plus")
    ? "bg-blue-500 text-white"
    : plan.includes("Basic")
    ? "bg-green-500 text-white"
    : "bg-slate-700 text-white"

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        {!fullscreenMode && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
                  Braxy Buns Tunnel
                </p>
                <h1 className="mt-2 text-4xl font-bold">
                  Tunnel Welcome Screen
                </h1>
                <p className="mt-2 text-slate-400">
                  Simulate the customer-facing welcome display at the wash entrance.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin"
                  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/tunnel"
                  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
                >
                  Tunnel Lookup
                </Link>
                <Link
                  href="/admin/checkin"
                  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
                >
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

                {member && (
                  <button
                    onClick={() => setFullscreenMode(true)}
                    className="rounded-xl bg-purple-500 px-6 py-4 font-bold text-white"
                  >
                    Full Screen Mode
                  </button>
                )}
              </div>

              {message && (
                <p className="mt-4 font-semibold text-cyan-300">{message}</p>
              )}
            </section>
          </>
        )}

        {member && (
          <section className="overflow-hidden rounded-[2rem] border border-cyan-300/40 bg-slate-900 shadow-2xl">
            <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-1">
              <div className="rounded-[1.8rem] bg-slate-950 p-8 text-center md:p-10">
                {fullscreenMode && (
                  <button
                    onClick={() => setFullscreenMode(false)}
                    className="mb-6 rounded-xl bg-white/10 px-5 py-3 font-bold text-white"
                  >
                    Exit Full Screen
                  </button>
                )}

                <Image
                  src="/logo.png"
                  alt="Braxy Buns"
                  width={260}
                  height={120}
                  className="mx-auto mb-6"
                />

                <p className="text-lg font-bold uppercase tracking-[0.35em] text-cyan-300">
                  {greeting}
                </p>

                <p className="mt-3 text-lg font-bold uppercase tracking-[0.5em] text-cyan-300">
                  Welcome Back
                </p>

                <h2 className="mx-auto mt-6 max-w-6xl text-center text-5xl font-black uppercase leading-tight tracking-wide md:text-7xl">
                  {fullName}
                </h2>

                <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
                  <WelcomeCard title="Membership" value={plan} badgeClass={planBadgeClass} />
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

                <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white/10 p-6">
                  <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
                    Your Impact
                  </p>
                  <p className="mt-4 text-2xl font-bold text-white">
                    By choosing Braxy Buns, you help create meaningful employment
                    opportunities for neurodiverse team members.
                  </p>
                </div>
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
  badgeClass,
}: {
  title: string
  value: string | number
  badgeClass?: string
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        {title}
      </p>

      {badgeClass ? (
        <p
          className={`mt-4 inline-block rounded-xl px-4 py-2 text-2xl font-black ${badgeClass}`}
        >
          {value}
        </p>
      ) : (
        <p className="mt-3 text-3xl font-black text-cyan-300">{value}</p>
      )}
    </div>
  )
}