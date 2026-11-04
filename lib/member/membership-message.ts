export function membershipMessage(status: string | null | undefined) {
  if (status === "active") return { badge: "ACTIVE", label: "Active", title: "Your wash pass is ready", description: "Your membership is active.", payment: false }
  if (["past_due", "unpaid", "incomplete"].includes(status || "")) return {
    badge: "PAYMENT NEEDED", label: "Payment needed", title: "Let’s get your wash pass back",
    description: "Your membership payment needs attention. Open secure billing to review the balance and update your payment method. Your pass becomes available once payment succeeds and your membership is active.", payment: true,
  }
  if (status === "payment_pending") return { badge: "PROCESSING", label: "Payment processing", title: "Your payment is still processing", description: "Your pass will appear once payment is confirmed. You can review billing below, then refresh your membership. You don’t need to sign up again.", payment: false }
  if (status === "verification_unavailable") return { badge: "CHECK NEEDED", label: "Verification temporarily unavailable", title: "We couldn’t verify your membership", description: "Please refresh in a moment. We can’t display a pass until your membership is verified. This doesn’t mean your subscription has been canceled.", payment: false }
  if (["cancelled", "canceled"].includes(status || "")) return { badge: "ENDED", label: "Canceled", title: "Your membership has ended", description: "Your wash pass is no longer available. Review your subscription in billing or explore membership options.", payment: false }
  if (status === "paused") return { badge: "PAUSED", label: "Paused", title: "Your membership is paused", description: "Your wash pass is unavailable while your membership is paused. Review your subscription in billing.", payment: false }
  return { badge: "INACTIVE", label: "Not active", title: "Your membership isn’t active", description: "An active, paid membership is required to use a wash pass. Review your billing or refresh to check your membership.", payment: false }
}
