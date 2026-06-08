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
    const checkAdmin = async () => {
      setChecking(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const user = session?.user

      if (!user) {
        setChecking(false)
        router.replace("/login")
        return
      }

      const email = user.email?.toLowerCase() || ""

      if (!ADMIN_EMAILS.includes(email)) {
        setChecking(false)
        router.replace("/dashboard")
        return
      }

      setAllowed(true)
      setChecking(false)
    }

    checkAdmin()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdmin()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

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