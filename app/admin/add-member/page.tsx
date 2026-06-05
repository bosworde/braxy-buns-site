"use client"

import Link from "next/link"
import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AddMemberPage() {
  const [message, setMessage] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleColor, setVehicleColor] = useState("")
  const [membershipPlan, setMembershipPlan] = useState("Max Shine Club")

  async function createMember() {
    setMessage("")

    const cleanEmail = email.trim().toLowerCase()
    const cleanPlate = licensePlate.trim().toUpperCase()

    const { data: existingMember } = await supabase
      .from("members")
      .select("id")
      .or(`email.eq.${cleanEmail},license_plate.eq.${cleanPlate}`)
      .maybeSingle()

    if (existingMember) {
      setMessage("A member with this email or plate already exists.")
      return
    }

    const { error } = await supabase
      .from("members")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: cleanEmail,
        license_plate: cleanPlate,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_color: vehicleColor,
        membership_plan: membershipPlan,
        membership_status: "active",
        rewards_points: 0,
        lifetime_washes: 0,
      })

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Member created successfully!")

    setFirstName("")
    setLastName("")
    setEmail("")
    setLicensePlate("")
    setVehicleMake("")
    setVehicleModel("")
    setVehicleColor("")
    setMembershipPlan("Max Shine Club")
  }

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <h1 className="text-4xl font-bold">Add Member</h1>

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
          href="/admin/checkin"
          className="rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950"
        >
          QR Check-In
        </Link>

        <Link
          href="/admin/plate-lookup"
          className="rounded-xl bg-white/10 px-5 py-3 font-bold"
        >
          Plate Lookup
        </Link>
      </div>

      <div className="mt-8 max-w-2xl rounded-2xl bg-white/10 p-6 space-y-4">
        <input
          className="w-full rounded-xl bg-white p-3 text-slate-950"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-white p-3 text-slate-950"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-white p-3 text-slate-950"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-white p-3 text-slate-950"
          placeholder="License Plate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-white p-3 text-slate-950"
          placeholder="Vehicle Make"
          value={vehicleMake}
          onChange={(e) => setVehicleMake(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-white p-3 text-slate-950"
          placeholder="Vehicle Model"
          value={vehicleModel}
          onChange={(e) => setVehicleModel(e.target.value)}
        />

        <input
          className="w-full rounded-xl bg-white p-3 text-slate-950"
          placeholder="Vehicle Color"
          value={vehicleColor}
          onChange={(e) => setVehicleColor(e.target.value)}
        />

        <select
          className="w-full rounded-xl bg-white p-3 text-slate-950"
          value={membershipPlan}
          onChange={(e) => setMembershipPlan(e.target.value)}
        >
          <option>Basic Shine Club</option>
          <option>Plus Shine Club</option>
          <option>Max Shine Club</option>
          <option>Family Plan</option>
        </select>

        <button
          onClick={createMember}
          className="w-full rounded-xl bg-cyan-400 px-6 py-3 font-bold text-slate-950"
        >
          Create Member
        </button>
      </div>

      {message && (
        <p className="mt-6 font-semibold text-cyan-300">
          {message}
        </p>
      )}
    </main>
  )
}