"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    async function finishLogin() {
      await supabase.auth.getSession()
      router.replace("/dashboard")
    }

    finishLogin()
  }, [router])

  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      Finishing login...
    </main>
  )
}