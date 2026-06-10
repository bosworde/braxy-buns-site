"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  membership_plan: string | null
  membership_status: string | null
  rewards_points: number | null
  lifetime_washes: number | null
}

const PRICES: Record<string, number> = {
  "Basic Wash Club": 24.99,
  "Plus Wash Club": 34.99,
  "Max Shine Club": 44.99,
}

export default function FounderPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data } = await supabase
      .from("members")
      .select("id, membership_plan, membership_status, rewards_points, lifetime_washes")

    setMembers(data || [])
    setLoading(false)
  }

  const activeMembers = members.filter((m) => m.membership_status === "active")

  const mrr = activeMembers.reduce((sum, member) => {
    return sum + (PRICES[member.membership_plan || ""] || 0)
  }, 0)

  const arr = mrr * 12

  const lifetimeWashes = members.reduce(
    (sum, member) => sum + (member.lifetime_washes || 0),
    0
  )

  const braxyBucks = members.reduce(
    (sum, member) => sum + (member.rewards_points || 0),
    0
  )

  const arpu = activeMembers.length > 0 ? mrr / activeMembers.length : 0

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-yellow-300">
              Founder Mode
            </p>
            <h1 className="mt-2 text-5xl font-black">
              Braxy Buns CEO Dashboard
            </h1>
            <p className="mt-2 text-slate-400">
              Live operating data plus long-term expansion, mission, and enterprise value targets.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Admin
            </Link>
            <Link href="/admin/revenue" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Revenue
            </Link>
            <Link href="/admin/operations" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Operations
            </Link>
            <button
              onClick={loadData}
              className="rounded-xl bg-yellow-300 px-5 py-3 font-bold text-slate-950"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white/10 p-8">
            Loading Founder Mode...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Stat title="Active Members" value={activeMembers.length} />
              <Stat title="Current MRR" value={money(mrr)} />
              <Stat title="Current ARR" value={money(arr)} />
              <Stat title="ARPU" value={money(arpu)} />
              <Stat title="Lifetime Washes" value={lifetimeWashes} />
              <Stat title="Braxy Bucks Issued" value={braxyBucks} />
              <Stat title="Total Members" value={members.length} />
              <Stat title="Mission Status" value="Building" />
            </section>

            <section className="rounded-3xl bg-white/10 p-6">
              <h2 className="text-3xl font-black">Growth Targets</h2>
              <div className="mt-6 space-y-6">
                <Goal label="500 Member Goal" current={activeMembers.length} target={500} />
                <Goal label="1,000 Member Goal" current={activeMembers.length} target={1000} />
                <Goal label="2,000 Member Goal" current={activeMembers.length} target={2000} />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <ProjectionCard title="500 Members" mrr={17495} />
              <ProjectionCard title="1,000 Members" mrr={34990} />
              <ProjectionCard title="2,000 Members" mrr={69980} />
            </section>

            <section className="rounded-3xl bg-white/10 p-6">
              <h2 className="text-3xl font-black">Expansion Vision</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <ExpansionCard locations={1} mrr={34990} />
                <ExpansionCard locations={5} mrr={174950} />
                <ExpansionCard locations={25} mrr={874750} />
                <ExpansionCard locations={100} mrr={3499000} />
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-yellow-300 p-8 text-slate-950">
                <p className="text-sm font-black uppercase tracking-[0.35em]">
                  Founder Vision
                </p>
                <h2 className="mt-4 text-4xl font-black">
                  Build the most technologically advanced, mission-driven express car wash company in America.
                </h2>
                <p className="mt-6 text-2xl font-black">
                  God First. We Second. Children Third.
                </p>
              </div>

              <div className="rounded-3xl bg-white/10 p-8">
                <p className="text-sm font-black uppercase tracking-[0.35em] text-cyan-300">
                  Neurodiverse Employment Mission
                </p>
                <div className="mt-6 space-y-4">
                  <Mission label="First Employee" />
                  <Mission label="10 Employees" />
                  <Mission label="100 Employees" />
                  <Mission label="1,000 Employees" />
                  <Mission label="10,000 Employees" />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function money(value: number) {
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  )
}

function Goal({
  label,
  current,
  target,
}: {
  label: string
  current: number
  target: number
}) {
  const pct = Math.min(100, Math.round((current / target) * 100))

  return (
    <div>
      <div className="mb-2 flex justify-between">
        <p className="font-bold">{label}</p>
        <p className="font-bold text-cyan-300">
          {current} / {target} • {pct}%
        </p>
      </div>
      <div className="h-5 rounded-full bg-slate-800">
        <div className="h-5 rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ProjectionCard({ title, mrr }: { title: string; mrr: number }) {
  return (
    <div className="rounded-3xl bg-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{title}</p>
      <p className="mt-4 text-4xl font-black text-cyan-300">{money(mrr)} MRR</p>
      <p className="mt-2 text-2xl font-black text-white">{money(mrr * 12)} ARR</p>
    </div>
  )
}

function ExpansionCard({ locations, mrr }: { locations: number; mrr: number }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-6">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        {locations} Location{locations > 1 ? "s" : ""}
      </p>
      <p className="mt-3 text-3xl font-black text-cyan-300">{money(mrr)}</p>
      <p className="mt-1 text-sm text-slate-400">Monthly recurring revenue</p>
    </div>
  )
}

function Mission({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-4">
      <p className="text-xl font-black text-white">{label}</p>
    </div>
  )
}