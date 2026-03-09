
import Image from "next/image";
import SiteShell from "@/components/SiteShell";

export default function OurStory() {
  return (
    <SiteShell>
      <main className="min-h-screen">
        <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">

          {/* Page Header */}
          <div className="max-w-3xl">
            <div className="text-sm uppercase tracking-[0.25em] text-white/50">
              Our Story
            </div>

            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              The story behind Braxy Buns
            </h1>

            <p className="mt-6 text-lg leading-8 text-white/70">
              Braxy Buns Carwash began with a simple idea — build a premium
              express car wash that also creates real opportunities for
              neurodiverse individuals.
            </p>

            <p className="mt-4 text-white/70">
              Our mission is to combine high-quality car wash operations with a
              long-term commitment to inclusion, community impact, and
              meaningful employment.
            </p>
          </div>

          {/* Founder Section */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">

            {/* Dennis */}
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
              <Image
                src="/team/dennis1200.jpg"
                alt="Dennis Bosworth"
                width={500}
                height={500}
                className="mx-auto rounded-2xl"
              />

              <h3 className="mt-6 text-xl font-semibold">
                Dennis Bosworth
              </h3>

              <p className="text-white/60 text-sm">
                Founder
              </p>

              <p className="mt-4 text-sm text-white/70">
                Dennis founded Braxy Buns with the goal of building a premium
                express tunnel wash brand while creating opportunities for
                autistic and neurodiverse individuals across the country.
              </p>
            </div>

            {/* Jessica */}
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
              <Image
                src="/team/jessica1200.jpg"
                alt="Jessica Bosworth"
                width={500}
                height={500}
                className="mx-auto rounded-2xl"
              />

              <h3 className="mt-6 text-xl font-semibold">
                Jessica Bosworth
              </h3>

              <p className="text-white/60 text-sm">
                Co-Founder
              </p>

              <p className="mt-4 text-sm text-white/70">
                Jessica plays a key role in shaping the culture and community
                mission behind Braxy Buns and helps guide the company's
                long-term vision for growth and impact.
              </p>
            </div>

            {/* Braxton */}
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
              <Image
                src="/team/braxton1200.jpg"
                alt="Braxton"
                width={500}
                height={500}
                className="mx-auto rounded-2xl"
              />

              <h3 className="mt-6 text-xl font-semibold">
                Braxton Bosworth
              </h3>

              <p className="text-white/60 text-sm">
                The Inspiration Behind Braxy Buns
              </p>

              <p className="mt-4 text-sm text-white/70">
                Braxton’s story is the inspiration behind the mission of
                Braxy Buns. The company’s long-term goal is to help create
                thousands of meaningful jobs for autistic and neurodiverse
                individuals across the United States.
              </p>
            </div>

          </div>

          {/* Mission Section */}
          <div className="mt-20 max-w-3xl">
            <h2 className="text-2xl font-semibold">
              A bigger mission
            </h2>

            <p className="mt-4 text-white/70">
              As Braxy Buns expands into new communities, we plan to partner
              with local educators, autism organizations, and job coaches to
              create supportive employment opportunities.
            </p>

            <p className="mt-4 text-white/70">
              Our vision is to build a national brand that delivers a great
              customer experience while helping create thousands of meaningful
              careers for autistic and neurodiverse individuals.
            </p>
          </div>

        </section>
      </main>
    </SiteShell>
  );
}
