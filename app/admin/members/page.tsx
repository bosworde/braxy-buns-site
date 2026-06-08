"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  created_at?: string | null
  first_name: string | null
  last_name: string | null
  email: string
  membership_plan: string | null
  membership_status: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  license_plate: string | null
  rewards_points: number | null
  lifetime_washes: number | null
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Member>>({})

  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    const q = search.trim().toLowerCase()

    if (!q) {
      setFilteredMembers(members)
      return
    }

    const results = members.filter((m) => {
      const fullName = `${m.first_name ?? ""} ${m.last_name ?? ""}`.toLowerCase()

      return (
        fullName.includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.license_plate?.toLowerCase().includes(q) ||
        m.membership_plan?.toLowerCase().includes(q) ||
        m.membership_status?.toLowerCase().includes(q)
      )
    })

    setFilteredMembers(results)
  }, [search, members])

  async function loadMembers() {
    setLoading(true)
    setMessage("")

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setMembers(data || [])
      setFilteredMembers(data || [])
    }

    setLoading(false)
  }

  function startEdit(member: Member) {
    setEditingId(member.id)
    setEditForm({
      first_name: member.first_name ?? "",
      last_name: member.last_name ?? "",
      email: member.email ?? "",
      membership_plan: member.membership_plan ?? "",
      membership_status: member.membership_status ?? "",
      vehicle_make: member.vehicle_make ?? "",
      vehicle_model: member.vehicle_model ?? "",
      vehicle_color: member.vehicle_color ?? "",
      license_plate: member.license_plate ?? "",
      rewards_points: member.rewards_points ?? 0,
      lifetime_washes: member.lifetime_washes ?? 0,
    })
    setMessage("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({})
    setMessage("")
  }

  function updateField(field: keyof Member, value: string) {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function saveMember(id: string) {
    setLoading(true)
    setMessage("")

    const cleanPlate = editForm.license_plate
      ? editForm.license_plate.trim().toUpperCase()
      : ""

    if (cleanPlate) {
      const { data: existingPlate, error: plateError } = await supabase
        .from("members")
        .select("id, first_name, last_name, email, license_plate")
        .eq("license_plate", cleanPlate)
        .neq("id", id)
        .maybeSingle()

      if (plateError) {
        setMessage(plateError.message)
        setLoading(false)
        return
      }

      if (existingPlate) {
        setMessage(
          `That license plate is already assigned to ${existingPlate.first_name ?? ""} ${
            existingPlate.last_name ?? ""
          } (${existingPlate.email}).`
        )
        setLoading(false)
        return
      }
    }

    const payload = {
      first_name: editForm.first_name?.toString().trim() || null,
      last_name: editForm.last_name?.toString().trim() || null,
      email: editForm.email?.toString().trim().toLowerCase() || "",
      membership_plan: editForm.membership_plan?.toString().trim() || null,
      membership_status: editForm.membership_status?.toString().trim() || null,
      vehicle_make: editForm.vehicle_make?.toString().trim() || null,
      vehicle_model: editForm.vehicle_model?.toString().trim() || null,
      vehicle_color: editForm.vehicle_color?.toString().trim() || null,
      license_plate: cleanPlate || null,
      rewards_points: Number(editForm.rewards_points ?? 0),
      lifetime_washes: Number(editForm.lifetime_washes ?? 0),
    }

    const { error } = await supabase
      .from("members")
      .update(payload)
      .eq("id", id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Member updated.")
      setEditingId(null)
      setEditForm({})
      await loadMembers()
    }

    setLoading(false)
  }

  async function deleteMember(id: string) {
    const ok = window.confirm("Delete this member?")
    if (!ok) return

    setLoading(true)
    setMessage("")

    const { error } = await supabase.from("members").delete().eq("id", id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Member deleted.")
      await loadMembers()
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
              Braxy Buns Admin
            </p>
            <h1 className="mt-2 text-3xl font-bold">Members</h1>
            <p className="mt-2 text-slate-300">
              Search, edit, and manage wash club members.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-900"
            >
              Back to Admin
            </Link>

            <Link
              href="/admin/add-member"
              className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-300"
            >
              Add Member
            </Link>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, plate, plan, or status..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />

          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
            <p>
              Showing {filteredMembers.length} of {members.length} members
            </p>

            <button
              onClick={loadMembers}
              disabled={loading}
              className="rounded-xl border border-slate-700 px-4 py-2 font-semibold hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            {message}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/70">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Plate</th>
                <th className="px-4 py-3">Points</th>
                <th className="px-4 py-3">Washes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.map((member) => {
                const isEditing = editingId === member.id

                return (
                  <tr key={member.id} className="border-b border-slate-800">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            value={editForm.first_name?.toString() ?? ""}
                            onChange={(e) =>
                              updateField("first_name", e.target.value)
                            }
                            placeholder="First"
                            className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                          />
                          <input
                            value={editForm.last_name?.toString() ?? ""}
                            onChange={(e) =>
                              updateField("last_name", e.target.value)
                            }
                            placeholder="Last"
                            className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                          />
                        </div>
                      ) : (
                        <span className="font-semibold">
                          {member.first_name || member.last_name
                            ? `${member.first_name ?? ""} ${
                                member.last_name ?? ""
                              }`
                            : "—"}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editForm.email?.toString() ?? ""}
                          onChange={(e) => updateField("email", e.target.value)}
                          className="w-56 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                        />
                      ) : (
                        member.email
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editForm.membership_plan?.toString() ?? ""}
                          onChange={(e) =>
                            updateField("membership_plan", e.target.value)
                          }
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                        >
                          <option value="">None</option>
                          <option value="Basic">Basic</option>
                          <option value="Plus">Plus</option>
                          <option value="Max">Max</option>
                          <option value="Basic Wash Club">
                            Basic Wash Club
                          </option>
                          <option value="Plus Wash Club">Plus Wash Club</option>
                          <option value="Max Shine Club">Max Shine Club</option>
                        </select>
                      ) : (
                        member.membership_plan || "—"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editForm.membership_status?.toString() ?? ""}
                          onChange={(e) =>
                            updateField("membership_status", e.target.value)
                          }
                          className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                        >
                          <option value="">None</option>
                          <option value="active">active</option>
                          <option value="inactive">inactive</option>
                          <option value="canceled">canceled</option>
                          <option value="past_due">past_due</option>
                        </select>
                      ) : (
                        member.membership_status || "—"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            value={editForm.vehicle_make?.toString() ?? ""}
                            onChange={(e) =>
                              updateField("vehicle_make", e.target.value)
                            }
                            placeholder="Make"
                            className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                          />
                          <input
                            value={editForm.vehicle_model?.toString() ?? ""}
                            onChange={(e) =>
                              updateField("vehicle_model", e.target.value)
                            }
                            placeholder="Model"
                            className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                          />
                          <input
                            value={editForm.vehicle_color?.toString() ?? ""}
                            onChange={(e) =>
                              updateField("vehicle_color", e.target.value)
                            }
                            placeholder="Color"
                            className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                          />
                        </div>
                      ) : (
                        `${member.vehicle_color ?? ""} ${
                          member.vehicle_make ?? ""
                        } ${member.vehicle_model ?? ""}`.trim() || "—"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editForm.license_plate?.toString() ?? ""}
                          onChange={(e) =>
                            updateField("license_plate", e.target.value)
                          }
                          className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 uppercase text-white"
                        />
                      ) : (
                        member.license_plate || "—"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.rewards_points?.toString() ?? "0"}
                          onChange={(e) =>
                            updateField("rewards_points", e.target.value)
                          }
                          className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                        />
                      ) : (
                        member.rewards_points ?? 0
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editForm.lifetime_washes?.toString() ?? "0"}
                          onChange={(e) =>
                            updateField("lifetime_washes", e.target.value)
                          }
                          className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-white"
                        />
                      ) : (
                        member.lifetime_washes ?? 0
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveMember(member.id)}
                            disabled={loading}
                            className="rounded-lg bg-cyan-400 px-3 py-2 font-bold text-slate-950 hover:bg-cyan-300 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-lg border border-slate-700 px-3 py-2 font-semibold text-slate-200 hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(member)}
                            className="rounded-lg border border-cyan-500/50 px-3 py-2 font-semibold text-cyan-200 hover:bg-cyan-500/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteMember(member.id)}
                            className="rounded-lg border border-red-500/50 px-3 py-2 font-semibold text-red-200 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}

              {!loading && filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}