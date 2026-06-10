"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  membership_plan: string | null
  membership_status: string | null
  created_at: string | null
  rewards_points: number | null
  lifetime_washes: number | null
}

type WashVisit = {
  id: string
  created_at: string | null
}

type MonthData = {
  month: string
  members: number
  mrr: number
  washes: number
}

export default function AnalyticsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [washes, setWashes] = useState<WashVisit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data: memberData } = await supabase
      .from("members")
      .select("id, membership_plan, membership_status, created_at, rewards_points, lifetime_washes")
      .order("created_at", { ascending: true })

    const { data: washData } = await supabase
      .from("wash_visits")
      .select("id, created_at")
      .order("created_at", { ascending: true })

    setMembers(memberData || [])
    setWashes(washData || [])
    setLoading(false)
  }

  const activeMembers = members.filter(
    (m) => m.membership_status === "active"
  )

  const basic = activeMembers.filter(
    (m) => m.membership_plan === "Gecko Wash Club"
  ).length

  const plus = activeMembers.filter(
    (m) => m.membership_plan === "Iguana Wash Club"
  ).length

  const max = activeMembers.filter(
    (m) => m.membership_plan === "Dragon Wash Club"
  ).length

  const currentMRR = basic * 24.99 + plus * 34.99 + max * 44.99
  const currentARR = currentMRR * 12

  const totalWashes = washes.length

  const totalBraxyBucks = members.reduce(
    (sum, member) => sum + (member.rewards_points || 0),
    0
  )

  const monthData = buildMonthData(members, washes)
  const maxMembers = Math.max(...monthData.map((m) => m.members), 1)
  const maxMRR = Math.max(...monthData.map((m) => m.mrr), 1)
  const maxWashes = Math.max(...monthData.map((m) => m.washes), 1)

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Analytics Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Membership growth, revenue growth, wash volume, and platform KPIs.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl bg-white/10 px-5 py-3 font-bold"
            >
              Admin Home
            </Link>

            <Link
              href="/admin/revenue"
              className="rounded-xl bg-white/10 px-5 py-3 font-bold"
            >
              Revenue
            </Link>

          <Link
  href="/admin/investors"
  className="rounded-xl bg-white/10 px-5 py-3 font-bold"
>
  Investors
</Link>

            <button
              onClick={loadData}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white/10 p-8">
            Loading Analytics...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Stat title="Active Members" value={activeMembers.length} />
              <Stat title="Current MRR" value={money(currentMRR)} />
              <Stat title="Current ARR" value={money(currentARR)} />
              <Stat title="Total Washes" value={totalWashes} />

              <Stat title="Total Members" value={members.length} />
              <Stat title="Braxy Bucks" value={totalBraxyBucks} />
              <Stat title="Basic Members" value={basic} />
              <Stat title="Premium Members" value={max} />
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <ChartCard
                title="Membership Growth"
                subtitle="Total members created by month"
                data={monthData}
                valueKey="members"
                maxValue={maxMembers}
                formatValue={(value) => `${value}`}
              />

              <ChartCard
                title="MRR Growth"
                subtitle="Estimated monthly recurring revenue"
                data={monthData}
                valueKey="mrr"
                maxValue={maxMRR}
                formatValue={(value) => money(value)}
              />

              <ChartCard
                title="Wash Volume"
                subtitle="Wash visits by month"
                data={monthData}
                valueKey="washes"
                maxValue={maxWashes}
                formatValue={(value) => `${value}`}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-6">
                <h2 className="text-2xl font-black">
                  Membership Tier Snapshot
                </h2>

                <div className="mt-6 space-y-5">
                  <Bar label="Gecko Wash Club" count={basic} total={activeMembers.length} />
                  <Bar label="Iguana Wash Club" count={plus} total={activeMembers.length} />
                  <Bar label="Dragon Wash Club" count={max} total={activeMembers.length} />
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6">
                <h2 className="text-2xl font-black">
                  Operating Snapshot
                </h2>

                <div className="mt-6 grid gap-4">
                  <InfoRow label="Revenue per Active Member" value={activeMembers.length ? money(currentMRR / activeMembers.length) : "$0"} />
                  <InfoRow label="Washes per Active Member" value={activeMembers.length ? (totalWashes / activeMembers.length).toFixed(1) : "0.0"} />
                  <InfoRow label="Braxy Bucks per Member" value={members.length ? Math.round(totalBraxyBucks / members.length).toString() : "0"} />
                  <InfoRow label="Premium Mix" value={`${activeMembers.length ? Math.round((max / activeMembers.length) * 100) : 0}%`} />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function buildMonthData(members: Member[], washes: WashVisit[]): MonthData[] {
  const months: MonthData[] = []

  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = date.toLocaleString("en-US", {
      month: "short",
      year: "2-digit",
    })

    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1)

    const membersByEndOfMonth = members.filter((member) => {
      if (!member.created_at) return false
      return new Date(member.created_at) < monthEnd
    })

    const activeByEndOfMonth = membersByEndOfMonth.filter(
      (m) => m.membership_status === "active"
    )

    const basic = activeByEndOfMonth.filter(
      (m) => m.membership_plan === "Gecko Wash Club"
    ).length

    const plus = activeByEndOfMonth.filter(
      (m) => m.membership_plan === "Iguana Wash Club"
    ).length

    const max = activeByEndOfMonth.filter(
      (m) => m.membership_plan === "Dragon Wash Club"
    ).length

    const mrr = basic * 24.99 + plus * 34.99 + max * 44.99

    const washesInMonth = washes.filter((wash) => {
      if (!wash.created_at) return false
      const washDate = new Date(wash.created_at)
      return washDate >= monthStart && washDate < monthEnd
    }).length

    months.push({
      month,
      members: membersByEndOfMonth.length,
      mrr,
      washes: washesInMonth,
    })
  }

  return months
}

function ChartCard({
  title,
  subtitle,
  data,
  valueKey,
  maxValue,
  formatValue,
}: {
  title: string
  subtitle: string
  data: MonthData[]
  valueKey: "members" | "mrr" | "washes"
  maxValue: number
  formatValue: (value: number) => string
}) {
  return (
    <div className="rounded-3xl bg-white/10 p-6">
      <h2 className="text-2xl font-black">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        {subtitle}
      </p>

      <div className="mt-8 flex h-64 items-end gap-3">
        {data.map((item) => {
          const value = item[valueKey]
          const height = maxValue > 0 ? Math.max((value / maxValue) * 100, value > 0 ? 8 : 0) : 0

          return (
            <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="text-xs font-bold text-cyan-300">
                {formatValue(value)}
              </div>

              <div className="flex h-44 w-full items-end rounded-xl bg-slate-900/70 p-1">
                <div
                  className="w-full rounded-lg bg-cyan-400"
                  style={{ height: `${height}%` }}
                />
              </div>

              <div className="text-xs text-slate-400">
                {item.month}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Stat({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black text-cyan-300">
        {value}
      </p>
    </div>
  )
}

function Bar({
  label,
  count,
  total,
}: {
  label: string
  count: number
  total: number
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <p>{label}</p>
        <p className="text-cyan-300">
          {count} members • {pct}%
        </p>
      </div>

      <div className="h-4 rounded-full bg-slate-800">
        <div
          className="h-4 rounded-full bg-cyan-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-950/60 p-4">
      <p className="font-bold text-slate-400">{label}</p>
      <p className="text-right font-black text-white">{value}</p>
    </div>
  )
}

function money(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
}