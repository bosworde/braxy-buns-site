import { NextResponse } from "next/server"
import { authenticatedUser, MemberError } from "@/lib/member/server"
import { preopening } from "@/lib/member/launch"
import { preopeningDetails } from "@/lib/member/preopening"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "private, no-store" }
const columns = "auth_user_id,email,first_name,last_name,preferred_plan,vehicle_make,vehicle_model,vehicle_color,license_plate"
function failure(error: unknown) {
  return NextResponse.json({ error: error instanceof MemberError ? error.message : "Pre-opening registration is temporarily unavailable." }, { status: error instanceof MemberError ? error.status : 503, headers })
}
export async function GET(request: Request) {
  try {
    const { db, user } = await authenticatedUser(request)
    const { data, error } = await db.from("braxy_preopening_profiles").select(columns).eq("auth_user_id", user.id).maybeSingle()
    if (error) throw new MemberError("We couldn’t load your pre-opening profile. Please try again.", 503)
    return NextResponse.json({ member: data ? { ...data, id: data.auth_user_id, membership_plan: `${data.preferred_plan} Wash Club`, membership_status: "preopening", rewards_points: 0, lifetime_washes: 0, billingAvailable: false } : null, visits: [], visitsUnavailable: false }, { headers })
  } catch (error) { return failure(error) }
}
export async function POST(request: Request) {
  try {
    if (!preopening()) throw new MemberError("Pre-opening registration is closed. Visit the member app for current enrollment options.", 409)
    const { db, user, email } = await authenticatedUser(request)
    const body = await request.json().catch(() => null)
    if (body?.acknowledgement !== true) throw new MemberError("Please acknowledge that registration is free and does not activate a paid membership.", 400)
    const details = preopeningDetails(body)
    // All ownership comes from the verified session. Ignore client IDs, balances, and status.
    const { error } = await db.from("braxy_preopening_profiles").upsert({ ...details, auth_user_id: user.id, email, updated_at: new Date().toISOString() }, { onConflict: "auth_user_id" })
    if (error) throw new MemberError("We couldn’t save your pre-opening registration. Please try again.", 503)
    return NextResponse.json({ success: true }, { headers })
  } catch (error) { return failure(error) }
}
