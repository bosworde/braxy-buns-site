"use client"

import Image from "next/image"
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
      ? "/dragon.png"
      : nowEntering?.membership_plan === "Iguana Wash Club"
      ? "/iguana.png"
      : nowEntering?.membership_plan === "Gecko Wash Club"
      ? "/gecko.png"
      : "/dragon.png"

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
 <section className="rounded-[2rem] border border-cyan-400/30 bg-white/10 px-10 py-6 text-center overflow-hidden">
  <p className="text-xl font-black uppercase tracking-[0.4em] text-cyan-300">
    Welcome Back
  </p>

<div className="-mt-28 flex h-[330px] justify-center overflow-hidden">
  <Image
    src={planImage}
    alt="Membership Tier"
    width={900}
    height={450}
    className="h-[520px] w-[1000px] scale-125 object-contain drop-shadow-2xl"
    priority
  />
</div>

  {nowEntering ? (
    <>
      <p className="-mt-4 text-2xl font-black uppercase tracking-[0.35em] text-cyan-300">
        {nowEntering.license_plate || "No Plate"}
      </p>

      <h2 className="mt-2 text-8xl font-black leading-none text-white">
        {nowEntering.first_name || "Member"}
      </h2>

      <div className="mx-auto mt-4 h-[3px] max-w-xl rounded-full bg-cyan-400 shadow-[0_0_25px_#22d3ee]" />

      <p className="mt-5 text-5xl font-black text-cyan-300">
        {nowEntering.membership_plan || "Membership"}
      </p>

      <div className="mt-8 flex justify-center gap-20 text-2xl">
        <div>
          <p className="text-slate-400">Braxy Bucks</p>
          <p className="text-5xl font-black text-white">
            {nowEntering.rewards_points || 0}
          </p>
        </div>

        <div className="border-l border-white/30 pl-20">
          <p className="text-slate-400">Lifetime Washes</p>
          <p className="text-5xl font-black text-white">
            {nowEntering.lifetime_washes || 0}
          </p>
        </div>
      </div>
    </>
  ) : (
    <>
      <div className="-mt-10 flex justify-center">
        <Image
          src="/dragon.png"
          alt="Dragon"
          width={900}
          height={450}
          className="h-[420px] w-[900px] object-contain opacity-80"
          priority
        />
      </div>

      <h2 className="-mt-6 text-7xl font-black text-yellow-300">
        READY
      </h2>

      <p className="mt-3 text-3xl font-bold text-white/80">
        No car currently in tunnel
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
                  {nextUp ? "Prepare vehicle for tunnel entry" : "No vehicle waiting"}
                </p>
              </div>

              <div className="rounded-3xl bg-green-400 p-6 text-slate-950">
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