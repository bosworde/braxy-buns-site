"use client"

import { useState } from "react"
import Link from "next/link"
import { QRCodeCanvas } from "qrcode.react"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  membership_plan: string | null
  membership_status: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  license_plate: string | null
  rewards_points: number | null
  lifetime_washes: number | null
}

export default function AdminQrPassPage() {
  const [search, setSearch] = useState("")
  const [member, setMember] = useState<Member | null>(null)
  const [message, setMessage] = useState("")

  async function findMember() {
    setMessage("")
    setMember(null)

    const cleanSearch = search.trim()

    if (!cleanSearch) {
      setMessage("Enter a license plate or email.")
      return
    }

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .or(
        `license_plate.ilike.${cleanSearch.toUpperCase()},email.ilike.${cleanSearch.toLowerCase()}`
      )
      .maybeSingle()

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data) {
      setMessage("No member found.")
      return
    }

    setMember(data)
  }

  const fullName = member
    ? `${member.first_name || ""} ${member.last_name || ""}`.trim()
    : ""

  const vehicle = member
    ? `${member.vehicle_color || ""} ${member.vehicle_make || ""} ${
        member.vehicle_model || ""
      }`.trim()
    : ""

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-4xl font-bold">Member QR Pass</h1>

      <p className="mt-4 text-slate-300">
        Search a member and generate a scannable Braxy Buns QR pass.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold"
        >
          Dashboard
        </Link>

        <Link
          href="/admin/members"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold"
        >
          Members
        </Link>

        <Link
          href="/admin/add-member"
          className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          Add Member
        </Link>

        <Link
          href="/admin/checkin"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold"
        >
          QR Check-In
        </Link>
      </div>

      <div className="mt-8 flex max-w-2xl gap-3">
        <input
          className="w-full rounded-xl bg-white p-3 text-slate-950"
          placeholder="Search by plate or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={findMember}
          className="rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
        >
          Find
        </button>
      </div>

      {message && <p className="mt-6 font-semibold text-cyan-300">{message}</p>}

      {member && (
        <section className="mt-8 max-w-md rounded-3xl bg-white p-6 text-slate-950">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">
            Braxy Buns
          </p>

          <h2 className="mt-2 text-3xl font-bold">{fullName || "Member"}</h2>

          <p className="mt-1 font-semibold text-cyan-700">
            {member.membership_plan || "Prospect"}
          </p>

          <div className="mt-6 flex justify-center">
            <QRCodeCanvas value={member.id} size={220} />
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <p>
              <span className="font-bold">Status:</span>{" "}
              {member.membership_status || "inactive"}
            </p>

            <p>
              <span className="font-bold">Plate:</span>{" "}
              {member.license_plate || "Not added"}
            </p>

            <p>
              <span className="font-bold">Vehicle:</span>{" "}
              {vehicle || "Not added"}
            </p>

            <p>
              <span className="font-bold">Braxy Bucks:</span>{" "}
              {member.rewards_points || 0}
            </p>

            <p>
              <span className="font-bold">Lifetime Washes:</span>{" "}
              {member.lifetime_washes || 0}
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Show this pass at check-in.
          </p>
        </section>
      )}
    </main>
  )
}