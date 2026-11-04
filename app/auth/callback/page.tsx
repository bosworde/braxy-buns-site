"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  useEffect(() => {
    let disposed = false
    async function finish() {
      try {
        const params = new URLSearchParams(location.search)
        const hash = new URLSearchParams(location.hash.slice(1))
        if (params.has("error") || hash.has("error")) throw new Error("This sign-in link is expired or invalid. Request a new link.")
        const code = params.get("code")
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        }
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) throw new Error("We couldn’t finish signing you in. Request a new link and open it in the same browser.")
        if (!disposed) router.replace("/app")
      } catch { if (!disposed) setError("This sign-in link could not be verified. Request a new link and open it in the same browser.") }
    }
    void finish()
    return () => { disposed = true }
  }, [router])
  return <main className="min-h-screen bg-slate-950 p-10 text-white"><h1 className="text-2xl font-bold">{error ? "Let’s try signing in again" : "Finishing sign-in…"}</h1>{error && <><p className="my-5" role="alert">{error}</p><Link href="/app" className="text-cyan-300 underline">Return to the Member App</Link></>}</main>
}
