type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "Basic",
    price: "$24.99/mo",
    description: "A fast, reliable premium tunnel wash for everyday shine.",
    features: ["Exterior wash", "Dry", "Free vacuums"],
    cta: "Join Basic",
  },
  {
    name: "Plus",
    price: "$34.99/mo",
    description:
      "Extra finish and detail for drivers who want a deeper clean and brighter finish.",
    features: ["Everything in Basic", "Wheel clean", "Tire shine", "Spot-free rinse"],
    cta: "Join Plus",
  },
  {
    name: "Max",
    price: "$44.99/mo",
    description:
      "Our premium unlimited plan with top-tier protection and the best overall value.",
    features: ["Everything in Plus", "Ceramic protectant", "Premium finish", "Best value"],
    cta: "Join Max",
    featured: true,
  },
];

export default function BraxyBunsMembershipSections() {
  return (
    <section id="club" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
          Unlimited Wash Club
        </p>
        <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">
          Choose the plan that fits your shine
        </h2>
        <p className="mt-4 text-base text-white/70">
          Simple monthly pricing, premium wash quality, and fast access every time you visit.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-[2rem] p-8 shadow-sm ring-1 ${
              plan.featured
                ? "bg-white text-slate-900 ring-white"
                : "bg-white/5 text-white ring-white/10 backdrop-blur"
            }`}
          >
            {plan.featured ? (
              <div className="mb-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                Most Popular
              </div>
            ) : null}

            <h3 className="text-2xl font-semibold">{plan.name}</h3>
            <p className={`mt-2 text-sm ${plan.featured ? "text-slate-600" : "text-white/70"}`}>
              {plan.description}
            </p>

            <p className="mt-6 text-4xl font-semibold">{plan.price}</p>

            <div className="mt-6 space-y-2">
              {plan.features.map((feature) => (
                <div
                  key={feature}
                  className={`text-sm ${plan.featured ? "text-slate-700" : "text-white/80"}`}
                >
                  • {feature}
                </div>
              ))}
            </div>

            <a
              href="/join"
              className={`mt-6 inline-flex rounded-2xl px-5 py-3 text-sm font-semibold ${
                plan.featured
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-900"
              }`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}