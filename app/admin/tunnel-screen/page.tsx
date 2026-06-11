"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type QueueItem = {
  id: string
  created_at: string
  license_plate: string | null
  status: string | null
  member_id: string | null
  first_name: string | null
  membership_plan: string | null
  rewards_points: number | null
  lifetime_washes: number | null
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

    const channel = supabase
      .channel("tunnel_screen_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tunnel_queue",
        },
        () => loadData()
      )
      .subscribe()

    const interval = setInterval(() => loadData(), 15000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
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
  const rejected = queue.filter((item) => item.status === "rejected")

  const nowEntering = inTunnel[0] || null
  const nextUp = waiting[0] || null

  const planImage =
    nowEntering?.membership_plan === "Dragon Wash Club"
      ? "/dragon-tunnel.png"
      : nowEntering?.membership_plan === "Iguana Wash Club"
      ? "/iguana-tunnel.png"
      : nowEntering?.membership_plan === "Gecko Wash Club"
      ? "/gecko-tunnel.png"
      : "/dragon-tunnel.png"

  const planColor =
    nowEntering?.membership_plan === "Dragon Wash Club"
      ? "text-yellow-300"
      : nowEntering?.membership_plan === "Iguana Wash Club"
      ? "text-cyan-300"
      : nowEntering?.membership_plan === "Gecko Wash Club"
      ? "text-green-300"
      : "text-yellow-300"

  return (
    <main className="min-h-screen bg-slate-950 px-8 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-cyan-300">
              Braxy Buns Tunnel
            </p>

            <h1 className="mt-2 text-5xl font-black">
              Live Tunnel Screen
            </h1>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/queue"
              className="rounded-xl bg-white/10 px-5 py-3 font-bold"
            >
              Queue
            </Link>

            <Link
              href="/admin/operations"
              className="rounded-xl bg-white/10 px-5 py-3 font-bold"
            >
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
            <section className="rounded-[2rem] border border-cyan-400/30 bg-white/10 px-10 py-6 text-center overflow-hidden">
              {nowEntering ? (
                <>
                  <p className="text-xl font-black uppercase tracking-[0.4em] text-cyan-300">
                    Welcome Back
                  </p>

               <div className="-mt-2 flex h-[280px] justify-center overflow-hidden rounded-xl bg-black">
                    <img
                      src={planImage}
                      alt="Membership Tier"
                     className="h-[900px] w-[1800px] -translate-y-[260px] scale-[1.05] object-cover"
                    />
                  </div>

                  <p className="mt-4 text-2xl font-black uppercase tracking-[0.35em] text-cyan-300">
                    {nowEntering.license_plate || "No Plate"}
                  </p>

                  <h2 className="mt-1 text-9xl font-black leading-none text-white drop-shadow-[0_0_25px_rgba(34,211,238,0.7)]">
                    {nowEntering.first_name || "Member"}
                  </h2>

                  <div className="mx-auto mt-4 h-[3px] max-w-2xl rounded-full bg-cyan-400 shadow-[0_0_25px_#22d3ee]" />

                  <p className={`mt-5 text-6xl font-black ${planColor}`}>
                    {nowEntering.membership_plan || "Membership"}
                  </p>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
                      <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">
                        Braxy Bucks
                      </p>
                      <p className="mt-2 text-6xl font-black text-white">
                        {nowEntering.rewards_points || 0}
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
                      <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">
                        Lifetime Washes
                      </p>
                      <p className="mt-2 text-6xl font-black text-white">
                        {nowEntering.lifetime_washes || 0}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xl font-black uppercase tracking-[0.4em] text-cyan-300">
                    Welcome Back
                  </p>

                  <div className="-mt-4 flex h-[360px] justify-center overflow-hidden rounded-xl bg-black">
                    <img
                      src="/dragon-tunnel.png"
                      alt="Dragon tunnel welcome"
                      className="h-[1200px] w-[2200px] -translate-y-[360px] scale-[1.2] object-cover"
                    />
                  </div>

                  <h2 className="-mt-6 text-9xl font-black text-yellow-300 drop-shadow-[0_0_25px_rgba(253,224,71,0.8)]">
                    READY
                  </h2>

                  <p className="mt-3 text-3xl font-bold text-white/80">
                    Awaiting Next Vehicle
                  </p>
                </>
              )}
            </section>

            <section className="grid gap-4 md:grid-cols-5">
              <Stat title="Waiting" value={waiting.length} />
              <Stat title="In Tunnel" value={inTunnel.length} />
              <Stat title="Washed Today" value={washes.length} />
              <Stat title="Completed" value={completed.length} />
              <Stat title="Rejected" value={rejected.length} />
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-6">
                <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">
                  Next Up
                </p>

                <h3 className="mt-3 text-5xl font-black text-cyan-300">
                  {nextUp?.license_plate || "—"}
                </h3>

                <p className="mt-3 text-xl font-bold text-slate-300">
                  {nextUp
                    ? "Prepare vehicle for tunnel entry"
                    : "No vehicle waiting"}
                </p>
              </div>

              <div
                className={`rounded-3xl p-6 text-slate-950 ${
                  inTunnel.length > 0 ? "bg-cyan-300" : "bg-green-400"
                }`}
              >
                <p className="text-sm font-black uppercase tracking-[0.35em]">
                  Tunnel Status
                </p>

                <h3 className="mt-3 text-5xl font-black">
                  {inTunnel.length > 0 ? "RUNNING" : "READY"}
                </h3>

                <p className="mt-3 text-xl font-bold">
                  Realtime sync active
                </p>
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
    <div className="rounded-2xl bg-white/10 p-5 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-4xl font-black text-cyan-300">
        {value}
      </p>
    </div>
  )
}