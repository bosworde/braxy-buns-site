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
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string | null
}

type WashVisit = {
  id: string
  created_at: string
  email: string | null
  membership_plan: string | null
  license_plate: string | null
}

export default function AdminMemberDetailPage() {
  const params = useParams()
  const memberId = params.id as string

  const [member, setMember] = useState<Member | null>(null)
  const [washVisits, setWashVisits] = useState<WashVisit[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (memberId) loadData()
  }, [memberId])

  async function loadData() {
    setLoading(true)

    const { data: memberData, error: memberError } = await supabase
      .from("members")
      .select("*")
      .eq("id", memberId)
      .maybeSingle()

    if (memberError) {
      setMessage(memberError.message)
      setLoading(false)
      return
    }

    setMember(memberData)

    if (memberData) {
      const { data: visits } = await supabase
        .from("wash_visits")
        .select("*")
        .eq("member_id", memberData.id)
        .order("created_at", { ascending: false })

      setWashVisits(visits || [])
    }

    setLoading(false)
  }

  function updateField(field: keyof Member, value: string | number) {
    if (!member) return
    setMember({ ...member, [field]: value })
  }

  async function updateMemberStatus(status: string) {
    if (!member) return

    setSaving(true)
    setMessage("")

    const { error } = await supabase
      .from("members")
      .update({ membership_status: status })
      .eq("id", member.id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage(`Member marked ${status}.`)
      await loadData()
    }

    setSaving(false)
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
  if (error.message.includes("unique_member_license_plate")) {
    setMessage(
      "That license plate is already assigned to another member."
    )
  } else {
    setMessage(error.message)
  }
} else {
  setMessage("Member updated successfully.")
  await loadData()
}

    setSaving(false)
  }

  async function cancelMember() {
    if (!member) return

    const confirmed = window.confirm(
      "Cancel this member's Stripe subscription and mark them cancelled?"
    )

    if (!confirmed) return

    setSaving(true)
    setMessage("")

    try {
      const res = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberId: member.id,
          subscriptionId: member.stripe_subscription_id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || "Cancellation failed.")
        setSaving(false)
        return
      }

      setMessage(data.message || "Member cancelled successfully.")
      await loadData()
    } catch (err: any) {
      setMessage(err.message || "Cancellation failed.")
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

  const fullName = `${member.first_name || ""} ${member.last_name || ""}`.trim()
  const vehicle = `${member.vehicle_color || ""} ${member.vehicle_make || ""} ${
    member.vehicle_model || ""
  }`.trim()

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
            Braxy Buns Admin
          </p>
          <h1 className="mt-2 text-4xl font-bold">
            {fullName || "Member Profile"}
          </h1>
          <p className="mt-2 text-slate-400">{member.email}</p>
        </div>

        <div className="flex gap-3">
          <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
            Dashboard
          </Link>
          <Link href="/admin/members" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
            Members
          </Link>
          <Link href="/admin/checkin" className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
            Check In
          </Link>
        </div>
      </div>

      {message && (
        <p className="mt-6 rounded-xl bg-white/10 p-4 font-semibold text-cyan-300">
          {message}
        </p>
      )}

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard title="Plan" value={member.membership_plan || "—"} />
        <StatCard title="Status" value={member.membership_status || "inactive"} />
        <StatCard title="Braxy Bucks" value={member.rewards_points || 0} />
        <StatCard title="Lifetime Washes" value={member.lifetime_washes || 0} />
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl bg-white/10 p-6">
          <h2 className="text-2xl font-bold">Edit Member</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Input label="First Name" value={member.first_name || ""} onChange={(v) => updateField("first_name", v)} />
            <Input label="Last Name" value={member.last_name || ""} onChange={(v) => updateField("last_name", v)} />
            <Input label="Email" value={member.email || ""} onChange={(v) => updateField("email", v)} />

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
                <option value="paused">paused</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>

            <Input label="License Plate" value={member.license_plate || ""} onChange={(v) => updateField("license_plate", v)} />
            <Input label="Vehicle Make" value={member.vehicle_make || ""} onChange={(v) => updateField("vehicle_make", v)} />
            <Input label="Vehicle Model" value={member.vehicle_model || ""} onChange={(v) => updateField("vehicle_model", v)} />
            <Input label="Vehicle Color" value={member.vehicle_color || ""} onChange={(v) => updateField("vehicle_color", v)} />

            <NumberInput label="Braxy Bucks" value={member.rewards_points || 0} onChange={(v) => updateField("rewards_points", v)} />
            <NumberInput label="Lifetime Washes" value={member.lifetime_washes || 0} onChange={(v) => updateField("lifetime_washes", v)} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={saveMember}
              disabled={saving}
              className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={() => updateMemberStatus("paused")}
              disabled={saving}
              className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
            >
              Pause Member
            </button>

            <button
              onClick={() => updateMemberStatus("active")}
              disabled={saving}
              className="rounded-xl bg-green-500 px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              Reactivate Member
            </button>

            <button
              onClick={cancelMember}
              disabled={saving}
              className="rounded-xl bg-red-500 px-6 py-3 font-bold text-white disabled:opacity-50"
            >
              Cancel Member
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-white/10 p-6">
            <h2 className="text-2xl font-bold">Member Details</h2>

            <div className="mt-4 space-y-3 text-sm">
              <Detail label="Vehicle" value={vehicle || "Not added"} />
              <Detail label="License Plate" value={member.license_plate || "Not added"} />
              <Detail label="Member Since" value={member.created_at ? new Date(member.created_at).toLocaleDateString() : "—"} />
              <Detail label="Stripe Customer ID" value={member.stripe_customer_id || "—"} />
              <Detail label="Stripe Subscription ID" value={member.stripe_subscription_id || "—"} />
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-6">
            <h2 className="text-2xl font-bold">Wash History</h2>

            {washVisits.length === 0 ? (
              <p className="mt-4 text-slate-400">No wash visits yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {washVisits.slice(0, 20).map((visit) => (
                  <div key={visit.id} className="rounded-xl bg-slate-900 p-4 text-sm">
                    <p className="font-bold">
                      {new Date(visit.created_at).toLocaleString()}
                    </p>
                    <p className="text-slate-400">
                      {visit.membership_plan || "—"} • {visit.license_plate || "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-2xl font-bold text-cyan-300">{value}</p>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="text-sm text-slate-400">{label}</label>
      <input
        className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <div>
      <label className="text-sm text-slate-400">{label}</label>
      <input
        type="number"
        className="mt-2 w-full rounded-xl bg-white p-3 text-slate-950"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-400">{label}</p>
      <p className="font-semibold break-all">{value}</p>
    </div>
  )
}