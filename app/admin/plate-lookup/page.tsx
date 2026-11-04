"use client"

import { useState } from "react"
import { verifyAdmission } from "@/lib/member/admission"
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

export default function PlateLookupPage() {
  const [plate, setPlate] = useState("")
  const [member, setMember] = useState<Member | null>(null)
  const [message, setMessage] = useState("")

  async function lookupPlate() {
    setMessage("")
    setMember(null)

    const cleanPlate = plate.trim().toUpperCase()

    const { data } = await supabase
      .from("members")
      .select("*")
      .ilike("license_plate", cleanPlate)
      .maybeSingle()

    if (!data) {
      setMessage("No member found for that license plate.")
      return
    }

    setMember(data)
  }

  async function checkInWash() {
    if (!member) return
    setMessage("Verifying current payment and recording admission…")
    try {
      const result = await verifyAdmission(member.id, true)
      setMember({ ...member, rewards_points: result.rewards_points, lifetime_washes: result.lifetime_washes })
      setMessage("Admission recorded. +10 Braxy Bucks awarded. Follow the attendant’s instructions; no equipment was activated.")

    } catch (error) { setMessage(error instanceof Error ? error.message : "Verification unavailable. Do not admit.") }
  }

  const isActive = member?.membership_status === "active"

  return (
    <main className="min-h-screen bg-slate-950 text-white p-10">
      <h1 className="text-4xl font-bold">License Plate Lookup</h1>

      <p className="mt-4 max-w-xl text-slate-300">
        Search by license plate to verify a member and check in a wash.
      </p>

      <div className="mt-8 flex max-w-xl gap-3">
        <input
          className="w-full rounded-xl bg-white px-4 py-3 text-slate-950"
          placeholder="Enter plate..."
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />

        <button
          onClick={lookupPlate}
          className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
        >
          Search
        </button>
      </div>

      {message && (
        <p className="mt-6 font-semibold text-cyan-300">{message}</p>
      )}

      {member && (
        <div className="mt-8 max-w-2xl rounded-2xl bg-white/10 p-6">
          <h2 className="text-2xl font-bold">
            {member.first_name || ""} {member.last_name || ""}
          </h2>

          <p className="mt-2 text-cyan-300">
            {member.membership_plan || "Prospect"}
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p>{member.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Status</p>
              <p className="font-bold">
                {isActive ? "Active" : member.membership_status || "Inactive"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Vehicle</p>
              <p>
                {member.vehicle_color || ""} {member.vehicle_make || ""}{" "}
                {member.vehicle_model || ""}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Plate</p>
              <p>{member.license_plate || "Not added"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Braxy Bucks</p>
              <p>{member.rewards_points || 0} pts</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Lifetime Washes</p>
              <p>{member.lifetime_washes || 0}</p>
            </div>
          </div>

          <button
            onClick={checkInWash}
            disabled={!isActive}
            className="mt-6 w-full rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
          >
            Check In Wash
          </button>
        </div>
      )}
    </main>
  )
}
