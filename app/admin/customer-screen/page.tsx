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

export default function CustomerScreenPage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQueue()

    const timer = setInterval(loadQueue, 5000)

    return () => clearInterval(timer)
  }, [])

  async function loadQueue() {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from("tunnel_queue")
      .select("*")
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: true })

    setQueue(data || [])
    setLoading(false)
  }

  const inTunnel = queue.filter((item) => item.status === "in_tunnel")
  const waiting = queue.filter((item) => item.status === "waiting")

  const nowServing = inTunnel[0] || null
  const nextUp = waiting[0] || null

  const estimatedWaitMinutes = waiting.length > 0 ? waiting.length * 2 : 0

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-cyan-300">
              Braxy Buns Car Wash
            </p>

            <h1 className="mt-2 text-5xl font-black">
              Customer Arrival Screen
            </h1>
          </div>

          <Link
            href="/admin/tunnel-screen"
            className="rounded-xl bg-white/10 px-5 py-3 font-bold"
          >
            Tunnel Screen
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl bg-white/10 p-10 text-3xl font-black">
            Loading Customer Screen...
          </div>
        ) : (
          <>
            <section className="rounded-[2rem] border border-cyan-400/30 bg-white/10 p-10 text-center">
              <p className="text-xl font-black uppercase tracking-[0.4em] text-cyan-300">
                Welcome To
              </p>

              <h2 className="mt-5 text-7xl font-black text-yellow-300">
                BRAXY BUNS
              </h2>

              <p className="mt-6 text-3xl font-bold text-white/80">
                Premium Car Wash Technology. Built for Fulshear.
              </p>
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-green-400 p-10 text-slate-950">
                <p className="text-sm font-black uppercase tracking-[0.35em]">
                  Now Serving
                </p>

                <h3 className="mt-5 text-7xl font-black">
                  {nowServing?.license_plate || "READY"}
                </h3>
              </div>

              <div className="rounded-3xl bg-cyan-400 p-10 text-slate-950">
                <p className="text-sm font-black uppercase tracking-[0.35em]">
                  Next Up
                </p>

                <h3 className="mt-5 text-7xl font-black">
                  {nextUp?.license_plate || "—"}
                </h3>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-3">
              <Stat title="Cars Ahead" value={waiting.length} />
              <Stat title="Estimated Wait" value={`${estimatedWaitMinutes} min`} />
              <Stat title="Tunnel Status" value="OPEN" />
            </section>

            <section className="rounded-3xl bg-white/10 p-10 text-center">
              <p className="text-4xl font-black text-white">
                Thank you for supporting meaningful employment opportunities
                for neurodiverse adults.
              </p>

              <p className="mt-5 text-2xl font-bold text-cyan-300">
                God first. We second. Children third.
              </p>
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