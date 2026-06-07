"use client"

import { useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import BottomNav from "@/components/BottomNav"
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

export default function QRPassPage() {
  const [search, setSearch] = useState("")
  const [member, setMember] = useState<Member | null>(null)
  const [message, setMessage] = useState("")

  async function findMember() {
    setMessage("")
    setMember(null)

    const cleanSearch = search.trim()

    if (!cleanSearch) {
      setMessage("Enter your email or license plate.")
      return
    }

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .or(
        `email.ilike.${cleanSearch.toLowerCase()},license_plate.ilike.${cleanSearch.toUpperCase()}`
      )
      .maybeSingle()

    if (error) {
      setMessage(error.message)
      return
    }

    if (!data) {
      setMessage("No membership found. Please check your email or plate.")
      return
    }

    setMember(data)
  }

  const isActive = member?.membership_status === "active"

  const qrValue = member?.id || ""

  const fullName = member
    ? `${member.first_name || ""} ${member.last_name || ""}`.trim()
    : ""

  const vehicle = member
    ? `${member.vehicle_color || ""} ${member.vehicle_make || ""} ${
        member.vehicle_model || ""
      }`.trim()
    : ""

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 pb-28 text-white">
      <div className="mx-auto max-w-md rounded-2xl bg-white/10 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Braxy Buns Wash Club
        </p>

        <h1 className="mt-4 text-3xl font-bold">Member QR Pass</h1>

        <p className="mt-3 text-slate-300">
          Enter your email or license plate to pull up your pass.
        </p>

        <div className="mt-6 flex gap-2">
          <input
            className="w-full rounded-xl bg-white p-3 text-slate-950"
            placeholder="Email or license plate"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={findMember}
            className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
          >
            Find
          </button>
        </div>

        {message && (
          <p className="mt-4 font-semibold text-cyan-300">{message}</p>
        )}

        {member && (
          <>
            <p className="mt-6 text-slate-300">{fullName || "Member"}</p>

            <p className="mt-1 font-semibold text-cyan-300">
              {member.membership_plan || "Prospect"}
            </p>

            <div className="mt-8 rounded-2xl bg-white p-6">
              <QRCodeCanvas value={qrValue} size={240} />
            </div>

            <div className="mt-6 rounded-xl bg-slate-900 p-4 text-left">
              <p className="text-sm text-slate-400">Vehicle</p>
              <p className="font-semibold">{vehicle || "Not added"}</p>

              <p className="mt-3 text-sm text-slate-400">License Plate</p>
              <p className="font-semibold">
                {member.license_plate || "Not added"}
              </p>

              <p className="mt-3 text-sm text-slate-400">Braxy Bucks</p>
              <p className="font-semibold">{member.rewards_points || 0}</p>

              <p className="mt-3 text-sm text-slate-400">Lifetime Washes</p>
              <p className="font-semibold">{member.lifetime_washes || 0}</p>
            </div>

            <p className="mt-6 text-lg font-bold">
              Status: {isActive ? "Active" : "Inactive"}
            </p>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  )
}