import { NextResponse } from "next/server"
import { authenticatedAdmin, MemberError } from "@/lib/member/server"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "private, no-store" }
export async function GET(request: Request) {
  try {
    const { db } = await authenticatedAdmin(request)
    const { data, error } = await db.from("braxy_operational_alerts").select("id,kind,resource_id,customer_id,subscription_ids,message,created_at")
      .is("resolved_at", null).order("created_at", { ascending: false }).limit(100)
    if (error) throw new Error("Alerts unavailable")
    return NextResponse.json({ alerts: data }, { headers })
  } catch (error) { return NextResponse.json({ error: error instanceof MemberError ? error.message : "Could not load alerts. Check Stripe Workbench." }, { status: error instanceof MemberError ? error.status : 503, headers }) }
}
export async function PATCH(request: Request) {
  try {
    const { db } = await authenticatedAdmin(request)
    const body = await request.json()
    if (typeof body.id !== "string" || body.id.length > 200) throw new MemberError("Invalid alert.", 400)
    const { error } = await db.from("braxy_operational_alerts").update({ resolved_at: new Date().toISOString() }).eq("id", body.id)
    if (error) throw new Error("Alert update failed")
    return NextResponse.json({ success: true }, { headers })
  } catch (error) { return NextResponse.json({ error: error instanceof MemberError ? error.message : "Could not update alert." }, { status: error instanceof MemberError ? error.status : 503, headers }) }
}
