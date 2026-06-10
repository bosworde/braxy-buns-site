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
  follow_up_date: string | null
}

const statuses = ["New Lead", "Contacted", "Interested", "Joined", "Converted", "Lost"]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [source, setSource] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    loadLeads()
  }, [])

  async function loadLeads() {
    setLoading(true)

    const { data } = await supabase
      .from("founding_member_leads")
      .select("*")
      .order("created_at", { ascending: false })

    setLeads(data || [])
    setLoading(false)
  }

  async function addLead() {
    if (!name.trim() && !email.trim() && !phone.trim()) return

    await supabase.from("founding_member_leads").insert({
      name,
      email,
      phone,
      source,
      notes,
      status: "New Lead",
    })

    setName("")
    setEmail("")
    setPhone("")
    setSource("")
    setNotes("")

    loadLeads()
  }

  async function updateLead(id: string, updates: Partial<Lead>) {
    await supabase.from("founding_member_leads").update(updates).eq("id", id)

    setLeads((current) =>
      current.map((lead) =>
        lead.id === id ? { ...lead, ...updates } : lead
      )
    )
  }

  async function convertToMember(lead: Lead) {
    if (!lead.email) {
      alert("This lead needs an email before converting to member.")
      return
    }

    const confirmed = window.confirm(`Convert ${lead.name || lead.email} to member?`)
    if (!confirmed) return

    const nameParts = (lead.name || "").trim().split(" ")
    const firstName = nameParts[0] || null
    const lastName = nameParts.slice(1).join(" ") || null

    const { error } = await supabase.from("members").insert({
      email: lead.email.trim().toLowerCase(),
      first_name: firstName,
      last_name: lastName,
     
      membership_plan: "Founding Member",
      membership_status: "Active",
      rewards_points: 0,
      lifetime_washes: 0,
    })

    if (error) {
      alert(error.message)
      return
    }

    await updateLead(lead.id, { status: "Converted" })
    alert("Lead converted to member.")
  }

  async function deleteLead(id: string) {
    const confirmed = window.confirm("Delete this lead?")
    if (!confirmed) return

    await supabase.from("founding_member_leads").delete().eq("id", id)

    setLeads((current) => current.filter((lead) => lead.id !== id))
  }

  const newLeads = leads.filter((lead) => lead.status === "New Lead").length
  const interested = leads.filter((lead) => lead.status === "Interested").length
  const joined = leads.filter((lead) => lead.status === "Joined").length
  const converted = leads.filter((lead) => lead.status === "Converted").length

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Founding Member CRM
            </h1>

            <p className="mt-2 text-slate-400">
              Track founding member leads, follow-ups, and conversion to paid memberships.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Admin Home
            </Link>

            <Link href="/admin/command" className="rounded-xl bg-yellow-300 px-5 py-3 font-bold text-slate-950">
              Command Center
            </Link>

            <button
              onClick={loadLeads}
              className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
            >
              Refresh
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <Stat title="Total Leads" value={leads.length} />
          <Stat title="New Leads" value={newLeads} />
          <Stat title="Interested" value={interested} />
          <Stat title="Converted" value={converted || joined} />
        </section>

        <section className="rounded-3xl bg-white/10 p-6">
          <h2 className="text-2xl font-black">Add Lead</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-xl bg-slate-900 px-4 py-3 outline-none" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="rounded-xl bg-slate-900 px-4 py-3 outline-none" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-xl bg-slate-900 px-4 py-3 outline-none" />
            <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source" className="rounded-xl bg-slate-900 px-4 py-3 outline-none" />
          </div>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 outline-none"
          />

          <button
            onClick={addLead}
            className="mt-4 rounded-xl bg-cyan-400 px-6 py-3 font-black text-slate-950"
          >
            Add Lead
          </button>
        </section>

        <section className="rounded-3xl bg-white/10 p-6">
          <h2 className="text-2xl font-black">Lead Pipeline</h2>

          {loading ? (
            <p className="mt-5 text-slate-400">Loading leads...</p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Follow Up</th>
                    <th className="py-3 pr-4">Notes</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td className="py-6 text-slate-400" colSpan={8}>
                        No leads yet.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-white/10">
                        <td className="py-3 pr-4">{lead.name || "—"}</td>
                        <td className="py-3 pr-4">{lead.email || "—"}</td>
                        <td className="py-3 pr-4">{lead.phone || "—"}</td>
                        <td className="py-3 pr-4">{lead.source || "—"}</td>

                        <td className="py-3 pr-4">
                          <select
                            value={lead.status || "New Lead"}
                            onChange={(e) =>
                              updateLead(lead.id, { status: e.target.value })
                            }
                            className="rounded-lg bg-slate-900 px-3 py-2"
                          >
                            {statuses.map((status) => (
                              <option key={status}>{status}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 pr-4">
                          <input
                            type="date"
                            value={lead.follow_up_date || ""}
                            onChange={(e) =>
                              updateLead(lead.id, { follow_up_date: e.target.value })
                            }
                            className="rounded-lg bg-slate-900 px-3 py-2"
                          />
                        </td>

                        <td className="py-3 pr-4">
                          <input
                            value={lead.notes || ""}
                            onChange={(e) =>
                              updateLead(lead.id, { notes: e.target.value })
                            }
                            className="min-w-[240px] rounded-lg bg-slate-900 px-3 py-2"
                          />
                        </td>

                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-2">
             {lead.status === "Converted" ? (
  <span className="rounded-lg bg-white/10 px-3 py-2 font-bold text-green-300">
    Converted
  </span>
) : (
  <button
    onClick={() => convertToMember(lead)}
    className="rounded-lg bg-green-400 px-3 py-2 font-bold text-slate-950"
  >
    Convert To Member
  </button>
)}             

                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="rounded-lg border border-red-400 px-3 py-2 font-bold text-red-300"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-black text-cyan-300">{value}</p>
    </div>
  )
}