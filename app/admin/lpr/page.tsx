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
  license_plate: string | null
  rewards_points: number | null
  lifetime_washes: number | null
}

type Decision = "idle" | "approved" | "completed" | "duplicate" | "inactive" | "not_found"

export default function LprPage() {
  const [plate, setPlate] = useState("")
  const [member, setMember] = useState<Member | null>(null)
  const [message, setMessage] = useState("")
  const [decision, setDecision] = useState<Decision>("idle")
  const [loading, setLoading] = useState(false)

  function cleanPlate(value: string) {
    return value.trim().replace(/\s+/g, "").toLowerCase()
  }

 async function hasWashedToday(memberId: string, plate: string | null) {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const cleanedPlate = plate ? cleanPlate(plate) : ""

  let query = supabase
    .from("wash_visits")
    .select("id")
    .gte("created_at", todayStart.toISOString())

  if (cleanedPlate) {
    query = query.or(
      `member_id.eq.${memberId},license_plate.ilike.${cleanedPlate}`
    )
  } else {
    query = query.eq("member_id", memberId)
  }

 const { data } = await query.limit(10)

console.log("Duplicate Check Result:", data)

  return !!data && data.length > 0
}

  async function lookupPlate() {
    setLoading(true)
    setMessage("")
    setMember(null)
    setDecision("idle")

    const cleaned = cleanPlate(plate)

    if (!cleaned) {
      setMessage("Enter a license plate.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .ilike("license_plate", cleaned)
      .maybeSingle()

    if (error || !data) {
      setMessage("Plate not found.")
      setDecision("not_found")
      setLoading(false)
      return
    }

    setMember(data)

    if (data.membership_status !== "active") {
      setDecision("inactive")
      setMessage("Membership is not active.")
      setLoading(false)
      return
    }
const duplicate = await hasWashedToday(data.id, data.license_plate)

if (duplicate) {
  setDecision("duplicate")
  setMessage("This member already washed today.")
  setLoading(false)
  return
}

    setDecision("approved")
    setMessage("Member approved for wash.")
    setLoading(false)
  }

  async function approveWash() {
    if (!member) return

    if (decision !== "approved") {
      setMessage("Wash cannot be approved from the current status.")
      return
    }

   const { data: washVisit, error: washError } = await supabase
  .from("wash_visits")
  .insert({
    member_id: member.id,
    email: member.email,
    membership_plan: member.membership_plan,
    license_plate: member.license_plate,
  })
  .select("id")
  .single()

if (washError || !washVisit) {
  setMessage("Could not add wash visit.")
  return
}

const queueResult = await supabase
  .from("tunnel_queue")
  .insert({
    wash_visit_id: washVisit.id,
    license_plate: member.license_plate,
    status: "waiting",
  })

console.log("QUEUE RESULT:", queueResult)

    await supabase
      .from("members")
      .update({
        rewards_points: (member.rewards_points || 0) + 10,
        lifetime_washes: (member.lifetime_washes || 0) + 1,
      })
      .eq("id", member.id)

    setMessage("Wash approved. +10 Braxy Bucks added.")
    setDecision("completed")

    setMember({
      ...member,
      rewards_points: (member.rewards_points || 0) + 10,
      lifetime_washes: (member.lifetime_washes || 0) + 1,
    })
  }

  const fullName = member
    ? `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
      member.email
    : ""

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              License Plate Reader
            </h1>

            <p className="mt-2 text-slate-400">
              Manual LPR simulator with commercial-style tunnel decisions.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Admin Home
            </Link>

            <Link href="/admin/lpr-camera" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              LPR Camera
            </Link>

            <Link href="/admin/operations" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Operations
            </Link>
          </div>
        </div>

        <section className="rounded-3xl bg-white/10 p-6">
          <h2 className="text-2xl font-black">Scan / Enter Plate</h2>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="Enter license plate"
              className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-5 py-4 text-lg font-bold uppercase text-white outline-none"
            />

            <button
              onClick={lookupPlate}
              disabled={loading}
              className="rounded-xl bg-cyan-400 px-6 py-4 font-black text-slate-950 disabled:opacity-50"
            >
              {loading ? "Checking..." : "Lookup Plate"}
            </button>
          </div>

          {message && (
            <div className="mt-5 rounded-2xl bg-slate-900 p-4 font-bold text-cyan-300">
              {message}
            </div>
          )}
        </section>

        {decision !== "idle" && (
          <section className="rounded-3xl bg-white/10 p-6">
            <DecisionBanner decision={decision} />

            {member && (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <Info label="Member" value={fullName} />
                  <Info label="Email" value={member.email} />
                  <Info label="Plate" value={member.license_plate || "—"} />
                  <Info label="Plan" value={member.membership_plan || "—"} />
                  <Info label="Status" value={member.membership_status || "inactive"} />
                  <Info label="Lifetime Washes" value={member.lifetime_washes || 0} />
                  <Info label="Braxy Bucks" value={member.rewards_points || 0} />
                </div>

                <button
                  onClick={approveWash}
                  disabled={decision !== "approved"}
                  className="mt-6 w-full rounded-xl bg-cyan-400 px-6 py-4 text-xl font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Approve Wash + Add Visit
                </button>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  )
}

function DecisionBanner({ decision }: { decision: Decision }) {
  const styles = {
    approved: "bg-green-400 text-slate-950",
    completed: "bg-green-600 text-white",
    duplicate: "bg-yellow-300 text-slate-950",
    inactive: "bg-red-400 text-slate-950",
    not_found: "bg-slate-700 text-white",
    idle: "bg-slate-700 text-white",
  }

  const text = {
    approved: "APPROVED",
    completed: "WASH COMPLETED",
    duplicate: "ALREADY WASHED TODAY",
    inactive: "MEMBERSHIP INACTIVE",
    not_found: "MEMBER NOT FOUND",
    idle: "",
  }

  return (
    <div className={`rounded-3xl p-6 ${styles[decision]}`}>
      <p className="text-sm font-black uppercase tracking-[0.3em]">
        LPR Decision
      </p>

      <h2 className="mt-3 text-5xl font-black">
        {text[decision]}
      </h2>
    </div>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-cyan-300">
        {value}
      </p>
    </div>
  )
}