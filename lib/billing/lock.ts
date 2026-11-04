import type { SupabaseClient } from "@supabase/supabase-js"
import { MemberError } from "@/lib/member/server"
export async function billingLock<T>(db: SupabaseClient, email: string, action: (token: string) => Promise<T>) {
  const key = email.trim().toLowerCase()
  const { data: token, error } = await db.rpc("braxy_acquire_billing_lock", { p_key: key })
  if (error) throw new MemberError("Billing setup is not ready. Please contact the team.", 503)
  if (!token) throw new MemberError("Your billing account is being updated. Please try again shortly.", 409)
  try { return await action(token as string) }
  finally { await db.rpc("braxy_release_billing_lock", { p_key: key, p_token: token }) }
}
