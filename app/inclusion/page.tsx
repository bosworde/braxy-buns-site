import Link from "next/link";
import SiteShell from "@/components/SiteShell";

const AUTISM_GRADIENT =
  "linear-gradient(90deg,#E40303 0%,#FF8C00 18%,#FFED00 34%,#008026 50%,#004DFF 68%,#750787 100%)";

export default function Inclusion() {
  return (
    <SiteShell>
      <main className="min-h-screen">
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              radial-gradient(900px 500px at 15% 0%, rgba(227,3,3,.14), transparent 60%),
              radial-gradient(800px 500px at 85% 10%, rgba(0,77,255,.14), transparent 60%),
              radial-gradient(700px 500px at 50% 100%, rgba(117,7,135,.12), transparent 60%)
            `,
          }}
        />

        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="max-w-3xl">
            <div
              className="inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundImage: AUTISM_GRADIENT }}
            >
              Braxy Buns Inclusion Initiative
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              Building a car wash brand with a bigger purpose
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/70">
              Braxy Buns is committed to creating meaningful employment
              opportunities for autistic and neurodiverse individuals as we grow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
              <h2 className="text-2xl font-semibold">Our commitment</h2>
              <div className="mt-6 space-y-6 text-white/70">
                <p>
                  Many talented individuals on the autism spectrum face barriers
                  to traditional employment. We believe businesses can help
                  change that.
                </p>

                <p>
                  As Braxy Buns grows, we are committed to building workplaces
                  where autistic and neurodiverse team members can succeed,
                  develop confidence, and take pride in their work.
                </p>

                <p className="text-xl font-semibold text-white">
                  Our long-term vision is to create thousands of meaningful jobs
                  for autistic and neurodiverse individuals across the United States.
                </p>

                <p>
                  Every new Braxy Buns location represents another opportunity
                  to expand that mission.
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
                <h3 className="text-xl font-semibold">What this means in practice</h3>
                <div className="mt-5 space-y-3 text-sm text-white/75">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    Inclusive hiring
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    Structured training
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    Local community partnerships
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    Scalable national opportunity
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
                <h3 className="text-xl font-semibold">Why it matters</h3>
                <p className="mt-4 text-white/70">
                  When customers support Braxy Buns, they are supporting a company
                  that wants to create a more inclusive workforce in every
                  community it serves.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}