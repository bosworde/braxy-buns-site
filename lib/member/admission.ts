import { supabase } from "@/lib/supabase"
export async function verifyAdmission(memberId: string, commit = false) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error("Please sign in again.")
  const response = await fetch("/api/admin/admission", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ memberId, commit }),
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || "Admission verification failed. Do not admit.")
  if (result.duplicate) throw new Error("This member or plate already washed today (Central time).")
  return result as { approved: boolean; recorded: boolean; rewards_points: number; lifetime_washes: number }
}
