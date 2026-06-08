"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

const ADMIN_EMAILS = ["dennis@braxybuns.com", "dennisddx@gmail.com"]

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    if (!ADMIN_EMAILS.includes(user.email || "")) {
      router.push("/dashboard")
      return
    }

    setAllowed(true)
    setChecking(false)
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Checking admin access...
      </main>
    )
  }

  if (!allowed) return null

  return <>{children}</>
}