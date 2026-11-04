// Paid production launch requires an explicit release configuration.
export function preopening() {
  return process.env.BRAXY_PREOPENING === "true" || (process.env.VERCEL_ENV === "production" && process.env.BRAXY_PAID_LAUNCH !== "true")
}
