import type Stripe from "stripe"
import type { SupabaseClient } from "@supabase/supabase-js"
import { objectId } from "./stripe"
export const riskEvents = new Set(["charge.refunded", "charge.dispute.created", "radar.early_fraud_warning.created"])
export async function recordRiskAlert(db: SupabaseClient, stripe: Stripe, event: Stripe.Event) {
  const obj = event.data.object as Stripe.Charge | Stripe.Dispute | Stripe.Radar.EarlyFraudWarning
  const chargeId = event.type === "charge.refunded" ? obj.id : objectId((obj as Stripe.Dispute).charge)
  if (!chargeId) throw new Error("Risk event has no charge")
  const charge = await stripe.charges.retrieve(chargeId)
  const intent = objectId(charge.payment_intent)
  const subscriptions = new Set<string>()
  if (intent) {
    // A PaymentIntent can fund multiple invoices. Resolve through Stripe's object graph, not metadata.
    for await (const payment of stripe.invoicePayments.list({ payment: { type: "payment_intent", payment_intent: intent }, status: "paid", limit: 100 })) {
      const invoiceId = objectId(payment.invoice)
      if (!invoiceId) continue
      const invoice = await stripe.invoices.retrieve(invoiceId)
      const subscriptionId = objectId(invoice.parent?.subscription_details?.subscription)
      if (subscriptionId) subscriptions.add(subscriptionId)
    }
  }
  const message = event.type === "charge.refunded"
    ? "Refund recorded in Stripe. Review the affected membership and refund terms."
    : event.type === "charge.dispute.created"
      ? "Payment disputed. Review evidence deadlines and membership access in Stripe."
      : "Early fraud warning. Review the payment and membership in Stripe."
  const { error } = await db.from("braxy_operational_alerts").upsert({
    id: event.id, kind: event.type, resource_id: charge.id,
    customer_id: objectId(charge.customer), subscription_ids: [...subscriptions], message,
  }, { onConflict: "id", ignoreDuplicates: true })
  if (error) throw new Error("Could not save billing review alert")
}
export async function recordSyncFailure(db: SupabaseClient, event: Stripe.Event) {
  const { error } = await db.from("braxy_operational_alerts").upsert({
    id: `sync:${event.id}`, kind: "billing.sync_failed", resource_id: event.id,
    message: "Membership synchronization failed. Stripe will retry; inspect this event in Stripe Workbench.", resolved_at: null,
  }, { onConflict: "id" })
  if (error) console.error("Could not persist billing failure alert", { eventId: event.id })
}
export async function resolveSyncFailure(db: SupabaseClient, eventId: string) {
  const { error } = await db.from("braxy_operational_alerts").update({ resolved_at: new Date().toISOString() }).eq("id", `sync:${eventId}`)
  if (error) throw new Error("Could not resolve billing failure alert")
}
