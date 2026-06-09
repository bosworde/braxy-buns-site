"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type WashVisit = {
  id: string
  created_at: string
  email: string | null
  membership_plan: string | null
  license_plate: string | null
}

export default function OperationsPage() {
  const [washes, setWashes] = useState<WashVisit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const { data } = await supabase
      .from("wash_visits")
      .select("*")
      .order("created_at", { ascending: false })

    setWashes(data || [])
    setLoading(false)
  }

  const today = new Date().toISOString().slice(0, 10)

  const todaysWashes = washes.filter((wash) =>
    wash.created_at?.startsWith(today)
  )

  const last25Washes = washes.slice(0, 25)

  const uniquePlatesToday = new Set(
    todaysWashes.map((wash) => wash.license_plate).filter(Boolean)
  ).size

  const washesByPlate = washes.reduce<Record<string, number>>((acc, wash) => {
    const plate = wash.license_plate || "Unknown"
    acc[plate] = (acc[plate] || 0) + 1
    return acc
  }, {})

  const mostActivePlate =
    Object.entries(washesByPlate).sort((a, b) => b[1] - a[1])[0]?.[0] || "—"

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Operations Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Real-time tunnel activity, plates, check-ins, and wash volume.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Admin Home
            </Link>

            <Link href="/admin/lpr" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Manual LPR
            </Link>

            <Link href="/admin/lpr-camera" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              LPR Camera
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
            Loading Operations Data...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Stat title="Cars Today" value={todaysWashes.length} />
              <Stat title="Unique Plates Today" value={uniquePlatesToday} />
              <Stat title="Lifetime Washes" value={washes.length} />
              <Stat title="Most Active Plate" value={mostActivePlate} />
            </section>

            <section className="rounded-3xl bg-white/10 p-6">
              <h2 className="text-2xl font-black">
                Live Tunnel Activity Feed
              </h2>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-3 pr-4">Time</th>
                      <th className="py-3 pr-4">Plate</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Plan</th>
                      <th className="py-3 pr-4">Result</th>
                    </tr>
                  </thead>

                  <tbody>
                    {last25Washes.length === 0 ? (
                      <tr>
                        <td className="py-6 text-slate-400" colSpan={5}>
                          No tunnel activity yet.
                        </td>
                      </tr>
                    ) : (
                      last25Washes.map((wash) => (
                        <tr key={wash.id} className="border-b border-white/10">
                          <td className="py-3 pr-4">
                            {new Date(wash.created_at).toLocaleString()}
                          </td>

                          <td className="py-3 pr-4 font-black text-cyan-300">
                            {wash.license_plate || "—"}
                          </td>

                          <td className="py-3 pr-4">
                            {wash.email || "—"}
                          </td>

                          <td className="py-3 pr-4">
                            {wash.membership_plan || "—"}
                          </td>

                          <td className="py-3 pr-4">
                            <span className="rounded-full bg-green-400 px-3 py-1 text-xs font-black text-slate-950">
                              APPROVED
                            </span>
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