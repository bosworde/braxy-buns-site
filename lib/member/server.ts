import { createClient } from "@supabase/supabase-js"

export class MemberError extends Error {
  constructor(message: string, public status = 500) { super(message) }
}

// Never accept a member ID, email, or Stripe ID as proof of identity.
export async function authenticatedMember(request: Request) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1]
  if (!token) throw new MemberError("Please sign in to continue.", 401)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new MemberError("Member services are temporarily unavailable.", 503)
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: { user }, error } = await db.auth.getUser(token)
  if (error || !user?.email || !user.email_confirmed_at) throw new MemberError("Please sign in again.", 401)
  const { data: member, error: memberError } = await db.from("members")
    .select("id,email,first_name,last_name,membership_plan,membership_status,vehicle_make,vehicle_model,vehicle_color,license_plate,rewards_points,lifetime_washes,stripe_customer_id")
    .eq("email", user.email.toLowerCase()).maybeSingle()
  if (memberError) throw new MemberError("We couldn’t load your membership. Please try again.", 503)
  return { db, user, member }
}
