"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  membership_plan: string | null
  membership_status: string | null
}

export default function InvestorDashboardPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data } = await supabase
      .from("members")
      .select("id, membership_plan, membership_status")

    setMembers(data || [])
    setLoading(false)
  }

  const activeMembers = members.filter(
    (m) => m.membership_status === "active"
  )

  const basic = activeMembers.filter(
    (m) => m.membership_plan === "Basic Wash Club"
  ).length

  const plus = activeMembers.filter(
    (m) => m.membership_plan === "Plus Wash Club"
  ).length

  const max = activeMembers.filter(
    (m) => m.membership_plan === "Max Shine Club"
  ).length

  const currentMRR = basic * 24.99 + plus * 34.99 + max * 44.99
  const currentARR = currentMRR * 12

  const projectCost = 9000000
  const equityRequired = 2700000
  const debtRequired = 6300000
  const equipmentBudget = 2000000
  const developmentFee = projectCost * 0.035

  const targetMembers = 1000
  const targetMRR = 25000
  const memberProgress = activeMembers.length / targetMembers
  const revenueProgress = currentMRR / targetMRR

  const year1Revenue = 950000
  const year3Revenue = 1700000
  const year5Revenue = 2400000
  const year5EBITDA = 1800000

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Investor Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Capital plan, revenue progress, site metrics, and projected returns.
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
              href="/admin/analytics"
              className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Analytics
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white/10 p-8">
            Loading Investor Dashboard...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Stat title="Total Project Cost" value={money(projectCost)} />
              <Stat title="Equity Required" value={money(equityRequired)} />
              <Stat title="Debt Required" value={money(debtRequired)} />
              <Stat title="Development Fee" value={money(developmentFee)} />
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              <Stat title="Current Members" value={activeMembers.length} />
              <Stat title="Current MRR" value={money(currentMRR)} />
              <Stat title="Current ARR" value={money(currentARR)} />
              <Stat title="MRR Goal" value={money(targetMRR)} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <ProgressCard
                title="Membership Goal"
                current={activeMembers.length}
                target={targetMembers}
                percent={memberProgress}
                label="members"
              />

              <ProgressCard
                title="MRR Goal"
                current={currentMRR}
                target={targetMRR}
                percent={revenueProgress}
                label="monthly revenue"
                moneyMode
              />
            </section>

            <section className="grid gap-4 md:grid-cols-4">
              <Stat title="Year 1 Revenue" value={money(year1Revenue)} />
              <Stat title="Year 3 Revenue" value={money(year3Revenue)} />
              <Stat title="Year 5 Revenue" value={money(year5Revenue)} />
              <Stat title="Year 5 EBITDA" value={money(year5EBITDA)} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-6">
                <h2 className="text-2xl font-black">
                  Valuation Estimate
                </h2>

                <div className="mt-6 grid gap-4">
                  <ValuationRow multiple="8x EBITDA" value={year5EBITDA * 8} />
                  <ValuationRow multiple="10x EBITDA" value={year5EBITDA * 10} />
                  <ValuationRow multiple="12x EBITDA" value={year5EBITDA * 12} />
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6">
                <h2 className="text-2xl font-black">
                  Site & Build Profile
                </h2>

                <div className="mt-6 grid gap-4">
                  <InfoRow label="Target Market" value="Fulshear / FM 1093 Corridor" />
                  <InfoRow label="Tunnel Length" value="120+ feet" />
                  <InfoRow label="Vacuum Stalls" value="18" />
                  <InfoRow label="Equipment Budget" value={money(equipmentBudget)} />
                  <InfoRow label="Model" value="Express Tunnel Membership Car Wash" />
                </div>
              </div>
            </section>

            <section className="rounded-3xl bg-cyan-400 p-8 text-slate-950">
              <p className="text-sm font-black uppercase tracking-[0.3em]">
                Investor Summary
              </p>

              <h2 className="mt-3 text-3xl font-black">
                Braxy Buns is being built as a high-recurring-revenue car wash platform with a mission-driven employment model.
              </h2>

              <p className="mt-4 max-w-4xl text-lg font-semibold">
                The flagship location is planned around a premium express tunnel,
                strong membership economics, LPR technology, smart tunnel controls,
                and meaningful employment opportunities for neurodiverse individuals.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
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

function ProgressCard({
  title,
  current,
  target,
  percent,
  label,
  moneyMode = false,
}: {
  title: string
  current: number
  target: number
  percent: number
  label: string
  moneyMode?: boolean
}) {
  const pct = Math.min(Math.round(percent * 1000) / 10, 100)

  return (
    <div className="rounded-3xl bg-white/10 p-6">
      <h2 className="text-2xl font-black">{title}</h2>

      <div className="mt-5 flex justify-between text-sm">
        <p className="text-slate-400">
          Current {label}
        </p>

        <p className="font-bold text-cyan-300">
          {moneyMode ? money(current) : current}
        </p>
      </div>

      <div className="mt-2 flex justify-between text-sm">
        <p className="text-slate-400">
          Target {label}
        </p>

        <p className="font-bold text-cyan-300">
          {moneyMode ? money(target) : target}
        </p>
      </div>

      <div className="mt-5 h-5 rounded-full bg-slate-800">
        <div
          className="h-5 rounded-full bg-cyan-400"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-3 text-right text-sm font-bold text-cyan-300">
        {pct}% complete
      </p>
    </div>
  )
}

function ValuationRow({
  multiple,
  value,
}: {
  multiple: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-950/60 p-4">
      <p className="font-bold text-slate-300">{multiple}</p>

      <p className="text-2xl font-black text-cyan-300">
        {money(value)}
      </p>
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