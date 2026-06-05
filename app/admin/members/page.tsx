"use client"

import { useEffect, useState } from "react"
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

export default function MembersAdminPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [message, setMessage] = useState("")
  const [search, setSearch] = useState("")
const totalMembers = members.length

const activeMembers = members.filter(
  (member) => member.membership_status === "active"
).length

const totalLifetimeWashes = members.reduce(
  (sum, member) => sum + (member.lifetime_washes || 0),
  0
)

const totalBraxyBucks = members.reduce(
  (sum, member) => sum + (member.rewards_points || 0),
  0
)
  const filteredMembers = members.filter((member) => {
    const searchText = search.toLowerCase()

    return (
      member.email.toLowerCase().includes(searchText) ||
      `${member.first_name || ""} ${member.last_name || ""}`
        .toLowerCase()
        .includes(searchText) ||
      (member.license_plate || "").toLowerCase().includes(searchText)
    )
  })

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
      return
    }

    setMembers(data || [])
  }

  async function saveMember() {
    if (!selectedMember) return

    const { error } = await supabase
      .from("members")
      .update({
        membership_plan: selectedMember.membership_plan,
        membership_status: selectedMember.membership_status,
        license_plate: selectedMember.license_plate,
        rewards_points: selectedMember.rewards_points,
      })
      .eq("id", selectedMember.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Member updated successfully.")
    await loadMembers()
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-4xl font-bold">Member Management</h1>

      <p className="mt-4 text-slate-300">
        Edit membership plans, statuses, plates, and Braxy Bucks.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
    
        <a
          href="/admin"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold text-white"
        >
          Dashboard
          <a
  href="/admin/add-member"
  className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
>
  Add Member
</a>
        </a>

        <a
          href="/admin/checkin"
          className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          QR Check-In
        </a>

        <a
          href="/admin/plate-lookup"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold text-white"
        >
          Plate Lookup
        </a>
      </div>
<section className="mt-8 grid gap-4 md:grid-cols-4">
  <KpiCard title="Total Members" value={totalMembers} />
  <KpiCard title="Active Members" value={activeMembers} />
  <KpiCard title="Lifetime Washes" value={totalLifetimeWashes} />
  <KpiCard title="Braxy Bucks" value={totalBraxyBucks} />
</section>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white/10 p-6">
          <h2 className="mb-4 text-2xl font-bold">Members</h2>

          <input
            className="mb-4 w-full rounded-xl bg-white p-3 text-slate-950"
            placeholder="Search name, email, or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="w-full rounded-xl bg-slate-900 p-4 text-left hover:bg-slate-800"
              >
                <p className="font-bold">
                  {member.first_name} {member.last_name}
                </p>

                <p className="text-sm text-slate-400">{member.email}</p>

                <p className="text-sm text-cyan-300">
                  {member.membership_plan || "Prospect"} •{" "}
                  {member.membership_status || "inactive"}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white/10 p-6">
          <h2 className="mb-4 text-2xl font-bold">Edit Member</h2>

          {!selectedMember ? (
            <p className="text-slate-400">Select a member to edit.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-400">Name</p>

                <p className="text-xl font-bold">
                  {selectedMember.first_name} {selectedMember.last_name}
                </p>
              </div>

              <div>
                <label className="text-sm text-slate-400">Plan</label>

                <select
                  className="mt-1 w-full rounded-xl bg-white p-3 text-slate-950"
                  value={selectedMember.membership_plan || "Prospect"}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      membership_plan: e.target.value,
                    })
                  }
                >
                  <option>Prospect</option>
                  <option>Basic Shine Club</option>
                  <option>Plus Shine Club</option>
                  <option>Max Shine Club</option>
                  <option>Family Plan</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400">Status</label>

                <select
                  className="mt-1 w-full rounded-xl bg-white p-3 text-slate-950"
                  value={selectedMember.membership_status || "inactive"}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      membership_status: e.target.value,
                    })
                  }
                >
                  <option value="active">active</option>
                  <option value="frozen">frozen</option>
                  <option value="past_due">past_due</option>
                  <option value="cancelled">cancelled</option>
                  <option value="prospect">prospect</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  License Plate
                </label>

                <input
                  className="mt-1 w-full rounded-xl bg-white p-3 text-slate-950"
                  value={selectedMember.license_plate || ""}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      license_plate: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm text-slate-400">
                  Braxy Bucks
                </label>

                <input
                  type="number"
                  className="mt-1 w-full rounded-xl bg-white p-3 text-slate-950"
                  value={selectedMember.rewards_points || 0}
                  onChange={(e) =>
                    setSelectedMember({
                      ...selectedMember,
                      rewards_points: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Lifetime Washes
                </p>

                <p className="text-xl font-bold">
                  {selectedMember.lifetime_washes || 0}
                </p>
              </div>

              <button
                onClick={saveMember}
                className="w-full rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
              >
                Save Changes
              </button>
            </div>
          )}
        </section>
      </div>

      {message && (
        <p className="mt-6 font-semibold text-cyan-300">
          {message}
        </p>
      )}
    </main>
  )
}function KpiCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-cyan-300">{value}</p>
    </div>
  )
}