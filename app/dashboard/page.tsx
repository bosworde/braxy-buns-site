"use client"

import { useEffect, useState } from "react"
import BottomNav from "@/components/BottomNav"
import { supabase } from "@/lib/supabase"

type WashVisit = {
  id: string
  created_at: string
}

const rewardLevels = [
  { points: 50, reward: "Free Air Freshener" },
  { points: 100, reward: "Free Wash Upgrade" },
  { points: 250, reward: "Braxy Buns T-Shirt" },
  { points: 500, reward: "Founder VIP Status" },
]

export default function DashboardPage() {
  const [email, setEmail] = useState<string | null>(null)
  const [membershipPlan, setMembershipPlan] = useState("Loading...")
  const [rewardsPoints, setRewardsPoints] = useState(0)
  const [lifetimeWashes, setLifetimeWashes] = useState(0)
  const [lastWash, setLastWash] = useState<string | null>(null)

  useEffect(() => {
    async function loadMember() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      if (!user?.email) return

      setEmail(user.email)

      const { data: existingMember } = await supabase
        .from("members")
        .select("*")
        .eq("email", user.email)
        .maybeSingle()

      if (existingMember) {
        setMembershipPlan(existingMember.membership_plan || "Prospect")
        setRewardsPoints(existingMember.rewards_points || 0)
      } else {
        const { data: newMember } = await supabase
          .from("members")
          .insert({
            email: user.email,
            membership_plan: "Prospect",
            rewards_points: 0,
          })
          .select()
          .single()

        setMembershipPlan(newMember?.membership_plan || "Prospect")
        setRewardsPoints(newMember?.rewards_points || 0)
      }

      const { data: visits } = await supabase
        .from("wash_visits")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false })

      if (visits) {
        setLifetimeWashes(visits.length)

        if (visits.length > 0) {
          setLastWash(new Date(visits[0].created_at).toLocaleString())
        }
      }
    }

    loadMember()
  }, [])

  const isActive =
    membershipPlan !== "Prospect" && membershipPlan !== "Loading..."

  const nextReward =
    rewardLevels.find((level) => rewardsPoints < level.points) ||
    rewardLevels[rewardLevels.length - 1]

  const previousLevel =
    rewardLevels
      .slice()
      .reverse()
      .find((level) => rewardsPoints >= level.points)?.points || 0

  const progressRange = nextReward.points - previousLevel
  const progressWithinRange = rewardsPoints - previousLevel
  const progressPercent = Math.min(
    100,
    Math.round((progressWithinRange / progressRange) * 100)
  )

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10 pb-28">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Braxy Buns Wash Club
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Welcome to your member dashboard
        </h1>

        <p className="mt-4 max-w-2xl text-slate-300">
          {email ? `Signed in as ${email}` : "Loading your member profile..."}
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-6">
            <h2 className="text-xl font-semibold">Membership</h2>
            <p className="mt-2 text-slate-300">{membershipPlan}</p>
            <p className="mt-4 text-3xl font-bold">
              {isActive ? "Active" : "Not Active"}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6">
            <h2 className="text-xl font-semibold">Braxy Bucks</h2>
            <p className="mt-2 text-slate-300">Rewards balance</p>
            <p className="mt-4 text-3xl font-bold">{rewardsPoints} pts</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-6">
            <h2 className="text-xl font-semibold">QR Pass</h2>
            <p className="mt-2 text-slate-300">
              {isActive ? "Ready for scan" : "Available after membership"}
            </p>
            <p className="mt-4 text-3xl font-bold">
              {isActive ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/10 p-6">
            <h2 className="text-2xl font-bold">Wash Activity</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Lifetime Washes</p>
                <p className="mt-2 text-3xl font-bold">{lifetimeWashes}</p>
              </div>

              <div className="rounded-xl bg-slate-900 p-4">
                <p className="text-sm text-slate-400">Last Wash</p>
                <p className="mt-2 text-lg font-bold">
                  {lastWash || "No washes yet"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 p-6">
            <h2 className="text-2xl font-bold">Rewards Progress</h2>

            <p className="mt-4 text-slate-300">
              Next reward:{" "}
              <span className="font-bold text-cyan-300">
                {nextReward.reward}
              </span>
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {rewardsPoints} / {nextReward.points} points
            </p>

            <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="mt-6 space-y-3">
              {rewardLevels.map((level) => (
                <div
                  key={level.points}
                  className="flex items-center justify-between rounded-xl bg-slate-900 p-3"
                >
                  <span>{level.reward}</span>
                  <span className="font-bold text-cyan-300">
                    {level.points} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}