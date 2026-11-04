"use client"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
type Registration = { auth_user_id: string; email: string; first_name: string; last_name: string; preferred_plan: string; vehicle_make: string; vehicle_model: string; vehicle_color: string; license_plate: string; created_at: string }
export default function PreopeningRegistrations() {
  const [rows, setRows] = useState<Registration[]>([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState("")
  const refresh = useCallback(async () => {
    setBusy(true); setError("")
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Please sign in again.")
      const response = await fetch(`/api/admin/preopening?page=${page}`, { cache: "no-store", headers: { Authorization: `Bearer ${session.access_token}` } })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Couldn’t load registrations.")
      setRows(data.registrations); setCount(data.count)
    } catch (error) { setRows([]); setError(error instanceof Error ? error.message : "Couldn’t load registrations.") }
    finally { setBusy(false) }
  }, [page])
  useEffect(() => { void refresh() }, [refresh])
  return <main className="min-h-screen bg-slate-950 px-6 py-10 text-white"><div className="mx-auto max-w-7xl space-y-6"><Link href="/admin" className="text-cyan-300 underline">← Operations dashboard</Link><h1 className="text-3xl font-bold">Pre-opening registrations</h1><p className="text-slate-300">{error ? "Registration count unavailable" : `${count} free registrations`}. These are plan preferences, with no active subscription or wash access.</p><button onClick={() => void refresh()} disabled={busy} className="rounded-lg border border-white/30 px-4 py-3 disabled:opacity-50">{busy ? "Loading…" : "Refresh registrations"}</button>{error && <p role="alert" className="text-amber-200">{error}</p>}<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-white/20">{["Name", "Email", "Preferred club", "Vehicle", "Plate", "Registered"].map(title => <th key={title} className="p-3">{title}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.auth_user_id} className="border-b border-white/10"><td className="p-3">{row.first_name} {row.last_name}</td><td className="p-3">{row.email}</td><td className="p-3">{row.preferred_plan}</td><td className="p-3">{[row.vehicle_color, row.vehicle_make, row.vehicle_model].filter(Boolean).join(" ") || "Not added"}</td><td className="p-3">{row.license_plate || "Not added"}</td><td className="p-3">{new Date(row.created_at).toLocaleDateString("en-US", { timeZone: "America/Chicago" })}</td></tr>)}</tbody></table></div>{!busy && !error && !rows.length && <p>No registrations on this page yet.</p>}<div className="flex items-center gap-4"><button disabled={busy || page === 0} onClick={() => setPage(p => p - 1)} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40">Previous</button><span>Page {page + 1}</span><button disabled={busy || (page + 1) * 100 >= count} onClick={() => setPage(p => p + 1)} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40">Next</button></div></div></main>
}
