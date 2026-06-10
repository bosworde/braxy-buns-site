"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type QueueStatus = "waiting" | "in_tunnel" | "completed" | "rejected"

type QueueItem = {
  id: string
  created_at: string
  wash_visit_id: string | null
  license_plate: string | null
  status: QueueStatus | string | null
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

 useEffect(() => {
  loadQueue()

  const channel = supabase
    .channel("tunnel_queue_realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tunnel_queue",
      },
      () => {
        loadQueue(false)
      }
    )
    .subscribe()

  const interval = setInterval(() => {
    loadQueue(false)
  }, 15000)

  return () => {
    supabase.removeChannel(channel)
    clearInterval(interval)
  }
}, [])

  async function loadQueue(showLoading = true) {
    if (showLoading) setLoading(true)

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const { data, error } = await supabase
      .from("tunnel_queue")
      .select("*")
      .gte("created_at", todayStart.toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setQueue(data || [])
    }

    setLoading(false)
  }

  async function updateStatus(id: string, status: QueueStatus) {
    setMessage("")

    const { error } = await supabase
      .from("tunnel_queue")
      .update({ status })
      .eq("id", id)

    if (error) {
      setMessage(error.message)
      return
    }

    setQueue((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    )
  }

  const waiting = queue.filter((item) => item.status === "waiting").length
  const inTunnel = queue.filter((item) => item.status === "in_tunnel").length
  const completed = queue.filter((item) => item.status === "completed").length
  const rejected = queue.filter((item) => item.status === "rejected").length

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Tunnel Queue Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Live queue sync for LPR, Operations, Tunnel Screen, and Customer Screen.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Admin Home
            </Link>

            <Link href="/admin/command" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Command Center
            </Link>

            <Link href="/admin/lpr" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Manual LPR
            </Link>

            <Link href="/admin/operations" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Operations
            </Link>

            <Link href="/admin/tunnel-screen" className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950">
              Tunnel Screen
            </Link>

            <button
              onClick={() => loadQueue()}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Refresh
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-xl bg-red-500/20 p-4 font-bold text-red-200">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white/10 p-8">
            Loading Queue...
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Stat title="Waiting" value={waiting} />
              <Stat title="In Tunnel" value={inTunnel} />
              <Stat title="Completed" value={completed} />
              <Stat title="Rejected" value={rejected} />
            </section>

            <section className="grid gap-6 lg:grid-cols-4">
              <QueueColumn
                title="Waiting"
                status="waiting"
                queue={queue}
                updateStatus={updateStatus}
              />

              <QueueColumn
                title="In Tunnel"
                status="in_tunnel"
                queue={queue}
                updateStatus={updateStatus}
              />

              <QueueColumn
                title="Completed"
                status="completed"
                queue={queue}
                updateStatus={updateStatus}
              />

              <QueueColumn
                title="Rejected"
                status="rejected"
                queue={queue}
                updateStatus={updateStatus}
              />
            </section>
          </>
        )}
      </div>
    </main>
  )
}

function QueueColumn({
  title,
  status,
  queue,
  updateStatus,
}: {
  title: string
  status: QueueStatus
  queue: QueueItem[]
  updateStatus: (id: string, status: QueueStatus) => void
}) {
  const items = queue.filter((item) => item.status === status)

  return (
    <div className="rounded-3xl bg-white/10 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-black">{title}</h2>

        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-cyan-300">
          {items.length}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No cars.</p>
        ) : (
          items.map((item, index) => (
            <QueueCard
              key={item.id}
              position={index + 1}
              item={item}
              updateStatus={updateStatus}
            />
          ))
        )}
      </div>
    </div>
  )
}

function QueueCard({
  position,
  item,
  updateStatus,
}: {
  position: number
  item: QueueItem
  updateStatus: (id: string, status: QueueStatus) => void
}) {
  return (
    <div className="rounded-2xl bg-slate-950/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Car #{position}
        </p>

        <StatusBadge status={(item.status || "waiting") as string} />
      </div>

      <p className="mt-2 text-2xl font-black text-cyan-300">
        {item.license_plate || "No Plate"}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {new Date(item.created_at).toLocaleTimeString()}
      </p>

      <div className="mt-4 grid gap-2">
        <button
          onClick={() => updateStatus(item.id, "waiting")}
          className="rounded-lg bg-yellow-300 px-3 py-2 text-sm font-black text-slate-950"
        >
          Move To Waiting
        </button>

        <button
          onClick={() => updateStatus(item.id, "in_tunnel")}
          className="rounded-lg bg-blue-400 px-3 py-2 text-sm font-black text-slate-950"
        >
          Move To Tunnel
        </button>

        <button
          onClick={() => updateStatus(item.id, "completed")}
          className="rounded-lg bg-green-400 px-3 py-2 text-sm font-black text-slate-950"
        >
          Complete Wash
        </button>

        <button
          onClick={() => updateStatus(item.id, "rejected")}
          className="rounded-lg bg-red-400 px-3 py-2 text-sm font-black text-slate-950"
        >
          Reject
        </button>
      </div>
    </div>
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