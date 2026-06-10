"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type QueueItem = {
  id: string
  created_at: string
  license_plate: string | null
  status: string | null
}

type WashVisit = {
  id: string
  created_at: string
}

export default function TunnelScreenPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [washes, setWashes] = useState<WashVisit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()

    const timer = setInterval(() => {
      loadData()
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  async function loadData() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [{ data: queueData }, { data: washData }] = await Promise.all([
      supabase
        .from("tunnel_queue")
        .select("*")
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: true }),

      supabase
        .from("wash_visits")
        .select("id, created_at")
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false }),
    ])

    setQueue(queueData || [])
    setWashes(washData || [])
    setLoading(false)
  }

  const waiting = queue.filter((item) => item.status === "waiting")
  const inTunnel = queue.filter((item) => item.status === "in_tunnel")
  const completed = queue.filter((item) => item.status === "completed")

const nowEntering = inTunnel[0] || null
const nextUp = waiting[0] || null

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-cyan-300">
              Braxy Buns Tunnel
            </p>

            <h1 className="mt-2 text-5xl font-black">
              Live Tunnel Screen
            </h1>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/queue" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Queue
            </Link>

            <Link href="/admin/operations" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Operations
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white/10 p-10 text-3xl font-black">
            Loading Tunnel Screen...
          </div>
        ) : (
          <>
            <section className="rounded-[2rem] border border-cyan-400/30 bg-white/10 p-10 text-center">
              <p className="text-xl font-black uppercase tracking-[0.4em] text-cyan-300">
                Now Entering
              </p>

              <h2 className="mt-6 text-8xl font-black text-yellow-300">
                {nowEntering?.license_plate || "READY"}
              </h2>

              <p className="mt-6 text-3xl font-bold text-white/80">
                {nowEntering ? "Welcome to Braxy Buns Car Wash" : "No car currently in queue"}
              </p>
            </section>

            <section className="grid gap-6 md:grid-cols-4">
              <Stat title="Cars Waiting" value={waiting.length} />
              <Stat title="In Tunnel" value={inTunnel.length} />
              <Stat title="Washed Today" value={washes.length} />
              <Stat title="Completed Queue" value={completed.length} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-8">
                <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">
                  Next Up
                </p>

                <h3 className="mt-4 text-6xl font-black text-cyan-300">
                  {nextUp?.license_plate || "—"}
                </h3>
              </div>

              <div className="rounded-3xl bg-green-400 p-8 text-slate-950">
                <p className="text-sm font-black uppercase tracking-[0.35em]">
                  Tunnel Status
                </p>

                <h3 className="mt-4 text-6xl font-black">
                  RUNNING
                </h3>
              </div>
            </section>

            <section className="rounded-3xl bg-white/10 p-8">
              <h2 className="text-3xl font-black">Waiting Line</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {waiting.length === 0 ? (
                  <p className="text-slate-400">No cars waiting.</p>
                ) : (
                  waiting.slice(0, 8).map((item, index) => (
                    <div key={item.id} className="rounded-2xl bg-slate-950/70 p-5">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                        Position #{index + 1}
                      </p>

                      <p className="mt-3 text-3xl font-black text-cyan-300">
                        {item.license_plate || "No Plate"}
                      </p>
                    </div>
                  ))
                )}
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
    <div className="rounded-3xl bg-white/10 p-8 text-center">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
        {title}
      </p>

      <p className="mt-4 text-5xl font-black text-cyan-300">
        {value}
      </p>
    </div>
  )
}