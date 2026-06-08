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

export default function TunnelPage() {
  const [plate, setPlate] = useState("")
  const [member, setMember] = useState<Member | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  async function lookupPlate() {
    setLoading(true)
    setMessage("")
    setMember(null)
    setCheckedIn(false)

    const cleanPlate = plate.trim().toUpperCase()

    if (!cleanPlate) {
      setMessage("Enter a license plate.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("license_plate", cleanPlate)
      .maybeSingle()

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (!data) {
      setMessage("No member found for that plate.")
      setLoading(false)
      return
    }

    setMember(data)
    setLoading(false)
  }

  async function startWash() {
    if (!member) return

    setLoading(true)
    setMessage("")

    if (member.membership_status !== "active") {
      setMessage("Membership is not active.")
      setLoading(false)
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    const { data: existingWash, error: existingError } = await supabase
      .from("wash_visits")
      .select("id")
      .eq("member_id", member.id)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .maybeSingle()

    if (existingError) {
      setMessage(existingError.message)
      setLoading(false)
      return
    }

    if (existingWash) {
      setMessage("This member already washed today.")
      setLoading(false)
      return
    }

    const { error: visitError } = await supabase.from("wash_visits").insert({
      member_id: member.id,
      email: member.email,
      membership_plan: member.membership_plan,
      license_plate: member.license_plate,
    })

    if (visitError) {
      setMessage(visitError.message)
      setLoading(false)
      return
    }

    const newPoints = (member.rewards_points || 0) + 10
    const newWashes = (member.lifetime_washes || 0) + 1

    const { error: updateError } = await supabase
      .from("members")
      .update({
        rewards_points: newPoints,
        lifetime_washes: newWashes,
      })
      .eq("id", member.id)

    if (updateError) {
      setMessage(updateError.message)
      setLoading(false)
      return
    }

    const { error: welcomeError } = await supabase
      .from("welcome_screen")
      .upsert({
        id: "current",
        member_id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        membership_plan: member.membership_plan,
        license_plate: member.license_plate,
        rewards_points: newPoints,
        lifetime_washes: newWashes,
        updated_at: new Date().toISOString(),
      })

    if (welcomeError) {
      setMessage(welcomeError.message)
      setLoading(false)
      return
    }

    setMember({
      ...member,
      rewards_points: newPoints,
      lifetime_washes: newWashes,
    })

    setCheckedIn(true)
    setMessage("Wash started. Member checked in successfully.")
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Braxy Buns Tunnel
            </p>
            <h1 className="mt-2 text-4xl font-bold">Tunnel Operations</h1>
            <p className="mt-2 text-slate-400">
              Lookup plate, confirm membership, and start wash.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-700 px-5 py-3 font-bold hover:bg-slate-900"
          >
            Back to Admin
          </Link>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <label className="text-sm font-semibold text-slate-300">
            License Plate
          </label>

          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") lookupPlate()
              }}
              placeholder="Enter plate..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-5 py-4 text-xl uppercase text-white outline-none focus:border-cyan-400"
            />

            <button
              onClick={lookupPlate}
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-8 py-4 text-lg font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Lookup"}
            </button>
          </div>

          {message && (
            <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-cyan-100">
              {message}
            </div>
          )}
        </section>

        {member && (
          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
              <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
                Member Found
              </p>

              <h2 className="mt-3 text-4xl font-bold">{fullName}</h2>

              <div className="mt-6 space-y-3 text-lg">
                <p>
                  <span className="text-slate-400">Plan:</span>{" "}
                  <span className="font-bold text-cyan-300">
                    {member.membership_plan || "No plan"}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">Status:</span>{" "}
                  <span
                    className={
                      member.membership_status === "active"
                        ? "font-bold text-green-300"
                        : "font-bold text-red-300"
                    }
                  >
                    {member.membership_status || "inactive"}
                  </span>
                </p>

                <p>
                  <span className="text-slate-400">Vehicle:</span>{" "}
                  {vehicle || "No vehicle"}
                </p>

                <p>
                  <span className="text-slate-400">Plate:</span>{" "}
                  {member.license_plate || "No plate"}
                </p>

                <p>
                  <span className="text-slate-400">Braxy Bucks:</span>{" "}
                  {member.rewards_points || 0}
                </p>

                <p>
                  <span className="text-slate-400">Lifetime Washes:</span>{" "}
                  {member.lifetime_washes || 0}
                </p>
              </div>

              <button
                onClick={startWash}
                disabled={
                  loading ||
                  checkedIn ||
                  member.membership_status !== "active"
                }
                className="mt-8 w-full rounded-2xl bg-cyan-400 px-8 py-5 text-2xl font-black text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkedIn ? "WASH STARTED" : "START WASH"}
              </button>
            </div>

            <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-cyan-400/40 bg-cyan-400 p-8 text-center text-slate-950">
              <div>
                <p className="text-3xl font-black">WELCOME BACK</p>
                <h2 className="mt-4 text-6xl font-black uppercase">
                  {member.first_name || "MEMBER"}
                </h2>

                <div className="mt-8 rounded-3xl bg-slate-950 px-8 py-6 text-white">
                  <p className="text-3xl font-black">
                    {member.membership_plan || "WASH CLUB"}
                  </p>
                  <p className="mt-2 text-xl text-cyan-300">
                    {member.license_plate}
                  </p>
                </div>

                {checkedIn && (
                  <p className="mt-8 text-3xl font-black">
                    PLEASE ENTER THE TUNNEL
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}