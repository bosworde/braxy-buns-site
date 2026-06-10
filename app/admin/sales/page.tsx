"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  created_at: string | null
  membership_plan: string | null
  membership_status: string | null
}

type Lead = {
  id: string
  status: string | null
}

const planPrices: Record<string, number> = {
  "Basic": 24.99,
  "Plus": 34.99,
  "Max": 44.99,
  "Gecko Wash Club": 24.99,
  "Iguana Wash Club": 34.99,
  "Dragon Wash Club": 44.99,
  "Founding Member": 44.99,
}

export default function SalesDashboardPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data: memberData } = await supabase
      .from("members")
      .select("id, created_at, membership_plan, membership_status")

    const { data: leadData } = await supabase
      .from("founding_member_leads")
      .select("id, status")

    setMembers(memberData || [])
    setLeads(leadData || [])
    setLoading(false)
  }

  const activeMembers = members.filter((m) =>
    ["active", "Active"].includes(m.membership_status || "")
  )

  const cancelledMembers = members.filter((m) =>
    ["cancelled", "canceled"].includes(m.membership_status || "")
  )

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()

  const newMembersThisMonth = members.filter((m) => {
    if (!m.created_at) return false
    const d = new Date(m.created_at)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  const mrr = activeMembers.reduce((total, member) => {
    const plan = member.membership_plan || ""
    return total + (planPrices[plan] || 0)
  }, 0)

  const convertedLeads = leads.filter((l) =>
    ["Converted", "Joined"].includes(l.status || "")
  ).length

  const conversionRate =
    leads.length > 0 ? ((convertedLeads / leads.length) * 100).toFixed(1) : "0.0"

  const planCounts = activeMembers.reduce<Record<string, number>>((acc, member) => {
    const plan = member.membership_plan || "No Plan"
    acc[plan] = (acc[plan] || 0) + 1
    return acc
  }, {})

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Membership Sales Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Track recurring revenue, member growth, and lead conversion.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Admin Home
            </Link>

            <Link href="/admin/leads" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Leads
            </Link>

            <Link href="/admin/members" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Members
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
          <p className="text-slate-400">Loading sales data...</p>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-5">
              <Stat title="MRR" value={`$${mrr.toFixed(2)}`} />
              <Stat title="Active Members" value={activeMembers.length} />
              <Stat title="New This Month" value={newMembersThisMonth.length} />
              <Stat title="Cancelled" value={cancelledMembers.length} />
              <Stat title="Lead Conversion" value={`${conversionRate}%`} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-6">
                <h2 className="text-2xl font-black">Revenue By Plan</h2>

                <div className="mt-6 space-y-4">
                  {Object.entries(planCounts).length === 0 ? (
                    <p className="text-slate-400">No active members yet.</p>
                  ) : (
                    Object.entries(planCounts).map(([plan, count]) => {
                      const monthlyRevenue = (planPrices[plan] || 0) * count

                      return (
                        <div key={plan} className="rounded-2xl bg-slate-900 p-5">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-lg font-black">{plan}</p>
                              <p className="text-sm text-slate-400">
                                {count} active members
                              </p>
                            </div>

                            <p className="text-xl font-black text-cyan-300">
                              ${monthlyRevenue.toFixed(2)}/mo
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6">
                <h2 className="text-2xl font-black">Lead Funnel</h2>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <FunnelCard label="Total Leads" value={leads.length} />
                  <FunnelCard label="Converted Leads" value={convertedLeads} />
                  <FunnelCard label="Conversion Rate" value={`${conversionRate}%`} />
                  <FunnelCard label="Unconverted Leads" value={leads.length - convertedLeads} />
                </div>

                <div className="mt-6 rounded-2xl bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                    Investor Snapshot
                  </p>

                  <p className="mt-3 text-lg font-bold">
                    Braxy Buns currently has {activeMembers.length} active members,
                    ${mrr.toFixed(2)} in estimated monthly recurring revenue, and a
                    {` ${conversionRate}%`} lead-to-member conversion rate.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  )
}

function FunnelCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-900 p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
    </div>
  )
}