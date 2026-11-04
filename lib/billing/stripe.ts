import Stripe from "stripe"
import { MemberError } from "@/lib/member/server"
export const priceMap: Record<string, string> = {
  "Gecko Wash Club": "price_1TezMO193rp9H3JHdrEW84XD",
  "Iguana Wash Club": "price_1TezNT193rp9H3JHptxSYLaJ",
  "Dragon Wash Club": "price_1TezO8193rp9H3JHyzHPvkOH",
}
export function prices() {
  return {
    "Gecko Wash Club": process.env.STRIPE_GECKO_PRICE_ID || priceMap["Gecko Wash Club"],
    "Iguana Wash Club": process.env.STRIPE_IGUANA_PRICE_ID || priceMap["Iguana Wash Club"],
    "Dragon Wash Club": process.env.STRIPE_DRAGON_PRICE_ID || priceMap["Dragon Wash Club"],
  } as Record<string, string>
}
export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new MemberError("Billing is temporarily unavailable.", 503)
  if (process.env.VERCEL_ENV !== "production" && /^(sk|rk)_live_/.test(key)) {
    throw new MemberError("Use Stripe test mode for this preview. Live billing is disabled here.", 503)
  }
  if (process.env.VERCEL_ENV === "production") {
    if (!/^(sk|rk)_live_/.test(key) || !process.env.STRIPE_GECKO_PRICE_ID || !process.env.STRIPE_IGUANA_PRICE_ID || !process.env.STRIPE_DRAGON_PRICE_ID) {
      throw new MemberError("Live billing is not configured yet. Please contact the team.", 503)
    }
  }
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 15000 })
}
export function siteOrigin() {
  const value = process.env.VERCEL_ENV === "preview" && (process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL)
    ? `https://${process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL}` : process.env.NEXT_PUBLIC_SITE_URL || "https://braxybuns.com"
  const url = new URL(value)
  if (url.protocol !== "https:" && url.hostname !== "localhost") throw new MemberError("Billing configuration needs attention.", 503)
  return url.origin
}
export function objectId(value: string | { id: string } | null | undefined) { return typeof value === "string" ? value : value?.id || null }
export function membershipState(subscription: Stripe.Subscription) {
  const items = subscription.items.data
  const plan = items.length === 1 ? Object.entries(prices()).find(([, price]) => price === items[0].price.id)?.[0] : undefined
  // Unsupported prices, trials, and paused collections do not grant a paid wash pass.
  const paid = typeof subscription.latest_invoice === "object" && subscription.latest_invoice?.status === "paid"
  const status = !plan ? "inactive" : subscription.pause_collection ? "paused" : subscription.status === "canceled" ? "cancelled" : subscription.status === "active" && !paid ? "payment_pending" : subscription.status
  return { plan: plan || "Prospect", status: status === "active" ? "active" : status }
}
