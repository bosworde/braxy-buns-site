"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
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

export default function AdminMemberEditPage() {
  const params = useParams()
  const memberId = params.id as string

  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function loadMember() {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("id", memberId)
        .maybeSingle()

      if (error) {
        setMessage(error.message)
      } else {
        setMember(data)
      }

      setLoading(false)
    }

    if (memberId) loadMember()
  }, [memberId])

  function updateField(field: keyof Member, value: string | number) {
    if (!member) return

    setMember({
      ...member,
      [field]: value,
    })
  }

  async function saveMember() {
    if (!member) return

    setSaving(true)
    setMessage("")

    const { error } = await supabase
      .from("members")
      .update({
        email: member.email,
        first_name: member.first_name,
        last_name: member.last_name,
        membership_plan: member.membership_plan,
        membership_status: member.membership_status,
        vehicle_make: member.vehicle_make,
        vehicle_model: member.vehicle_model,
        vehicle_color: member.vehicle_color,
        license_plate: member.license_plate,
        rewards_points: member.rewards_points || 0,
        lifetime_washes: member.lifetime_washes || 0,
      })
      .eq("id", member.id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Member updated successfully.")
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading member...
      </main>
    )
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        <p>Member not found.</p>
        <Link href="/admin/members" className="mt-4 inline-block text-cyan-300">
          Back to Members
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Braxy Buns Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold">Edit Member</h1>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin"
            className="rounded-xl bg-white/10 px-5 py-3 font-bold"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/members"
            className="rounded-xl bg-white/10 px-5 py-3 font-bold"
          >
            Members
          </Link>
        </div>
      </div>

      {message && (
        <p className="mt-6 rounded-xl bg-white/10 p-4 font-semibold text-cyan-300">
          {message}
        </p>
      )}

      <section className="mt-8 grid max-w-5xl gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm text-slate-400">First Name</label>
          <input
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.first_name || ""}
            onChange={(e) => updateField("first_name", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">Last Name</label>
          <input
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.last_name || ""}
            onChange={(e) => updateField("last_name", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">Email</label>
          <input
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.email || ""}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">Membership Plan</label>
          <select
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.membership_plan || "Prospect"}
            onChange={(e) => updateField("membership_plan", e.target.value)}
          >
            <option>Prospect</option>
            <option>Basic Wash Club</option>
            <option>Plus Wash Club</option>
            <option>Max Shine Club</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-400">Membership Status</label>
          <select
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.membership_status || "inactive"}
            onChange={(e) => updateField("membership_status", e.target.value)}
          >
            <option value="active">active</option>
            <option value="inactive">inactive</option>
            <option value="cancelled">cancelled</option>
            <option value="paused">paused</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-400">License Plate</label>
          <input
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.license_plate || ""}
            onChange={(e) => updateField("license_plate", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">Vehicle Make</label>
          <input
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.vehicle_make || ""}
            onChange={(e) => updateField("vehicle_make", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">Vehicle Model</label>
          <input
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.vehicle_model || ""}
            onChange={(e) => updateField("vehicle_model", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">Vehicle Color</label>
          <input
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.vehicle_color || ""}
            onChange={(e) => updateField("vehicle_color", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">Braxy Bucks</label>
          <input
            type="number"
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.rewards_points || 0}
            onChange={(e) =>
              updateField("rewards_points", Number(e.target.value))
            }
          />
        </div>

        <div>
          <label className="text-sm text-slate-400">Lifetime Washes</label>
          <input
            type="number"
            className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
            value={member.lifetime_washes || 0}
            onChange={(e) =>
              updateField("lifetime_washes", Number(e.target.value))
            }
          />
        </div>
      </section>

      <button
        onClick={saveMember}
        disabled={saving}
        className="mt-8 rounded-xl bg-cyan-400 px-8 py-4 font-bold text-slate-950 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </main>
  )
}