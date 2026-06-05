"use client"

import { useEffect, useState } from "react"
import BottomNav from "@/components/BottomNav"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [vehicleMake, setVehicleMake] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [vehicleColor, setVehicleColor] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user?.email) return

      setEmail(user.email)

      const { data: member } = await supabase
        .from("members")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      if (member) {
        setFirstName(member.first_name || "")
        setLastName(member.last_name || "")
        setVehicleMake(member.vehicle_make || "")
        setVehicleModel(member.vehicle_model || "")
        setVehicleColor(member.vehicle_color || "")
        setLicensePlate(member.license_plate || "")
      }
    }

    loadProfile()
  }, [])

  async function saveProfile() {
    const { error } = await supabase
      .from("members")
      .update({
        first_name: firstName,
        last_name: lastName,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        vehicle_color: vehicleColor,
        license_plate: licensePlate,
      })
      .eq("email", email)

    if (error) {
      setMessage(error.message)
      return
    }

    setMessage("Profile saved successfully.")
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const inputClass =
    "w-full rounded-xl border border-slate-600 bg-white px-4 py-3 text-slate-950 placeholder:text-slate-500"

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 pb-28">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Braxy Buns Wash Club
        </p>

        <h1 className="mt-4 text-4xl font-bold">My Profile</h1>

        <p className="mt-2 text-slate-300">{email}</p>

        <div className="mt-8 space-y-5 rounded-2xl bg-white/10 p-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              First Name
            </label>
            <input
              className={inputClass}
              placeholder="Dennis"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Last Name
            </label>
            <input
              className={inputClass}
              placeholder="Bosworth"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Vehicle Make
            </label>
            <input
              className={inputClass}
              placeholder="Ford"
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Vehicle Model
            </label>
            <input
              className={inputClass}
              placeholder="F-150"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Vehicle Color
            </label>
            <input
              className={inputClass}
              placeholder="Black"
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              License Plate
            </label>
            <input
              className={inputClass}
              placeholder="ABC1234"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
            />
          </div>

          <button
            onClick={saveProfile}
            className="w-full rounded-xl bg-cyan-400 py-3 font-bold text-slate-950"
          >
            Save Profile
          </button>

          <button
            onClick={signOut}
            className="w-full rounded-xl border border-slate-600 py-3 font-bold text-white"
          >
            Sign Out
          </button>

          {message && (
            <p className="text-center font-semibold text-cyan-300">
              {message}
            </p>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}