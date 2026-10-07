import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const COOKIE = 'braxy_investor_demo'
export function configured() {
  return Boolean(process.env.INVESTOR_DEMO_USERNAME && (process.env.INVESTOR_DEMO_PASSWORD?.length || 0) >= 16 && (process.env.INVESTOR_DEMO_SESSION_SECRET?.length || 0) >= 32)
}
function signature(value: string) {
  return createHmac('sha256', process.env.INVESTOR_DEMO_SESSION_SECRET || '').update(value).digest('hex')
}
export function equal(a: string, b: string) {
  const x = Buffer.from(a); const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}
export function token() {
  const expires = String(Date.now() + 8 * 60 * 60 * 1000)
  return `${expires}.${signature(expires)}`
}
export async function authorized() {
  if (!configured()) return false
  const value = (await cookies()).get(COOKIE)?.value || ''
  const [expires, sig, extra] = value.split('.')
  return !extra && Number(expires) > Date.now() && Number(expires) <= Date.now() + 8 * 60 * 60 * 1000 && equal(sig || '', signature(expires || ''))
}
