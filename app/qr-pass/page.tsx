"use client"

import { useEffect, useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import BottomNav from "@/components/BottomNav"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  membership_plan: string | null
  vehicle_make: string | null
  vehicle_model: string | null
  vehicle_color: string | null
  license_plate: string | null
}

export default function QRPassPage() {
  const [member, setMember] = useState<Member | null>(null)

  useEffect(() => {
    async function loadMember() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user?.email) return

      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      if (data) {
        setMember(data)
      }
    }

    loadMember()
  }, [])

  const isActive =
    member?.membership_plan &&
    member.membership_plan !== "Prospect"

  // SECURE QR VALUE
  const qrValue = member?.id || ""

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 pb-28">
      <div className="mx-auto max-w-md rounded-2xl bg-white/10 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Braxy Buns Wash Club
        </p>

        <h1 className="mt-4 text-3xl font-bold">
          Member QR Pass
        </h1>

        <p className="mt-3 text-slate-300">
          {member?.first_name || "Member"}{" "}
          {member?.last_name || ""}
        </p>

        <p className="mt-1 font-semibold text-cyan-300">
          {member?.membership_plan || "Loading..."}
        </p>

        <div className="mt-8 rounded-2xl bg-white p-6">
          {member ? (
            <QRCodeCanvas
              value={qrValue}
              size={240}
            />
          ) : (
            <p className="text-slate-950">
              Loading QR Pass...
            </p>
          )}
        </div>

        {/* TEMP DEBUG BOX */}
        <textarea
          readOnly
          className="mt-6 h-24 w-full rounded-xl bg-white p-3 text-xs text-slate-950"
          value={qrValue}
        />

        <div className="mt-6 rounded-xl bg-slate-900 p-4 text-left">
          <p className="text-sm text-slate-400">
            Vehicle
          </p>

          <p className="font-semibold">
            {member?.vehicle_color || ""}{" "}
            {member?.vehicle_make || ""}{" "}
            {member?.vehicle_model || ""}
          </p>

          <p className="mt-3 text-sm text-slate-400">
            License Plate
          </p>

          <p className="font-semibold">
            {member?.license_plate || "Not added"}
          </p>
        </div>

        <p className="mt-6 text-lg font-bold">
          Status: {isActive ? "Active" : "Inactive"}
        </p>
      </div>

      <BottomNav />
    </main>
  )
}