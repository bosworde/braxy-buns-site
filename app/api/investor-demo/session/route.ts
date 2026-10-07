import { NextRequest, NextResponse } from 'next/server'
import { configured, COOKIE, equal, token } from '@/lib/investor-demo/auth'
export const runtime = 'nodejs'
function sameOrigin(req: NextRequest) {
  try {
    const origin = new URL(req.headers.get('origin') || '')
    return ['http:', 'https:'].includes(origin.protocol) && origin.host === req.headers.get('host')
  } catch { return false }
}
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({error:'Invalid request origin.'},{status:403})
  if (!configured()) return NextResponse.json({error:'Investor access is not configured yet. Please contact Dennis.'},{status:503})
  let data
  try { data = await req.json() } catch { return NextResponse.json({error:'Invalid request.'},{status:400}) }
  if (typeof data.username !== 'string' || typeof data.password !== 'string' || data.username.length > 200 || data.password.length > 200) return NextResponse.json({error:'Invalid credentials.'},{status:400})
  if (!equal(data.username, process.env.INVESTOR_DEMO_USERNAME!) || !equal(data.password, process.env.INVESTOR_DEMO_PASSWORD!)) return NextResponse.json({error:'Username or password is incorrect.'},{status:401})
  const res = NextResponse.json({ok:true})
  res.cookies.set(COOKIE, token(), {httpOnly:true,secure:process.env.NODE_ENV === 'production',sameSite:'strict',path:'/investor-demo',maxAge:8*60*60})
  res.headers.set('Cache-Control','no-store')
  return res
}
export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({error:'Invalid request origin.'},{status:403})
  const res = NextResponse.json({ok:true})
  res.cookies.set(COOKIE,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/investor-demo',maxAge:0})
  return res
}
