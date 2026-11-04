import type Stripe from "stripe"
import type { SupabaseClient } from "@supabase/supabase-js"
import { MemberError } from "@/lib/member/server"
import { membershipState, objectId } from "./stripe"
export async function saveSubscription(db: SupabaseClient, subscription: Stripe.Subscription, email: string, token: string, eventId: string | null = null) {
  const state = membershipState(subscription)
  const { error } = await db.rpc("braxy_apply_subscription", {
    p_email: email, p_token: token, p_event_id: eventId,
    p_customer: objectId(subscription.customer), p_subscription: subscription.id,
    p_created: subscription.created, p_plan: state.plan, p_status: state.status,
    p_profile: subscription.metadata,
  })
  if (error) throw new MemberError("Membership synchronization needs another attempt.", 503)
  return state
}
