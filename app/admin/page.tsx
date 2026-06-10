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
  created_at: string | null
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
      supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("wash_visits")
        .select("*")
        .order("created_at", { ascending: false }),
    ])

    setMembers(memberData || [])
    setWashVisits(visitData || [])
    setLoading(false)
  }

  const today = new Date().toISOString().slice(0, 10)
  const month = new Date().toISOString().slice(0, 7)

  const activeMembers = members.filter(
    (member) => member.membership_status === "active"
  )

  const cancelledMembers = members.filter(
    (member) => member.membership_status === "cancelled"
  )

  const newMembersThisMonth = members.filter((member) =>
    member.created_at?.startsWith(month)
  )

  const basicMembers = activeMembers.filter(
    (member) => member.membership_plan === "Gecko Wash Club"
  ).length

  const plusMembers = activeMembers.filter(
    (member) => member.membership_plan === "Iguana Wash Club"
  ).length

  const maxMembers = activeMembers.filter(
    (member) => member.membership_plan === "Dragon Wash Club"
  ).length

  const todaysWashes = washVisits.filter((visit) =>
    visit.created_at?.startsWith(today)
  )

  const monthlyWashes = washVisits.filter((visit) =>
    visit.created_at?.startsWith(month)
  )

  const totalRewardsPoints = members.reduce(
    (sum, member) => sum + (member.rewards_points || 0),
    0
  )

  const lifetimeWashes = washVisits.length

  const estimatedMRR =
    basicMembers * 24.99 + plusMembers * 34.99 + maxMembers * 44.99

  const annualRunRate = estimatedMRR * 12

  const averageMonthlyWashesPerMember =
    activeMembers.length > 0 ? monthlyWashes.length / activeMembers.length : 0

  const averageLifetimeWashesPerMember =
    activeMembers.length > 0 ? washVisits.length / activeMembers.length : 0

  const topMembers = [...members]
    .sort((a, b) => (b.lifetime_washes || 0) - (a.lifetime_washes || 0))
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Braxy Buns
            </p>
            <h1 className="mt-2 text-4xl font-bold">
              Daily Operations Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Membership, revenue, wash activity, rewards, and tunnel operations.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Refresh
          </button>
        </div>

<div className="grid gap-3 md:grid-cols-5 lg:grid-cols-5">
          <Link
            href="/admin/tunnel"
            className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Tunnel Screen
          </Link>

          <Link
            href="/admin/leads"
            className="rounded-xl bg-white/10 px-5 py-3 font-bold"
          >
            Founding Member CRM
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
            Manage Members
          </Link>
          <Link
  href="/admin/revenue"
  className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
>
  Revenue Dashboard
</Link>

<Link
  href="/admin/operations"
  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
>
  Operations Dashboard
</Link>
<Link
  href="/admin/lpr"
  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
>
  License Plate Reader
</Link>

<Link
  href="/admin/analytics"
  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
>
  Analytics Dashboard
</Link>
<Link
  href="/admin/payments"
  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
>
  Payments Dashboard
</Link>

<Link
  href="/admin/investors"
  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
>
  Investor Dashboard
</Link>

          <Link
            href="/admin/add-member"
            className="rounded-xl bg-white/10 px-5 py-3 font-bold"
          >
            Add Member
          </Link>

          <Link
            href="/admin/plate-lookup"
            className="rounded-xl bg-white/10 px-5 py-3 font-bold"
          >
            Plate Lookup
          </Link>
        </div>
        <Link
  href="/admin/welcome"
  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
>
  Welcome Screen
</Link>

        {loading ? (
          <div className="rounded-2xl bg-white/10 p-8 text-slate-300">
            Loading operations data...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <StatCard title="Active Members" value={activeMembers.length} />
              <StatCard
                title="Estimated MRR"
                value={`$${estimatedMRR.toFixed(2)}`}
              />
              <StatCard
                title="Annual Run Rate"
                value={`$${annualRunRate.toFixed(0)}`}
              />
              <StatCard title="Today's Washes" value={todaysWashes.length} />

              <StatCard title="Total Members" value={members.length} />
              <StatCard
                title="New Members This Month"
                value={newMembersThisMonth.length}
              />
              <StatCard
                title="Cancelled Members"
                value={cancelledMembers.length}
              />
              <StatCard title="This Month's Washes" value={monthlyWashes.length} />

              <StatCard title="Basic Members" value={basicMembers} />
              <StatCard title="Plus Members" value={plusMembers} />
              <StatCard title="Max Members" value={maxMembers} />
              <StatCard title="Braxy Bucks Issued" value={totalRewardsPoints} />

              <StatCard title="Lifetime Washes" value={lifetimeWashes} />
              <StatCard
                title="Avg Monthly Washes / Member"
                value={averageMonthlyWashesPerMember.toFixed(1)}
              />
              <StatCard
                title="Avg Lifetime Washes / Member"
                value={averageLifetimeWashesPerMember.toFixed(1)}
              />
              <StatCard
                title="Revenue / Wash This Month"
                value={
                  monthlyWashes.length > 0
                    ? `$${(estimatedMRR / monthlyWashes.length).toFixed(2)}`
                    : "$0.00"
                }
              />

              <StatCard title="Founding Members" value={`${members.length}/500`} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-6">
                <h2 className="text-2xl font-bold">Plan Mix</h2>

                <div className="mt-6 space-y-4">
                  <PlanBar
                    label="Gecko Wash Club"
                    count={basicMembers}
                    total={activeMembers.length}
                  />
                  <PlanBar
                    label="Iguana Wash Club"
                    count={plusMembers}
                    total={activeMembers.length}
                  />
                  <PlanBar
                    label="Dragon Wash Club"
                    count={maxMembers}
                    total={activeMembers.length}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-6">
                <h2 className="text-2xl font-bold">Top Members by Washes</h2>

                <div className="mt-4 space-y-3">
                  {topMembers.length === 0 ? (
                    <p className="text-slate-400">No members yet.</p>
                  ) : (
                    topMembers.map((member) => {
                      const fullName =
                        `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
                        member.email

                      return (
                        <Link
                          key={member.id}
                          href={`/admin/member/${member.id}`}
                          className="block rounded-xl bg-slate-900 p-4 hover:bg-slate-800"
                        >
                          <div className="flex justify-between gap-4">
                            <div>
                              <p className="font-bold">{fullName}</p>
                              <p className="text-sm text-slate-400">
                                {member.membership_plan || "Prospect"} •{" "}
                                {member.license_plate || "No plate"}
                              </p>
                            </div>

                            <p className="text-xl font-bold text-cyan-300">
                              {member.lifetime_washes || 0}
                            </p>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white/10 p-6">
              <h2 className="mb-4 text-2xl font-bold">Today's Washes</h2>

              {todaysWashes.length === 0 ? (
                <p className="text-slate-400">No washes checked in today.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-3 pr-4">Time</th>
                        <th className="py-3 pr-4">Email</th>
                        <th className="py-3 pr-4">Plan</th>
                        <th className="py-3 pr-4">Plate</th>
                      </tr>
                    </thead>

                    <tbody>
                      {todaysWashes.map((visit) => (
                        <tr key={visit.id} className="border-b border-white/10">
                          <td className="py-3 pr-4">
                            {new Date(visit.created_at).toLocaleTimeString()}
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
              )}
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
                      <th className="py-3 pr-4">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {members.slice(0, 12).map((member) => {
                      const fullName =
                        `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
                        "Member"

                      return (
                        <tr key={member.id} className="border-b border-white/10">
                          <td className="py-3 pr-4">{fullName}</td>
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
                            <Link
                              href={`/admin/member/${member.id}`}
                              className="font-bold text-cyan-300"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
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

function PlanBar({
  label,
  count,
  total,
}: {
  label: string
  count: number
  total: number
}) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div>
      <div className="flex justify-between text-sm">
        <p>{label}</p>
        <p className="text-cyan-300">
          {count} • {percentage}%
        </p>
      </div>

      <div className="mt-2 h-3 rounded-full bg-slate-800">
        <div
          className="h-3 rounded-full bg-cyan-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}