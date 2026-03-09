"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type PlanKey = "basic" | "plus" | "max";

const plans = {
  basic: {
    name: "Basic",
    price: "$24.99/mo",
    description: "A fast, reliable premium tunnel wash for everyday shine.",
    features: ["Exterior wash", "Dry", "Free vacuums"],
  },
  plus: {
    name: "Plus",
    price: "$34.99/mo",
    description: "Extra finish and detail for drivers who want a deeper clean and brighter finish.",
    features: ["Everything in Basic", "Wheel clean", "Tire shine", "Spot-free rinse"],
  },
  max: {
    name: "Max",
    price: "$44.99/mo",
    description: "Our premium unlimited plan with top-tier protection and the best overall value.",
    features: ["Everything in Plus", "Ceramic protectant", "Premium finish", "Best value"],
  },
};

const AUTISM_GRADIENT =
  "linear-gradient(90deg,#E40303 0%,#FF8C00 18%,#FFED00 34%,#008026 50%,#004DFF 68%,#750787 100%)";

export default function JoinPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("plus");
  const [submitted, setSubmitted] = useState(false);

  const selected = useMemo(() => plans[selectedPlan], [selectedPlan]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              Braxy Buns Unlimited Wash Club
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Start your membership in minutes
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">
              Choose your plan, enter your vehicle details, and continue to secure checkout.
              This page is built to become your real Braxy Buns signup funnel.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {(["basic", "plus", "max"] as PlanKey[]).map((key) => {
                const plan = plans[key];
                const active = selectedPlan === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPlan(key)}
                    className={`rounded-[1.5rem] border p-5 text-left transition ${
                      active
                        ? "border-white bg-white text-slate-900 shadow-xl"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold">{plan.name}</h2>
                      {key === "plus" ? (
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            active
                              ? "bg-slate-900 text-white"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          Popular
                        </span>
                      ) : null}
                    </div>
                    <p className={`mt-3 text-3xl font-semibold ${active ? "text-slate-900" : "text-white"}`}>
                      {plan.price}
                    </p>
                    <p className={`mt-3 text-sm leading-6 ${active ? "text-slate-600" : "text-white/70"}`}>
                      {plan.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">What’s included in {selected.name}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {selected.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                  >
                    • {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <div
              className="mb-6 rounded-[1.5rem] p-[1px]"
              style={{ backgroundImage: AUTISM_GRADIENT }}
            >
              <div className="rounded-[1.45rem] bg-slate-950 px-5 py-4">
                <p className="text-sm text-white/60">Selected plan</p>
                <div className="mt-1 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold">{selected.name}</p>
                    <p className="text-sm text-white/70">{selected.price}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
                    Monthly Membership
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold">Member Details</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Use this as your live lead form now, then connect it to Stripe or your wash system next.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="text-white/80">First Name</span>
                  <input
                    required
                    name="firstName"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-white/30"
                    placeholder="Dennis"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-white/80">Last Name</span>
                  <input
                    required
                    name="lastName"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-white/30"
                    placeholder="Bosworth"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm">
                <span className="text-white/80">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-white/30"
                  placeholder="you@example.com"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="text-white/80">Mobile Number</span>
                  <input
                    required
                    name="mobile"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-white/30"
                    placeholder="(713) 555-1212"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-white/80">License Plate</span>
                  <input
                    required
                    name="plate"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 uppercase text-white outline-none placeholder:text-white/35 focus:border-white/30"
                    placeholder="ABC1234"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span className="text-white/80">State</span>
                  <input
                    required
                    name="state"
                    maxLength={2}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 uppercase text-white outline-none placeholder:text-white/35 focus:border-white/30"
                    placeholder="TX"
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-white/80">Vehicle Color</span>
                  <input
                    name="vehicleColor"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-white/30"
                    placeholder="Black"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-4 text-sm text-white/60">
                Secure payment step goes here next. This can become Stripe Checkout,
                Washify, DRB, or another membership provider.
              </div>

              <button
                type="submit"
                className="mt-2 rounded-2xl px-6 py-4 text-sm font-semibold text-white shadow-xl transition hover:opacity-95"
                style={{ backgroundImage: AUTISM_GRADIENT }}
              >
                Continue to Secure Checkout
              </button>

              {submitted ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  Demo mode: your form is working. Next step is wiring this to Stripe or your wash membership system.
                </div>
              ) : null}

              <p className="text-xs leading-5 text-white/50">
                By continuing, you agree to recurring monthly billing until you cancel or change your plan.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}