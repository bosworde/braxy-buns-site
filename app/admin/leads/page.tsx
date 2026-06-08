"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Lead = {
  id: string
  created_at: string
  name: string | null
  email: string | null
  phone: string | null
  source: string | null
  status: string | null
  notes: string | null
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadLeads()
  }, [])

  async function loadLeads() {
    setLoading(true)

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setLeads(data || [])
    }

    setLoading(false)
  }

  async function updateLead(id: string, updates: Partial<Lead>) {
    setSavingId(id)
    setMessage("")

    const { error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Lead updated.")
      await loadLeads()
    }

    setSavingId(null)
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Braxy Buns Admin
            </p>
            <h1 className="mt-2 text-4xl font-bold">Founding Member CRM</h1>
            <p className="mt-2 text-slate-400">
              Track founding members, investor inquiries, careers interest, and website leads.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Dashboard
            </Link>
            <button
              onClick={loadLeads}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Refresh
            </button>
          </div>
        </div>

        {message && (
          <p className="rounded-xl bg-white/10 p-4 font-semibold text-cyan-300">
            {message}
          </p>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard title="Total Leads" value={leads.length} />
          <StatCard title="New" value={leads.filter((l) => l.status === "New").length} />
          <StatCard title="Interested" value={leads.filter((l) => l.status === "Interested").length} />
          <StatCard title="Converted" value={leads.filter((l) => l.status === "Converted").length} />
        </section>

        <section className="rounded-2xl bg-white/10 p-6">
          <h2 className="text-2xl font-bold">Lead Pipeline</h2>

          {loading ? (
            <p className="mt-4 text-slate-400">Loading leads...</p>
          ) : leads.length === 0 ? (
            <p className="mt-4 text-slate-400">No leads yet.</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-4">Date</th>
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Notes</th>
                    <th className="py-3 pr-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-white/10 align-top">
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>

                      <td className="py-3 pr-4">
                        <EditableInput
                          value={lead.name || ""}
                          onSave={(value) => updateLead(lead.id, { name: value })}
                        />
                      </td>

                      <td className="py-3 pr-4">
                        <EditableInput
                          value={lead.email || ""}
                          onSave={(value) => updateLead(lead.id, { email: value })}
                        />
                      </td>

                      <td className="py-3 pr-4">
                        <EditableInput
                          value={lead.phone || ""}
                          onSave={(value) => updateLead(lead.id, { phone: value })}
                        />
                      </td>

                      <td className="py-3 pr-4">
                        <EditableInput
                          value={lead.source || ""}
                          onSave={(value) => updateLead(lead.id, { source: value })}
                        />
                      </td>

                      <td className="py-3 pr-4">
                        <select
                          className="rounded-lg bg-white p-2 text-slate-950"
                          value={lead.status || "New"}
                          onChange={(e) =>
                            updateLead(lead.id, { status: e.target.value })
                          }
                        >
                          <option>New</option>
                          <option>Contacted</option>
                          <option>Interested</option>
                          <option>Converted</option>
                          <option>Investor</option>
                          <option>Do Not Contact</option>
                        </select>
                      </td>

                      <td className="py-3 pr-4 min-w-[260px]">
                        <EditableTextarea
                          value={lead.notes || ""}
                          onSave={(value) => updateLead(lead.id, { notes: value })}
                        />
                      </td>

                      <td className="py-3 pr-4">
                        {savingId === lead.id ? (
                          <span className="text-cyan-300">Saving...</span>
                        ) : (
                          <span className="text-slate-500">Auto-save</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function EditableInput({
  value,
  onSave,
}: {
  value: string
  onSave: (value: string) => void
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <input
      className="w-full min-w-[150px] rounded-lg bg-slate-900 p-2 text-white"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onSave(localValue)}
    />
  )
}

function EditableTextarea({
  value,
  onSave,
}: {
  value: string
  onSave: (value: string) => void
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  return (
    <textarea
      className="min-h-20 w-full rounded-lg bg-slate-900 p-2 text-white"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={() => onSave(localValue)}
    />
  )
}

function StatCard({
  title,
  value,
}: {
  title: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-bold text-cyan-300">{value}</p>
    </div>
  )
}