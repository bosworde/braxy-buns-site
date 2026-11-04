"use client"
import { useCallback, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
type Alert = { id: string; kind: string; resource_id: string | null; customer_id: string | null; subscription_ids: string[]; message: string; created_at: string }
export default function BillingAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const request = useCallback(async (method = "GET", id?: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Sign in again to view billing alerts.")
    const response = await fetch("/api/admin/alerts", { method, cache: "no-store", headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" }, ...(id ? { body: JSON.stringify({ id }) } : {}) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Alerts unavailable")
    return data
  }, [])
  const refresh = useCallback(async () => {
    setBusy(true)
    try { const data = await request(); setAlerts(data.alerts); setError("") }
    catch (error) { setError(error instanceof Error ? error.message : "Alerts unavailable") }
    finally { setBusy(false) }
  }, [request])
  useEffect(() => { void refresh(); const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh() }, 60000); return () => window.clearInterval(timer) }, [refresh])
  async function resolve(id: string) {
    setBusy(true)
    try { await request("PATCH", id); await refresh() }
    catch (error) { setError(error instanceof Error ? error.message : "Could not update alert") }
    finally { setBusy(false) }
  }
  return <section className="border-b border-amber-300/30 bg-slate-950 px-6 py-4 text-white" aria-label="Billing review alerts">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold">Billing review: {alerts.length} open alerts</h2><button disabled={busy} onClick={() => void refresh()} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-50">{busy ? "Checking…" : "Refresh alerts"}</button></div>
    {error && <p role="alert" className="mt-3 text-amber-200">{error}</p>}
    {alerts.length > 0 && <p className="mt-2 text-sm text-slate-300">Review these in Stripe before marking them reviewed. This does not refund, cancel, or change access automatically.</p>}
    {alerts.map(alert => <article key={alert.id} className="mt-3 rounded-lg border border-amber-300/30 p-4"><h3 className="font-bold">{alert.kind}</h3><p>{alert.message}</p><p className="mt-2 break-all text-sm text-slate-300">{alert.resource_id} · {alert.customer_id} {alert.subscription_ids.join(", ")}</p><button disabled={busy} onClick={() => void resolve(alert.id)} className="mt-3 rounded-lg bg-white/10 px-4 py-2 disabled:opacity-50">Mark reviewed</button></article>)}
  </section>
}
