"use client"

import { useState } from "react"
import Link from "next/link"
import { verifyAdmission } from "@/lib/member/admission"
import { supabase } from "@/lib/supabase"

type Member = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  membership_plan: string | null
  membership_status: string | null
  license_plate: string | null
  rewards_points: number | null
  lifetime_washes: number | null
}

export default function LprCameraPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [detectedPlate, setDetectedPlate] = useState("")
  const [fakePlate, setFakePlate] = useState("")
  const [member, setMember] = useState<Member | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [scanLoading, setScanLoading] = useState(false)

  function cleanPlate(value: string) {
    return value.trim().replace(/\s+/g, "").toLowerCase()
  }

  function handleImageChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(file)
    setDetectedPlate("")
    setMember(null)
    setMessage("")

    if (!file) {
      setPreviewUrl("")
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
  }

  async function fakeScan() {
    if (!fakePlate.trim()) {
      setMessage("Enter a fake plate to simulate a scan.")
      return
    }

    const cleaned = cleanPlate(fakePlate)
    setDetectedPlate(cleaned.toUpperCase())
    await lookupPlate(cleaned)
  }

  async function scanImage() {
    if (!imageFile) {
      setMessage("Choose or take a license plate photo first.")
      return
    }

    setScanLoading(true)
    setMessage("")
    setMember(null)

    try {
    const formData = new FormData()
    formData.append("image", imageFile)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setMessage("Please sign in again."); setScanLoading(false); return }
    const response = await fetch("/api/lpr-scan", {
      method: "POST",
      body: formData,
      headers: { Authorization: `Bearer ${session.access_token}` },
    })

    const result = await response.json()

    if (!response.ok) {
      setMessage(result.error || "Could not scan plate.")
      setScanLoading(false)
      return
    }

    if (!result.plate) {
      setMessage("No plate detected. Try a clearer photo.")
      setScanLoading(false)
      return
    }

    setDetectedPlate(result.plate.toUpperCase())
    setScanLoading(false)

    await lookupPlate(result.plate)
    } catch { setMessage("Scan unavailable. Try again or confirm the plate manually.") }
    finally { setScanLoading(false) }
  }

  async function lookupPlate(value?: string) {
    setLoading(true)
    setMessage("")
    setMember(null)

    const cleaned = cleanPlate(value || detectedPlate)

    if (!cleaned) {
      setMessage("No plate entered or detected.")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .ilike("license_plate", cleaned)
      .maybeSingle()

    if (error || !data) {
      setMessage(`Plate ${cleaned.toUpperCase()} not found.`)
      setLoading(false)
      return
    }

    setMember(data)
    setMessage(`Plate ${cleaned.toUpperCase()} matched.`)
    setLoading(false)
  }

  async function approveWash() {
    if (!member) return
    setMessage("Verifying current payment and recording admission…")
    try {
      const result = await verifyAdmission(member.id, true)
      setMember({ ...member, rewards_points: result.rewards_points, lifetime_washes: result.lifetime_washes })
      setMessage("Admission recorded. +10 Braxy Bucks awarded. Follow the attendant’s instructions; no equipment was activated.")

    } catch (error) { setMessage(error instanceof Error ? error.message : "Verification unavailable. Do not admit.") }
  }

  const fullName = member
    ? `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
      member.email
    : ""

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Braxy Buns Admin
            </p>

            <h1 className="mt-2 text-4xl font-black">
              LPR Camera Scan
            </h1>

            <p className="mt-2 text-slate-400">
              Test license plate scanning with fake scan mode now, then connect real camera API later.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Admin Home
            </Link>

            <Link href="/admin/lpr" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Manual LPR
            </Link>

            <Link href="/admin/operations" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Operations
            </Link>
          </div>
        </div>

        <section className="rounded-3xl bg-cyan-400 p-6 text-slate-950">
          <h2 className="text-2xl font-black">Fake Scan Mode</h2>

          <p className="mt-2 font-semibold">
            Use this to test the full LPR workflow without a paid API key.
          </p>

          <div className="mt-5 flex flex-col gap-3 md:flex-row">
            <input
              value={fakePlate}
              onChange={(e) => setFakePlate(e.target.value)}
              placeholder="Enter test plate"
              className="flex-1 rounded-xl bg-white px-5 py-4 text-lg font-black uppercase text-slate-950 outline-none"
            />

            <button
              onClick={fakeScan}
              className="rounded-xl bg-slate-950 px-6 py-4 font-black text-white"
            >
              Simulate Scan
            </button>
          </div>
        </section>

        <section className="rounded-3xl bg-white/10 p-6">
          <h2 className="text-2xl font-black">Take / Upload Plate Image</h2>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
            className="mt-5 block w-full rounded-xl bg-slate-900 p-4 font-bold text-white"
          />

          {previewUrl && (
            <img
              src={previewUrl}
              alt="License plate preview"
              className="mt-5 max-h-96 w-full rounded-2xl bg-slate-900 object-contain"
            />
          )}

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              onClick={scanImage}
              disabled={scanLoading}
              className="rounded-xl bg-cyan-400 px-6 py-4 font-black text-slate-950 disabled:opacity-50"
            >
              {scanLoading ? "Scanning..." : "Scan Image"}
            </button>

            <button
              onClick={() => lookupPlate()}
              disabled={loading}
              className="rounded-xl bg-white/10 px-6 py-4 font-black text-white disabled:opacity-50"
            >
              {loading ? "Looking Up..." : "Manual Lookup"}
            </button>
          </div>

          <div className="mt-5">
            <label className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
              Detected / Manual Plate
            </label>

            <input
              value={detectedPlate}
              onChange={(e) => setDetectedPlate(e.target.value)}
              placeholder="Plate will appear here"
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-5 py-4 text-lg font-bold uppercase text-white outline-none"
            />
          </div>

          {message && (
            <div className="mt-5 rounded-2xl bg-slate-900 p-4 font-bold text-cyan-300">
              {message}
            </div>
          )}
        </section>

        {member && (
          <section className="rounded-3xl bg-white/10 p-6">
            <div
              className={`rounded-3xl p-6 ${
                member.membership_status === "active"
                  ? "bg-green-400 text-slate-950"
                  : "bg-red-400 text-slate-950"
              }`}
            >
              <p className="text-sm font-black uppercase tracking-[0.3em]">
                LPR Decision
              </p>

              <h2 className="mt-3 text-5xl font-black">
                {member.membership_status === "active"
                  ? "MEMBER MATCHED — VERIFY AT CHECK-IN"
                  : "DO NOT WASH"}
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Info label="Member" value={fullName} />
              <Info label="Email" value={member.email} />
              <Info label="Plate" value={member.license_plate || "—"} />
              <Info label="Plan" value={member.membership_plan || "—"} />
              <Info label="Status" value={member.membership_status || "inactive"} />
              <Info label="Lifetime Washes" value={member.lifetime_washes || 0} />
              <Info label="Braxy Bucks" value={member.rewards_points || 0} />
            </div>

            <button
              onClick={approveWash}
              className="mt-6 w-full rounded-xl bg-cyan-400 px-6 py-4 text-xl font-black text-slate-950"
            >
              Approve Wash + Add Visit
            </button>
          </section>
        )}
      </div>
    </main>
  )
}

function Info({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-cyan-300">
        {value}
      </p>
    </div>
  )
}
