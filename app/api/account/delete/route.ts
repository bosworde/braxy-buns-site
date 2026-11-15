import { NextResponse } from 'next/server'
import { ADMIN_EMAILS, authenticatedUser, MemberError } from '@/lib/member/server'
import { preopening } from '@/lib/member/launch'

const headers = { 'Cache-Control': 'private, no-store' }

export async function POST(request: Request) {
  try {
    const { db, user, email } = await authenticatedUser(request)
    const input = await request.json().catch(() => null)
    if (input?.confirm !== 'DELETE') throw new MemberError('Confirm deletion before continuing.', 400)
    if (!preopening() || ADMIN_EMAILS.includes(email)) {
      throw new MemberError('Please contact Braxy Buns support to delete this account.', 409)
    }
    const { data: membership, error: lookupError } = await db.from('members').select('id').eq('email', email).limit(1)
    if (lookupError) throw new MemberError('We couldn’t check your account. Please try again.', 503)
    if (membership.length) throw new MemberError('Please contact Braxy Buns support to delete your account and review the linked wash membership.', 409)

    const token = request.headers.get('authorization')!.replace(/^Bearer /i, '')
    const { error: revokeError } = await db.auth.admin.signOut(token, 'global')
    if (revokeError) throw new MemberError('We couldn’t securely close your sessions. Please try again.', 503)
    // The pre-opening profile is removed by the foreign key cascade.
    const { error } = await db.auth.admin.deleteUser(user.id)
    if (error) throw new MemberError('Deletion couldn’t be completed. Sign in again to retry or contact support.', 503)
    return NextResponse.json({ deleted: true }, { headers })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof MemberError ? error.message : 'Account deletion is temporarily unavailable.' },
      { status: error instanceof MemberError ? error.status : 503, headers },
    )
  }
}
