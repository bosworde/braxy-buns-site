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
  rewards_points: number | null
  lifetime_washes: number | null
  created_at: string | null
}

export default function RevenuePage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error) {
      setMembers(data || [])
    }

    setLoading(false)
  }

  const activeMembers = members.filter(
    (m) => m.membership_status === "active"
  )

  const geckoCount = activeMembers.filter(
    (m) => m.membership_plan === "Basic Wash Club"
  ).length

  const iguanaCount = activeMembers.filter(
    (m) => m.membership_plan === "Plus Wash Club"
  ).length

  const dragonCount = activeMembers.filter(
    (m) => m.membership_plan === "Max Shine Club"
  ).length

  const geckoMRR = geckoCount * 24.99
  const iguanaMRR = iguanaCount * 34.99
  const dragonMRR = dragonCount * 44.99

  const totalMRR = geckoMRR + iguanaMRR + dragonMRR
  const totalARR = totalMRR * 12

  const totalWashes = members.reduce(
    (sum, member) => sum + (member.lifetime_washes || 0),
    0
  )

  const totalBraxyBucks = members.reduce(
    (sum, member) => sum + (member.rewards_points || 0),
    0
  )

  const avgRevenuePerMember =
    activeMembers.length > 0 ? totalMRR / activeMembers.length : 0

  const avgWashesPerMember =
    activeMembers.length > 0 ? totalWashes / activeMembers.length : 0

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Revenue Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Membership revenue, tier mix, wash activity and rewards.
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
              href="/admin/analytics"
              className="rounded-xl bg-white/10 px-5 py-3 font-bold"
            >
              Analytics
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
            Loading Revenue Data...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Stat title="Active Members" value={activeMembers.length} />
              <Stat title="Monthly Revenue (MRR)" value={`$${totalMRR.toFixed(2)}`} />
              <Stat
                title="Annual Revenue (ARR)"
                value={`$${totalARR.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}`}
              />
              <Stat title="Total Members" value={members.length} />
              <Stat title="Total Washes" value={totalWashes} />
              <Stat title="Braxy Bucks Issued" value={totalBraxyBucks} />
              <Stat
                title="Avg Revenue / Member"
                value={`$${avgRevenuePerMember.toFixed(2)}`}
              />
              <Stat
                title="Avg Washes / Member"
                value={avgWashesPerMember.toFixed(1)}
              />
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
              <TierCard
                title="🦎 Gecko Club"
                subtitle="Basic Wash Club"
                members={geckoCount}
                mrr={geckoMRR}
                color="bg-emerald-400"
              />

              <TierCard
                title="🦎 Iguana Club"
                subtitle="Plus Wash Club"
                members={iguanaCount}
                mrr={iguanaMRR}
                color="bg-cyan-400"
              />

              <TierCard
                title="🐉 Dragon Club"
                subtitle="Max Shine Club"
                members={dragonCount}
                mrr={dragonMRR}
                color="bg-yellow-300"
              />
            </section>

            <section className="rounded-3xl bg-white/10 p-6">
              <h2 className="text-2xl font-black">
                Membership Tier Mix
              </h2>

              <div className="mt-6 space-y-5">
                <Bar
                  label="Gecko Club"
                  count={geckoCount}
                  total={activeMembers.length}
                />

                <Bar
                  label="Iguana Club"
                  count={iguanaCount}
                  total={activeMembers.length}
                />

                <Bar
                  label="Dragon Club"
                  count={dragonCount}
                  total={activeMembers.length}
                />
              </div>
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

function TierCard({
  title,
  subtitle,
  members,
  mrr,
  color,
}: {
  title: string
  subtitle: string
  members: number
  mrr: number
  color: string
}) {
  return (
    <div className="rounded-3xl bg-white/10 p-6">
      <div className={`rounded-2xl ${color} p-5 text-slate-950`}>
        <h2 className="text-3xl font-black">
          {title}
        </h2>

        <p className="mt-1 text-sm font-black uppercase tracking-[0.25em]">
          {subtitle}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400">Members</p>
          <p className="text-4xl font-black text-white">
            {members}
          </p>
        </div>

        <div>
          <p className="text-slate-400">MRR</p>
          <p className="text-4xl font-black text-cyan-300">
            ${mrr.toFixed(2)}
          </p>
        </div>
      </div>
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