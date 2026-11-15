import Link from 'next/link'

export const metadata = { title: 'Delete your account | Braxy Buns Car Wash' }

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <article className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold">Delete your Braxy Buns account</h1>
        <p>To request deletion online, email Braxy Buns support from the email address you use to sign in. Include “Delete my Braxy Buns account” in the subject. We’ll verify your request before removing your account.</p>
        <a className="inline-block rounded-lg bg-cyan-300 px-4 py-3 font-semibold text-slate-950" href="mailto:dennis@braxybuns.com?subject=Delete%20my%20Braxy%20Buns%20account">Request account deletion</a>
        <p>You can also delete your pre-opening account from the Account screen in the Braxy Buns mobile app. Deletion removes your sign-in account, saved name, preferred club, and vehicle details. If you have a linked wash membership, contact support so we can review any records that need to be retained.</p>
        <Link href="/privacy" className="text-cyan-300 underline">Braxy Buns privacy notice</Link>
      </article>
    </main>
  )
}
