import SiteShell from "@/components/SiteShell"

export default function ContactPage() {
  return (
    <SiteShell>
      <main className="min-h-screen bg-[#061426] px-6 py-20 text-white">
        <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-yellow-300">
            Contact
          </p>

          <h1 className="text-4xl font-black">Contact Braxy Buns</h1>

          <p className="mt-4 text-white/75">
            For founding member pricing, investor interest, careers, or general questions,
            contact us below.
          </p>

          <div className="mt-8 space-y-4 text-lg">
            <p>
              <strong>Email:</strong>{" "}
              <a className="text-yellow-300" href="mailto:dennis@braxybuns.com">
                dennis@braxybuns.com
              </a>
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              <a className="text-yellow-300" href="tel:7133057841">
                (713) 305-7841
              </a>
            </p>

            <p>
              <strong>Location:</strong> Fulshear, TX
            </p>
          </div>
        </section>
      </main>
    </SiteShell>
  )
}