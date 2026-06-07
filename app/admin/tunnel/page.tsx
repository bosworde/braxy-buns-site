"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
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

  async function lookupPlate() {
    setLoading(true)
    setMessage("")
    setMember(null)
const cleanPlate = plate.trim().toLowerCase()
    if (!cleanPlate) {
      setMessage("Enter a plate.")
      setLoading(false)
      return
    }

 const { data, error } = await supabase
  .from("members")
  .select("*")
  .not("license_plate", "is", null)

setLoading(false)

if (error) {
  setMessage(error.message)
  return
}

const matchedMember =
  data?.find(
    (m) =>
      String(m.license_plate || "")
        .replace(/\s+/g, "")
        .toLowerCase() === cleanPlate.replace(/\s+/g, "").toLowerCase()
  ) || null

if (!matchedMember) {
  setMessage("No member found.")
  return
}

setMember(matchedMember)
  }

  async function checkInMember() {
    if (!member) return

    if (member.membership_status !== "active") {
      setMessage("Membership is not active.")
      return
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const { data: existingVisit } = await supabase
      .from("wash_visits")
      .select("*")
      .eq("member_id", member.id)
      .gte("created_at", startOfToday.toISOString())
      .maybeSingle()

    if (existingVisit) {
      setMessage("Already checked in today.")
      return
    }

    const { error } = await supabase
      .from("wash_visits")
      .insert({
        member_id: member.id,
        email: member.email,
        membership_plan: member.membership_plan,
        license_plate: member.license_plate,
      })

    if (error) {
      setMessage(error.message)
      return
    }

    await supabase
      .from("members")
      .update({
        rewards_points: (member.rewards_points || 0) + 10,
        lifetime_washes: (member.lifetime_washes || 0) + 1,
      })
      .eq("id", member.id)

    setMessage("Wash checked in successfully.")
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-5xl font-bold">Tunnel Operator Screen</h1>

      <p className="mt-4 text-slate-300">
        Enter a license plate to instantly verify membership.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold"
        >
          Dashboard
        </Link>

        <Link
          href="/admin/checkin"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold"
        >
          QR Check-In
        </Link>

        <Link
          href="/admin/members"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold"
        >
          Members
        </Link>
      </div>

      <div className="mt-10 max-w-3xl">
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder="ENTER LICENSE PLATE..."
          className="w-full rounded-2xl bg-white p-6 text-3xl font-bold text-slate-950"
        />

        <button
          onClick={lookupPlate}
          className="mt-4 rounded-2xl bg-cyan-400 px-8 py-4 text-xl font-bold text-slate-950"
        >
          {loading ? "Searching..." : "Find Member"}
        </button>
      </div>

      {member && (
        <section
          className={`mt-10 rounded-3xl p-8 ${
            member.membership_status === "active"
              ? "bg-green-900"
              : "bg-red-900"
          }`}
        >
          <h2 className="text-4xl font-bold">
            {member.first_name} {member.last_name}
          </h2>

          <p className="mt-3 text-xl">
            {member.membership_plan}
          </p>

          <p className="mt-3 text-xl">
            Status: {member.membership_status}
          </p>

          <p className="mt-3 text-xl">
            Plate: {member.license_plate}
          </p>

          <p className="mt-3 text-xl">
            Vehicle: {member.vehicle_color} {member.vehicle_make}{" "}
            {member.vehicle_model}
          </p>

          <p className="mt-3 text-xl">
            Braxy Bucks: {member.rewards_points || 0}
          </p>

          <p className="mt-3 text-xl">
            Lifetime Washes: {member.lifetime_washes || 0}
          </p>

          <button
            onClick={checkInMember}
            disabled={member.membership_status !== "active"}
            className="mt-8 rounded-2xl bg-cyan-400 px-8 py-4 text-xl font-bold text-slate-950 disabled:opacity-50"
          >
            Check In Wash
          </button>
        </section>
      )}

      {message && (
        <div className="mt-8 rounded-2xl bg-white/10 p-4 text-xl font-bold text-cyan-300">
          {message}
        </div>
      )}
    </main>
  )
}