import { createClient } from "@supabase/supabase-js"

export class MemberError extends Error {
  constructor(message: string, public status = 500) { super(message) }
}
export const ADMIN_EMAILS = ["dennis@braxybuns.com", "dennisddx@gmail.com"]
export function serviceDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new MemberError("Member services are temporarily unavailable.", 503)
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
export async function authenticatedUser(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1]
  if (!token) throw new MemberError("Please sign in to continue.", 401)
  const db = serviceDatabase()
  const { data: { user }, error } = await db.auth.getUser(token)
  if (error || !user?.email || !user.email_confirmed_at) throw new MemberError("Please sign in again.", 401)
  return { db, user, email: user.email.trim().toLowerCase() }
}
export async function authenticatedAdmin(request: Request) {
  const identity = await authenticatedUser(request)
  if (!ADMIN_EMAILS.includes(identity.email)) throw new MemberError("Administrator access is required.", 403)
  return identity
}
// Only the verified identity can select a membership; never accept a caller-selected email or ID.
export async function authenticatedMember(request: Request) {
  const { db, user, email } = await authenticatedUser(request)
  const { data: member, error } = await db.from("members")
    .select("id,email,first_name,last_name,membership_plan,membership_status,vehicle_make,vehicle_model,vehicle_color,license_plate,rewards_points,lifetime_washes,stripe_customer_id,stripe_subscription_id")
    .eq("email", email).maybeSingle()
  if (error) throw new MemberError("We couldn’t load your membership. Please try again.", 503)
  return { db, user, member }
}
