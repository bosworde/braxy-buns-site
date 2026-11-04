import { NextResponse } from "next/server"
import { authenticatedMember, MemberError } from "@/lib/member/server"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "private, no-store" }
function failure(error: unknown) {
  return NextResponse.json({ error: error instanceof MemberError ? error.message : "Member services are temporarily unavailable." }, { status: error instanceof MemberError ? error.status : 500, headers })
}
export async function GET(request: Request) {
  try {
    const { db, member } = await authenticatedMember(request)
    if (!member) return NextResponse.json({ member: null, visits: [], visitsUnavailable: false }, { headers })
    const { data: visits, error } = await db.from("wash_visits").select("id,created_at,membership_plan")
      .eq("member_id", member.id).order("created_at", { ascending: false }).limit(50)
    const { stripe_customer_id, ...profile } = member
    return NextResponse.json({ member: { ...profile, billingAvailable: Boolean(stripe_customer_id) }, visits: visits || [], visitsUnavailable: Boolean(error) }, { headers })
  } catch (error) { return failure(error) }
}
export async function PATCH(request: Request) {
  try {
    const { db, member } = await authenticatedMember(request)
    if (!member) throw new MemberError("A membership is needed before adding a vehicle.", 404)
    let body: Record<string, unknown>
    try { body = await request.json() } catch { throw new MemberError("Invalid vehicle details.", 400) }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new MemberError("Invalid vehicle details.", 400)
    const fields = ["vehicle_make", "vehicle_model", "vehicle_color", "license_plate"] as const
    const update: Record<string, string> = {}
    for (const field of fields) {
      if (typeof body[field] !== "string" || (body[field] as string).trim().length > 50) throw new MemberError("Please check your vehicle details.", 400)
      update[field] = (body[field] as string).trim()
    }
    update.license_plate = update.license_plate.replace(/\s+/g, "").toUpperCase()
    if (!/^[A-Z0-9-]{2,10}$/.test(update.license_plate)) throw new MemberError("Enter a valid license plate (2–10 letters, numbers, or hyphens).", 400)
    if (!update.vehicle_make || !update.vehicle_model) throw new MemberError("Enter a vehicle make and model.", 400)
    // Only vehicle fields can be changed; membership, billing, and rewards are never writable here.
    const { data, error } = await db.from("members").update(update).eq("id", member.id).select("id").maybeSingle()
    if (error || !data) throw new MemberError("We couldn’t save your vehicle. Please try again.", 409)
    return NextResponse.json({ success: true }, { headers })
  } catch (error) { return failure(error) }
}
