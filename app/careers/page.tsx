import SiteShell from "@/components/SiteShell";
import CareerInterestForm from "@/components/CareerInterestForm";

const opportunities = [
  {
    title: "Customer Experience Team",
    desc: "Friendly team members who welcome guests, help customers understand wash options, and support a positive experience.",
  },
  {
    title: "Vacuum Plaza Support",
    desc: "Team members who help keep the vacuum area clean, organized, safe, and customer-friendly.",
  },
  {
    title: "Tunnel Support",
    desc: "Operational team members who help with vehicle flow, wash quality checks, and site cleanliness.",
  },
  {
    title: "Neurodiverse Employment Pathways",
    desc: "Structured opportunities designed to help neurodiverse individuals build confidence, routine, skills, and purpose.",
  },
];

const commitments = [
  "Clear expectations and predictable routines",
  "Supportive training and patient leadership",
  "A positive, respectful work environment",
  "Opportunities for neurodiverse individuals to contribute meaningfully",
  "Team roles designed around strengths where possible",
  "A mission-first culture inspired by Braxton",
];

export default function CareersPage() {
  return (
    <SiteShell>
      <main className="min-h-screen px-6 py-16 text-white">
        <section className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.25em] text-white/50">
            Careers
          </p>

          <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">
            Meaningful Employment Starts Here
          </h1>

          <p className="mt-6 max-w-4xl text-lg text-white/70">
            Braxy Buns is being built to deliver a premium car wash experience
            while creating meaningful employment opportunities for neurodiverse
            individuals and team members who want to be part of something with
            purpose.
          </p>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-semibold">
              Our Employment Mission
            </h2>

            <p className="mt-4 text-white/70">
              Inspired by Braxton, Braxy Buns is designed around a simple belief:
              work can create dignity, confidence, routine, purpose, and belonging.
              We want to build a workplace where people are valued, trained,
              supported, and given the opportunity to contribute in meaningful ways.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-3xl font-semibold">
                Neurodiverse Hiring Commitment
              </h2>

              <p className="mt-4 text-white/70">
                Braxy Buns plans to create roles and training pathways that
                support neurodiverse individuals, including individuals with
                autism, by focusing on structure, encouragement, strengths,
                consistency, and clear expectations.
              </p>

              <p className="mt-4 text-white/70">
                Our goal is not just to create jobs, but to create a workplace
                where team members and families can feel proud of the opportunity,
                growth, and purpose being built.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-3xl font-semibold">
                What We Value
              </h2>

              <div className="mt-6 grid gap-3">
                {commitments.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-semibold">
              Future Career Opportunities
            </h2>

            <p className="mt-3 max-w-3xl text-white/70">
              As Braxy Buns moves toward opening, we expect to build a team
              across customer service, site operations, vacuum plaza support,
              tunnel support, and mission-driven employment pathways.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {opportunities.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-6"
                >
                  <h3 className="text-2xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-white/70">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-4xl font-semibold">
              Join the Braxy Buns Hiring Interest List
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-lg text-white/70">
              Interested in future employment opportunities, neurodiverse hiring
              pathways, or helping build the Braxy Buns team? Join the interest
              list and we will keep you updated as we get closer to opening.
            </p>

            <CareerInterestForm />
          </div>

          <p className="mt-8 text-center text-xs text-white/40">
            Braxy Buns is currently in the planning stage. Future roles,
            hiring timelines, responsibilities, and employment opportunities are
            subject to site selection, construction, opening timeline, and
            operational needs.
          </p>
        </section>
      </main>
    </SiteShell>
  );
}