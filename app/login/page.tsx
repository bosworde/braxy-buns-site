"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/dashboard",
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Check your email for the login link.")
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-md rounded-2xl bg-white/10 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
          Braxy Buns Wash Club
        </p>

        <h1 className="mt-4 text-3xl font-bold">Member Login</h1>

        <p className="mt-3 text-slate-300">
          Enter your email and we’ll send you a secure login link.
        </p>

        <input
          className="mt-6 w-full rounded-xl px-4 py-3 text-slate-950"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="mt-4 w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950"
        >
          Send Login Link
        </button>

        {message && <p className="mt-4 text-cyan-300">{message}</p>}
      </div>
    </main>
  )
}