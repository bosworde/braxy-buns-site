import SiteShell from "@/components/SiteShell";

const highlights = [
  "Premium 120+ foot express tunnel concept",
  "Planned Fulshear, Texas flagship location",
  "Mission-driven neurodiverse employment focus",
  "Unlimited Wash Club membership model",
  "License plate recognition and smart tunnel technology",
  "Founder-led brand with personal mission and community purpose",
];

const sections = [
  {
    title: "Why Braxy Buns",
    desc: "Braxy Buns is being built as a premium express tunnel car wash brand with a purpose-driven mission: deliver an exceptional customer experience while creating meaningful employment opportunities for neurodiverse individuals.",
  },
  {
    title: "Why Fulshear",
    desc: "The planned flagship location is focused on the Fulshear, Texas market — a growing community with strong residential development, family-oriented neighborhoods, and demand for convenient premium services.",
  },
  {
    title: "Mission + Business",
    desc: "The brand combines modern car wash operations with a deeply personal mission inspired by Braxton, creating a story that can resonate with customers, employees, lenders, investors, and the community.",
  },
];

export default function InvestorsPage() {
  return (
    <SiteShell>
      <main className="min-h-screen px-6 py-16 text-white">
        <section className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.25em] text-white/50">
            Investor Inquiries
          </p>

          <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">
            Building a Premium Car Wash Brand With Purpose
          </h1>

          <p className="mt-6 max-w-4xl text-lg text-white/70">
            Braxy Buns Car Wash is planning its first flagship express tunnel
            location in the Fulshear, Texas area. This page is intended for
            qualified investors, lenders, brokers, and strategic partners who
            want to learn more about the project.
          </p>

          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <img
              src="/team/future-location-rendering.png"
              alt="Braxy Buns planned flagship rendering"
              className="w-full"
            />
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {sections.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6"
              >
                <h2 className="text-2xl font-semibold">{item.title}</h2>
                <p className="mt-4 text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-semibold">Project Highlights</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/80"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-semibold">
              Private Investor Materials
            </h2>

            <p className="mt-4 text-white/70">
              Detailed financial projections, capital structure, financing
              assumptions, investor terms, and offering materials are not posted
              publicly. These materials may be shared privately with qualified
              parties after an introduction and appropriate review.
            </p>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-4xl font-semibold">
              Request Investor Information
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-lg text-white/70">
              To request more information, please contact Dennis directly.
            </p>

            <a
              href="mailto:dennis@braxybuns.com?subject=Braxy%20Buns%20Investor%20Inquiry"
              className="mt-8 inline-block rounded-2xl px-8 py-4 text-lg font-semibold text-white"
              style={{
                backgroundImage:
                  "linear-gradient(90deg,#E40303,#FF8C00,#FFED00,#008026,#004DFF,#750787)",
              }}
            >
              Contact Dennis
            </a>
          </div>

          <p className="mt-8 text-center text-xs text-white/40">
            This page is informational only and is not an offer to sell or a
            solicitation of an offer to buy securities. Any investment
            opportunity, if available, would be made only through appropriate
            private materials and applicable legal documentation.
          </p>
        </section>
      </main>
    </SiteShell>
  );
}