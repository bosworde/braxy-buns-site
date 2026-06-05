"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  membership_plan: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  license_plate: string | null
  rewards_points: number | null
}

type WashVisit = {
  id: string
  created_at: string
  email: string | null
  membership_plan: string | null
  license_plate: string | null
}

export default function AdminPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [washVisits, setWashVisits] = useState<WashVisit[]>([])
  const [todayWashes, setTodayWashes] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  async function loadAdminData() {
    setLoading(true)
    await Promise.all([loadMembers(), loadWashVisits()])
    setLoading(false)
  }

  async function loadMembers() {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading members:", error)
      return
    }

    setMembers(data || [])
  }

  async function loadWashVisits() {
    const { data, error } = await supabase
      .from("wash_visits")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error loading wash visits:", error)
      return
    }

    const visits = data || []
    setWashVisits(visits)

    const today = new Date().toISOString().slice(0, 10)

    const todaysVisits = visits.filter((visit) =>
      visit.created_at?.startsWith(today)
    )

    setTodayWashes(todaysVisits.length)
  }

  const activeMembers = members.length

  const paidMembers = members.filter(
    (member) =>
      member.membership_plan &&
      member.membership_plan.toLowerCase() !== "none"
  ).length

  const totalRewardsPoints = members.reduce(
    (sum, member) => sum + (member.rewards_points || 0),
    0
  )

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Braxy Buns
          </p>
          <h1 className="mt-2 text-4xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-zinc-400">
            Manage members, memberships, rewards, vehicles, and wash activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/add-member"
            className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black"
          >
            Add Member
          </a>

          <a
            href="/admin/members"
            className="rounded-xl bg-zinc-800 px-5 py-3 font-bold text-white"
          >
            Manage Members
          </a>

          <a
            href="/admin/checkin"
            className="rounded-xl bg-zinc-800 px-5 py-3 font-bold text-white"
          >
            QR Check-In
          </a>

          <a
            href="/admin/plate-lookup"
            className="rounded-xl bg-zinc-800 px-5 py-3 font-bold text-white"
          >
            Plate Lookup
          </a>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-300">
            Loading admin data...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard title="Total Members" value={activeMembers} />
              <StatCard title="Paid Members" value={paidMembers} />
              <StatCard title="Today's Washes" value={todayWashes} />
              <StatCard title="Reward Points" value={totalRewardsPoints} />
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Members</h2>
                <button
                  onClick={loadAdminData}
                  className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300"
                >
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700 text-zinc-400">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Plan</th>
                      <th className="py-3 pr-4">Vehicle</th>
                      <th className="py-3 pr-4">Plate</th>
                      <th className="py-3 pr-4">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td className="py-6 text-zinc-400" colSpan={6}>
                          No members found.
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-zinc-800 text-zinc-200"
                        >
                          <td className="py-3 pr-4">
                            {member.first_name || member.last_name
                              ? `${member.first_name || ""} ${
                                  member.last_name || ""
                                }`
                              : "—"}
                          </td>
                          <td className="py-3 pr-4">{member.email}</td>
                          <td className="py-3 pr-4">
                            {member.membership_plan || "None"}
                          </td>
                          <td className="py-3 pr-4">
                            {[member.vehicle_color, member.vehicle_make, member.vehicle_model]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </td>
                          <td className="py-3 pr-4">
                            {member.license_plate || "—"}
                          </td>
                          <td className="py-3 pr-4">
                            {member.rewards_points || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="mb-4 text-2xl font-bold">Recent Wash Visits</h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-700 text-zinc-400">
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Plan</th>
                      <th className="py-3 pr-4">Plate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {washVisits.length === 0 ? (
                      <tr>
                        <td className="py-6 text-zinc-400" colSpan={4}>
                          No wash visits found.
                        </td>
                      </tr>
                    ) : (
                      washVisits.slice(0, 25).map((visit) => (
                        <tr
                          key={visit.id}
                          className="border-b border-zinc-800 text-zinc-200"
                        >
                          <td className="py-3 pr-4">
                            {new Date(visit.created_at).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">{visit.email || "—"}</td>
                          <td className="py-3 pr-4">
                            {visit.membership_plan || "—"}
                          </td>
                          <td className="py-3 pr-4">
                            {visit.license_plate || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-yellow-400">{value}</p>
    </div>
  )
}