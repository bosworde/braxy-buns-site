import SiteShell from "@/components/SiteShell";
import FoundingMemberForm from "@/components/FoundingMemberForm";

const features = [
  "120+ Foot Premium Express Tunnel",
  "18 Free Vacuum Stations",
  "License Plate Recognition",
  "Smart Tunnel Controls",
  "Enhanced Drying Technology",
  "Unlimited Wash Club",
  "Future Mobile App",
  "Neurodiverse Employment Mission",
];

export default function FutureLocationPage() {
  return (
    <SiteShell>
      <main className="min-h-screen px-6 py-16 text-white">
        <section className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.25em] text-white/50">
            Flagship Location
          </p>

          <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">
            Our Planned Flagship Location
          </h1>

          <p className="mt-6 max-w-4xl text-lg text-white/70">
            A premium express tunnel car wash planned for Fulshear, Texas —
            combining advanced wash technology, exceptional customer experience,
            and meaningful employment opportunities for neurodiverse individuals.
          </p>

          <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
            <img
              src="/team/future-location-rendering.png"
              alt="Future Braxy Buns Car Wash rendering"
              className="w-full rounded-3xl object-cover"
            />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-2xl font-bold">120+</div>
              <div className="text-sm text-white/70">Foot Premium Tunnel</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-2xl font-bold">18</div>
              <div className="text-sm text-white/70">Free Vacuum Stations</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-2xl font-bold">LPR</div>
              <div className="text-sm text-white/70">
                License Plate Recognition
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
              <div className="text-2xl font-bold">∞</div>
              <div className="text-sm text-white/70">Unlimited Wash Club</div>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">Why Fulshear</h2>
              <p className="mt-4 text-white/70">
                Fulshear is one of the fastest-growing communities in Texas,
                supported by strong household income, major master-planned
                developments, and increasing traffic along key corridors.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">Flagship Design</h2>
              <p className="mt-4 text-white/70">
                Braxy Buns is being designed around a 120+ foot premium express
                tunnel, 18 free vacuum stations, advanced drying technology,
                and a frictionless customer experience.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">Built With Purpose</h2>
              <p className="mt-4 text-white/70">
                Inspired by Braxton, our mission is to create meaningful
                employment opportunities for neurodiverse individuals while
                delivering a premium car wash experience.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-semibold">
              Planned Facility Features
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center font-medium"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-3xl font-semibold">
              Public Development Roadmap
            </h2>

            <div className="mt-8 grid gap-6 md:grid-cols-4">
              <div>
                <h3 className="text-xl font-semibold">2026</h3>
                <p className="mt-2 text-white/70">
                  Site selection, planning, engineering, and development
                  preparation.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold">Design & Permitting</h3>
                <p className="mt-2 text-white/70">
                  Final layout, permitting, engineering, and construction
                  planning.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold">Construction</h3>
                <p className="mt-2 text-white/70">
                  Tunnel construction, equipment installation, vacuum plaza, and
                  customer experience buildout.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold">Grand Opening</h3>
                <p className="mt-2 text-white/70">
                  Hiring, training, founding memberships, and community launch.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <h2 className="text-4xl font-semibold">
              Be Part of the Beginning
            </h2>

            <p className="mx-auto mt-4 max-w-3xl text-lg text-white/70">
              Join our founding member list to receive updates, grand opening
              announcements, and future membership opportunities.
            </p>

            <FoundingMemberForm />
          </div>

          <p className="mt-8 text-center text-xs text-white/40">
            Renderings are conceptual and subject to final site selection,
            engineering, permitting, and design modifications.
          </p>
        </section>
      </main>
    </SiteShell>
  );
}