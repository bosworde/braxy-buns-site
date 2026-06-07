"use client"

import { useEffect, useState } from "react"
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  async function loadAdminData() {
    setLoading(true)

    const [{ data: memberData }, { data: visitData }] = await Promise.all([
      supabase.from("members").select("*").order("created_at", { ascending: false }),
      supabase.from("wash_visits").select("*").order("created_at", { ascending: false }),
    ])

    setMembers(memberData || [])
    setWashVisits(visitData || [])
    setLoading(false)
  }

  const today = new Date().toISOString().slice(0, 10)
  const month = new Date().toISOString().slice(0, 7)

  const activeMembers = members.filter(
    (m) => m.membership_status === "active"
  )

  const basicMembers = activeMembers.filter(
    (m) => m.membership_plan === "Basic Wash Club"
  ).length

  const plusMembers = activeMembers.filter(
    (m) => m.membership_plan === "Plus Wash Club"
  ).length

  const maxMembers = activeMembers.filter(
    (m) => m.membership_plan === "Max Shine Club"
  ).length

  const todaysWashes = washVisits.filter((v) =>
    v.created_at?.startsWith(today)
  ).length

  const monthlyWashes = washVisits.filter((v) =>
    v.created_at?.startsWith(month)
  ).length

  const totalRewardsPoints = members.reduce(
    (sum, member) => sum + (member.rewards_points || 0),
    0
  )

  const lifetimeWashes = members.reduce(
    (sum, member) => sum + (member.lifetime_washes || 0),
    0
  )

  const estimatedMRR =
    basicMembers * 24.99 + plusMembers * 34.99 + maxMembers * 44.99

  const averageWashesPerMember =
    activeMembers.length > 0 ? monthlyWashes / activeMembers.length : 0

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Braxy Buns
            </p>
            <h1 className="mt-2 text-4xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-slate-400">
              Membership, wash activity, rewards, and revenue overview.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/add-member"
            className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Add Member
          </Link>

          <Link
            href="/admin/members"
            className="rounded-xl bg-white/10 px-5 py-3 font-bold"
          >
            Manage Members
          </Link>

          <Link
            href="/admin/checkin"
            className="rounded-xl bg-white/10 px-5 py-3 font-bold"
          >
            QR Check-In
          </Link>

          <Link
            href="/admin/plate-lookup"
            className="rounded-xl bg-white/10 px-5 py-3 font-bold"
          >
            Plate Lookup
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white/10 p-8 text-slate-300">
            Loading admin data...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard title="Total Members" value={members.length} />
              <StatCard title="Active Members" value={activeMembers.length} />
              <StatCard title="Estimated MRR" value={`$${estimatedMRR.toFixed(2)}`} />
              <StatCard title="Today's Washes" value={todaysWashes} />

              <StatCard title="Basic Members" value={basicMembers} />
              <StatCard title="Plus Members" value={plusMembers} />
              <StatCard title="Max Members" value={maxMembers} />
              <StatCard title="This Month's Washes" value={monthlyWashes} />

              <StatCard title="Lifetime Washes" value={lifetimeWashes} />
              <StatCard title="Braxy Bucks" value={totalRewardsPoints} />
              <StatCard
                title="Avg. Monthly Washes / Member"
                value={averageWashesPerMember.toFixed(1)}
              />
              <StatCard
                title="Revenue / Wash This Month"
                value={
                  monthlyWashes > 0
                    ? `$${(estimatedMRR / monthlyWashes).toFixed(2)}`
                    : "$0.00"
                }
              />
            </section>

            <section className="rounded-2xl bg-white/10 p-6">
              <h2 className="mb-4 text-2xl font-bold">Recent Members</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Plan</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Plate</th>
                      <th className="py-3 pr-4">Points</th>
                    </tr>
                  </thead>

                  <tbody>
                    {members.slice(0, 12).map((member) => (
                      <tr
                        key={member.id}
                        className="border-b border-white/10 text-slate-200"
                      >
                        <td className="py-3 pr-4">
                          {`${member.first_name || ""} ${
                            member.last_name || ""
                          }`.trim() || "—"}
                        </td>
                        <td className="py-3 pr-4">{member.email}</td>
                        <td className="py-3 pr-4">
                          {member.membership_plan || "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {member.membership_status || "inactive"}
                        </td>
                        <td className="py-3 pr-4">
                          {member.license_plate || "—"}
                        </td>
                        <td className="py-3 pr-4">
                          {member.rewards_points || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl bg-white/10 p-6">
              <h2 className="mb-4 text-2xl font-bold">Recent Wash Visits</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-3 pr-4">Date</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Plan</th>
                      <th className="py-3 pr-4">Plate</th>
                    </tr>
                  </thead>

                  <tbody>
                    {washVisits.slice(0, 25).map((visit) => (
                      <tr
                        key={visit.id}
                        className="border-b border-white/10 text-slate-200"
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
                    ))}
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

function StatCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-cyan-300">{value}</p>
    </div>
  )
}