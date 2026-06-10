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

type QueueItem = {
  id: string
  created_at: string
  wash_visit_id: string | null
  license_plate: string | null
  status: string | null
}

export default function OperationsPage() {
  const [washes, setWashes] = useState<WashVisit[]>([])
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [{ data: washData }, { data: queueData }] = await Promise.all([
      supabase
        .from("wash_visits")
        .select("*")
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false }),

      supabase
        .from("tunnel_queue")
        .select("*")
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false }),
    ])

    setWashes(washData || [])
    setQueue(queueData || [])
    setLoading(false)
  }

  const waiting = queue.filter((item) => item.status === "waiting").length
  const inTunnel = queue.filter((item) => item.status === "in_tunnel").length
  const completed = queue.filter((item) => item.status === "completed").length
  const rejected = queue.filter((item) => item.status === "rejected").length

  const last25Washes = washes.slice(0, 25)
  const activeQueue = queue.filter(
    (item) => item.status === "waiting" || item.status === "in_tunnel"
  )

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Operations Center
            </h1>

            <p className="mt-2 text-slate-400">
              Live tunnel activity, queue status, wash volume, and daily operations.
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

            <Link href="/admin/queue" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Queue
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
            <section className="grid gap-4 md:grid-cols-5">
              <Stat title="Today’s Washes" value={washes.length} />
              <Stat title="Waiting" value={waiting} />
              <Stat title="In Tunnel" value={inTunnel} />
              <Stat title="Completed" value={completed} />
              <Stat title="Rejected" value={rejected} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-6">
                <h2 className="text-2xl font-black">Live Active Queue</h2>

                <div className="mt-5 space-y-3">
                  {activeQueue.length === 0 ? (
                    <p className="text-slate-400">No cars currently waiting or in tunnel.</p>
                  ) : (
                    activeQueue.map((item, index) => (
                      <div key={item.id} className="rounded-2xl bg-slate-950/70 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Car #{index + 1}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-4">
                          <p className="text-2xl font-black text-cyan-300">
                            {item.license_plate || "No Plate"}
                          </p>

                          <StatusBadge status={item.status || "waiting"} />
                        </div>

                        <p className="mt-2 text-xs text-slate-500">
                          {new Date(item.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-6">
                <h2 className="text-2xl font-black">Today’s Wash Feed</h2>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-3 pr-4">Time</th>
                        <th className="py-3 pr-4">Plate</th>
                        <th className="py-3 pr-4">Plan</th>
                        <th className="py-3 pr-4">Result</th>
                      </tr>
                    </thead>

                    <tbody>
                      {last25Washes.length === 0 ? (
                        <tr>
                          <td className="py-6 text-slate-400" colSpan={4}>
                            No washes today yet.
                          </td>
                        </tr>
                      ) : (
                        last25Washes.map((wash) => (
                          <tr key={wash.id} className="border-b border-white/10">
                            <td className="py-3 pr-4">
                              {new Date(wash.created_at).toLocaleTimeString()}
                            </td>

                            <td className="py-3 pr-4 font-black text-cyan-300">
                              {wash.license_plate || "—"}
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
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    waiting: "bg-yellow-300 text-slate-950",
    in_tunnel: "bg-blue-400 text-slate-950",
    completed: "bg-green-400 text-slate-950",
    rejected: "bg-red-400 text-slate-950",
  }

  const labels: Record<string, string> = {
    waiting: "WAITING",
    in_tunnel: "IN TUNNEL",
    completed: "COMPLETED",
    rejected: "REJECTED",
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[status] || "bg-slate-700 text-white"}`}>
      {labels[status] || status.toUpperCase()}
    </span>
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