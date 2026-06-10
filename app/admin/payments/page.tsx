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
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string | null
}

export default function PaymentsPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })

    setMembers(data || [])
    setLoading(false)
  }

  const activeMembers = members.filter(
    (member) => member.membership_status === "active"
  )

  const stripeLinked = members.filter(
    (member) => member.stripe_customer_id || member.stripe_subscription_id
  )

  const missingStripe = activeMembers.filter(
    (member) => !member.stripe_customer_id && !member.stripe_subscription_id
  )

  const basic = activeMembers.filter(
    (member) => member.membership_plan === "Gecko Wash Club"
  ).length

  const plus = activeMembers.filter(
    (member) => member.membership_plan === "Iguana Wash Club"
  ).length

  const max = activeMembers.filter(
    (member) => member.membership_plan === "Dragon Wash Club"
  ).length

  const estimatedMRR = basic * 24.99 + plus * 34.99 + max * 44.99

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Payments Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Membership billing, Stripe connection status, and estimated subscription revenue.
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
            Loading Payments...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Stat title="Active Members" value={activeMembers.length} />
              <Stat title="Stripe Linked" value={stripeLinked.length} />
              <Stat title="Missing Stripe IDs" value={missingStripe.length} />
              <Stat title="Estimated MRR" value={`$${estimatedMRR.toFixed(2)}`} />
            </section>

            <section className="rounded-3xl bg-white/10 p-6">
              <h2 className="text-2xl font-black">
                Member Billing Status
              </h2>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-3 pr-4">Member</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Plan</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Stripe Customer</th>
                      <th className="py-3 pr-4">Subscription</th>
                    </tr>
                  </thead>

                  <tbody>
                    {members.length === 0 ? (
                      <tr>
                        <td className="py-6 text-slate-400" colSpan={6}>
                          No members found.
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => {
                        const fullName =
                          `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
                          "Member"

                        return (
                          <tr key={member.id} className="border-b border-white/10">
                            <td className="py-3 pr-4 font-bold">
                              {fullName}
                            </td>

                            <td className="py-3 pr-4">
                              {member.email}
                            </td>

                            <td className="py-3 pr-4">
                              {member.membership_plan || "—"}
                            </td>

                            <td className="py-3 pr-4">
                              {member.membership_status || "inactive"}
                            </td>

                            <td className="py-3 pr-4">
                              {member.stripe_customer_id ? (
                                <span className="font-bold text-cyan-300">
                                  Linked
                                </span>
                              ) : (
                                <span className="text-yellow-300">
                                  Missing
                                </span>
                              )}
                            </td>

                            <td className="py-3 pr-4">
                              {member.stripe_subscription_id ? (
                                <span className="font-bold text-cyan-300">
                                  Linked
                                </span>
                              ) : (
                                <span className="text-yellow-300">
                                  Missing
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })
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