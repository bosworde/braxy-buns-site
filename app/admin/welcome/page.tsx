"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase"

type WelcomeMember = {
  first_name: string | null
  last_name: string | null
  membership_plan: string | null
  license_plate: string | null
  rewards_points: number | null
  lifetime_washes: number | null
  updated_at: string | null
}

export default function WelcomeScreenPage() {
  const [member, setMember] = useState<WelcomeMember | null>(null)
  const [showMember, setShowMember] = useState(false)
  const lastUpdatedAt = useRef<string | null>(null)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function loadWelcomeScreen() {
    const { data } = await supabase
      .from("welcome_screen")
      .select("*")
      .eq("id", "current")
      .maybeSingle()

    if (!data) return

    setMember(data)

    if (data.first_name && data.updated_at !== lastUpdatedAt.current) {
      lastUpdatedAt.current = data.updated_at
      setShowMember(true)

      if (resetTimer.current) {
        clearTimeout(resetTimer.current)
      }

      resetTimer.current = setTimeout(() => {
        setShowMember(false)
      }, 15000)
    }
  }

  useEffect(() => {
    loadWelcomeScreen()

    const interval = setInterval(loadWelcomeScreen, 2000)

    return () => {
      clearInterval(interval)

      if (resetTimer.current) {
        clearTimeout(resetTimer.current)
      }
    }
  }, [])

  const waiting = !showMember || !member?.first_name

  const tierImage =
    member?.membership_plan === "Basic Wash Club"
      ? "/gecko.png"
      : member?.membership_plan === "Plus Wash Club"
      ? "/iguana.png"
      : "/dragon.png"

  const tierName =
    member?.membership_plan === "Basic Wash Club"
      ? "Gecko Club"
      : member?.membership_plan === "Plus Wash Club"
      ? "Iguana Club"
      : "Dragon Club"

  const tierSubtitle =
    member?.membership_plan === "Basic Wash Club"
      ? "Essential Member"
      : member?.membership_plan === "Plus Wash Club"
      ? "Plus Member"
      : "Premium Member"

const tierCardClass =
  member?.membership_plan === "Basic Wash Club"
    ? "bg-emerald-400 shadow-[0_0_45px_rgba(52,211,153,0.55)]"
    : member?.membership_plan === "Plus Wash Club"
    ? "bg-cyan-400 shadow-[0_0_45px_rgba(34,211,238,0.55)]"
    : "bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 shadow-[0_0_55px_rgba(253,224,71,0.75)]"
  

const tierBackgroundClass =
  member?.membership_plan === "Basic Wash Club"
    ? "from-emerald-900 via-slate-950 to-emerald-950"
    : member?.membership_plan === "Plus Wash Club"
    ? "from-cyan-900 via-slate-950 to-blue-950"
    : "from-yellow-900 via-slate-950 to-purple-950"

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_35%)]" />

      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <Link
        href="/admin"
        className="absolute left-6 top-6 z-20 rounded-xl bg-white/10 px-4 py-2 font-bold backdrop-blur hover:bg-white/20"
      >
        Admin
      </Link>

      {waiting ? (
        <section className="relative z-10 text-center">
          <p className="text-lg font-bold uppercase tracking-[0.6em] text-cyan-300">
            Express Wash Club
          </p>

          <h1 className="mt-6 text-8xl font-black tracking-tight text-cyan-300 drop-shadow-[0_0_35px_rgba(34,211,238,0.65)]">
            BRAXY BUNS
          </h1>

          <div className="mx-auto mt-8 h-1 w-72 rounded-full bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.9)]" />

          <p className="mt-8 text-4xl font-bold text-slate-200">
            Waiting for next member...
          </p>

          <p className="mt-6 text-2xl text-slate-400">
            Clean cars. Brighter futures.
          </p>
        </section>
      ) : (
        <section className="relative z-10 mx-auto w-full max-w-6xl px-8 text-center">
       <div
  className={`rounded-[3rem] border border-cyan-300/40 bg-gradient-to-br ${tierBackgroundClass} p-10 shadow-[0_0_70px_rgba(34,211,238,0.25)] backdrop-blur`}
>
            <div className="relative mx-auto mb-6 flex w-fit items-center justify-center">
              <div className="absolute -inset-10 rounded-[3rem] bg-[radial-gradient(circle_at_15%_50%,rgba(255,122,0,0.9),transparent_35%),radial-gradient(circle_at_40%_45%,rgba(255,214,0,0.85),transparent_35%),radial-gradient(circle_at_62%_45%,rgba(0,210,120,0.65),transparent_35%),radial-gradient(circle_at_78%_45%,rgba(0,94,255,0.9),transparent_38%),radial-gradient(circle_at_95%_45%,rgba(139,92,246,0.75),transparent_35%)] blur-2xl" />

              <div className="relative rounded-[2rem] bg-slate-950/90 p-4 shadow-[0_0_45px_rgba(34,211,238,0.35)]">
                <Image
                  src="/logo.png"
                  alt="Braxy Buns"
                  width={430}
                  height={430}
                  className="rounded-[1.5rem]"
                  priority
                />
              </div>
            </div>

            <p className="text-2xl font-black uppercase tracking-[0.65em] text-cyan-300">
              Welcome Back
            </p>

            <h1 className="mt-4 text-9xl font-black uppercase leading-none tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.25)]">
              {member?.first_name}
            </h1>

            <div
              className={`mx-auto mt-10 max-w-4xl rounded-[2rem] px-10 py-8 text-slate-950 ${tierCardClass}`}
            >
              <div className="flex flex-col items-center justify-center gap-6">
                <Image
                  src={tierImage}
                  alt={tierName}
                width={380}
height={380}
                className="rounded-3xl drop-shadow-[0_0_45px_rgba(253,224,71,0.95)]"
                  priority
                />

                <div>
                  <p className="text-6xl font-black">{tierName}</p>
                  {member?.membership_plan === "Max Shine Club" && (
  <div className="mt-3 inline-flex items-center rounded-full bg-slate-950 px-6 py-2 text-lg font-black uppercase tracking-[0.2em] text-yellow-300">
    ★ VIP PRIORITY MEMBER
  </div>
)}

                  <p className="mt-2 text-2xl font-black uppercase tracking-[0.3em]">
                    {tierSubtitle}
                  </p>

                  <p className="mt-6 text-3xl font-black tracking-widest">
                    {member?.license_plate || ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-8">
                <p className="text-lg uppercase tracking-[0.3em] text-slate-400">
                  Braxy Bucks
                </p>
                <p className="mt-4 text-7xl font-black text-cyan-300">
                  {member?.rewards_points || 0}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-8">
                <p className="text-lg uppercase tracking-[0.3em] text-slate-400">
                  Lifetime Washes
                </p>
                <p className="mt-4 text-7xl font-black text-cyan-300">
                  {member?.lifetime_washes || 0}
                </p>
              </div>
            </div>

            <div className="mx-auto mt-10 max-w-4xl rounded-3xl border border-cyan-300/30 bg-slate-950/70 p-8">
              <p className="text-3xl font-black uppercase text-white">
                Thank you for supporting neurodiverse employment
              </p>
              <p className="mt-3 text-xl text-slate-300">
                Every wash helps create meaningful work and brighter futures.
              </p>
            </div>

            <p className="mt-8 text-2xl font-bold uppercase tracking-[0.4em] text-cyan-300">
              Please enter the tunnel
            </p>
          </div>
        </section>
      )}
    </main>
  )
}