import { NextResponse } from "next/server"
import { authenticatedAdmin, MemberError } from "@/lib/member/server"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "private, no-store" }
export async function GET(request: Request) {
  try {
    const { db } = await authenticatedAdmin(request)
    const page = Number(new URL(request.url).searchParams.get("page") || 0)
    if (!Number.isSafeInteger(page) || page < 0 || page > 100000) throw new MemberError("Invalid registration page.", 400)
    const { data, error, count } = await db.from("braxy_preopening_profiles")
      .select("auth_user_id,email,first_name,last_name,preferred_plan,vehicle_make,vehicle_model,vehicle_color,license_plate,created_at", { count: "exact" })
      .order("created_at", { ascending: false }).order("auth_user_id").range(page * 100, page * 100 + 99)
    if (error) throw new MemberError("Pre-opening registrations are temporarily unavailable.", 503)
    return NextResponse.json({ registrations: data, count }, { headers })
  } catch (error) { return NextResponse.json({ error: error instanceof MemberError ? error.message : "Couldn’t load registrations." }, { status: error instanceof MemberError ? error.status : 503, headers }) }
}
