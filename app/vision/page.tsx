import SiteShell from "@/components/SiteShell";

export default function VisionPage() {
  return (
    <SiteShell>
      <main className="min-h-screen px-6 py-16 text-white">
        <section className="mx-auto max-w-5xl">
          <p className="text-sm uppercase tracking-[0.25em] text-white/50">
            Vision & Impact
          </p>

          <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">
            Premium Car Wash Technology. Purpose-Driven Mission.
          </h1>

          <p className="mt-6 max-w-3xl text-lg text-white/70">
            Braxy Buns is being built to deliver a premium express tunnel car
            wash experience while creating meaningful employment opportunities
            for neurodiverse individuals.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {[
              {
                title: "Inspired by Braxton",
                desc: "Braxy Buns was inspired by our son Braxton and our family’s desire to create opportunities, purpose, and dignity through meaningful work.",
              },
              {
                title: "Neurodiverse Employment",
                desc: "Our goal is to build a workplace where neurodiverse individuals can contribute, grow, and feel valued as part of the team.",
              },
              {
                title: "Premium Wash Technology",
                desc: "Planned features include license plate recognition, smart tunnel controls, enhanced drying technology, a future mobile app, and free vacuums.",
              },
              {
                title: "Built for Fulshear",
                desc: "Braxy Buns is being planned for the Fulshear, Texas area with a focus on convenience, quality, community, and long-term impact.",
              },
              {
                title: "Community Impact",
                desc: "Braxy Buns plans to support autism-focused organizations, local families, and community programs that align with our mission.",
              },
              {
                title: "Growth Vision",
                desc: "Our long-term vision is to build a scalable brand that combines premium car wash operations with purpose-driven employment.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <h2 className="text-2xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-3xl font-semibold">Our Public Roadmap</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div>
                <h3 className="font-semibold">Now</h3>
                <p className="mt-2 text-sm text-white/70">
                  Brand development, site planning, community outreach, and
                  preparation for the first Braxy Buns location.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Next</h3>
                <p className="mt-2 text-sm text-white/70">
                  Final site selection, design, permitting, construction
                  planning, and local partnership development.
                </p>
              </div>

              <div>
                <h3 className="font-semibold">Future</h3>
                <p className="mt-2 text-sm text-white/70">
                  Grand opening, team hiring and training, customer memberships,
                  mobile experience, and community impact programs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}