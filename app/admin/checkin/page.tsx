"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { supabase } from "@/lib/supabase"

type QRMember = {
  memberId: string
  email: string
  name: string
  plan: string
  vehicle: string
  plate: string
  status: string
}

export default function AdminCheckInPage() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const [qrText, setQrText] = useState("")
  const [member, setMember] = useState<QRMember | null>(null)
  const [message, setMessage] = useState("")

  async function verifyText(text: string) {
    const cleanText = text.trim()
    const plateText = cleanText.toLowerCase()

    setQrText(cleanText)
    setMessage("")
    setMember(null)

    if (!cleanText) {
      setMessage("Enter a QR code value or license plate.")
      return
    }

    let memberData = null

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        cleanText
      )

    if (isUuid) {
      const { data } = await supabase
        .from("members")
        .select("*")
        .eq("id", cleanText)
        .maybeSingle()

      memberData = data
    }

    if (!memberData) {
      const { data } = await supabase
        .from("members")
        .select("*")
        .ilike("license_plate", plateText)
        .maybeSingle()

      memberData = data
    }

    if (!memberData) {
      setMessage("Member not found.")
      return
    }

    const fullName = `${memberData.first_name || ""} ${
      memberData.last_name || ""
    }`.trim()

    const vehicle = `${memberData.vehicle_color || ""} ${
      memberData.vehicle_make || ""
    } ${memberData.vehicle_model || ""}`.trim()

    setMember({
      memberId: memberData.id,
      email: memberData.email,
      name: fullName,
      plan: memberData.membership_plan || "Prospect",
      vehicle,
      plate: memberData.license_plate || "",
      status: memberData.membership_status || "inactive",
    })

    setMessage("")
  }

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      false
    )

    scanner.render(
      (decodedText) => {
        verifyText(decodedText)
        scanner.clear()
      },
      () => {}
    )

    scannerRef.current = scanner

    return () => {
      scannerRef.current?.clear().catch(() => {})
    }
  }, [])

  async function checkInWash() {
    if (!member) return

    if (member.status !== "active") {
      setMessage(`Membership status is ${member.status}. Check-in not allowed.`)
      return
    }

    setMessage("")

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const { data: existingVisit } = await supabase
      .from("wash_visits")
      .select("*")
      .eq("member_id", member.memberId)
      .gte("created_at", startOfToday.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingVisit) {
      setMessage(
        `Already checked in today at ${new Date(
          existingVisit.created_at
        ).toLocaleTimeString()}`
      )
      return
    }

    const { error } = await supabase.from("wash_visits").insert({
      member_id: member.memberId,
      email: member.email,
      membership_plan: member.plan,
      license_plate: member.plate,
    })

    if (error) {
      setMessage(error.message)
      return
    }

    const { data: existingMember } = await supabase
      .from("members")
      .select("*")
      .eq("id", member.memberId)
      .maybeSingle()

    if (existingMember) {
      await supabase
        .from("members")
        .update({
          rewards_points: (existingMember.rewards_points || 0) + 10,
          lifetime_washes: (existingMember.lifetime_washes || 0) + 1,
        })
        .eq("id", member.memberId)
    }

    setMessage("Wash checked in successfully. +10 Braxy Bucks awarded.")
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-4xl font-bold">QR / Plate Check-In</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/checkin"
          className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          QR Scanner
        </Link>

        <Link
          href="/admin/plate-lookup"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold text-white"
        >
          Plate Lookup
        </Link>

        <Link
          href="/admin"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold text-white"
        >
          Admin Dashboard
        </Link>
      </div>

      <p className="mt-4 max-w-xl text-slate-300">
        Scan a Braxy Buns QR pass or enter a license plate.
      </p>

      <div className="mt-8 max-w-xl rounded-2xl bg-white p-4 text-slate-950">
        <div id="qr-reader" />
      </div>

      <textarea
        className="mt-6 h-32 w-full max-w-2xl rounded-xl bg-white p-4 text-slate-950"
        placeholder="Scan QR code or enter license plate..."
        value={qrText}
        onChange={(e) => setQrText(e.target.value)}
      />

      <button
        onClick={() => verifyText(qrText)}
        className="mt-4 rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
      >
        Verify Member
      </button>

      {member && (
        <div className="mt-8 max-w-2xl rounded-2xl bg-white/10 p-6">
          <h2 className="text-2xl font-bold">{member.name || "Member"}</h2>
          <p className="mt-2 text-cyan-300">{member.plan}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p>{member.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Status</p>
              <p className="font-bold">
                {member.status === "active" ? "Active" : member.status}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Vehicle</p>
              <p>{member.vehicle || "Not added"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Plate</p>
              <p>{member.plate || "Not added"}</p>
            </div>
          </div>

          <button
            onClick={checkInWash}
            disabled={member.status !== "active"}
            className="mt-6 w-full rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
          >
            Check In Wash
          </button>
        </div>
      )}

      {message && <p className="mt-6 font-semibold text-cyan-300">{message}</p>}
    </main>
  )
}