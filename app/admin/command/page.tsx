import Link from "next/link"

const sections = [
  {
    title: "Founder Mode",
    href: "/admin/founder",
    description: "CEO dashboard, long-term goals, mission, and expansion vision.",
    tag: "Executive",
  },
  {
    title: "Investor Mode",
    href: "/admin/investor",
    description: "Capital raise, site economics, projections, and enterprise vision.",
    tag: "Investor",
  },
  {
    title: "Revenue Dashboard",
    href: "/admin/revenue",
    description: "MRR, ARR, membership mix, washes, and Braxy Bucks.",
    tag: "Money",
  },
  {
    title: "Operations Center",
    href: "/admin/operations",
    description: "Live wash activity, queue status, and daily operations.",
    tag: "Ops",
  },
  {
    title: "Members",
    href: "/admin/members",
    description: "View, edit, and manage members, plans, vehicles, and plates.",
    tag: "CRM",
  },
  {
    title: "Manual LPR",
    href: "/admin/lpr",
    description: "Look up plates, approve washes, prevent duplicate daily washes.",
    tag: "Tunnel",
  },
  {
    title: "Queue Dashboard",
    href: "/admin/queue",
    description: "Move cars from waiting to in-tunnel, completed, or rejected.",
    tag: "Queue",
  },
  {
    title: "Tunnel Screen",
    href: "/admin/tunnel-screen",
    description: "Big-screen employee view for tunnel operations.",
    tag: "Display",
  },
  {
    title: "Customer Screen",
    href: "/admin/customer-screen",
    description: "Customer-facing arrival screen with now serving and wait info.",
    tag: "Display",
  },
]

export default function CommandCenterPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
            Braxy Buns Admin
          </p>

          <h1 className="mt-2 text-5xl font-black">
            Command Center
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            One home base for the full Braxy Buns operating system.
          </p>
        </div>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-3xl border border-white/10 bg-white/10 p-6 transition hover:border-cyan-300 hover:bg-white/15"
            >
              <p className="inline-flex rounded-full bg-cyan-400 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-slate-950">
                {section.tag}
              </p>

              <h2 className="mt-5 text-3xl font-black">
                {section.title}
              </h2>

              <p className="mt-3 text-slate-400">
                {section.description}
              </p>
            </Link>
          ))}
        </section>

        <section className="rounded-3xl bg-yellow-300 p-8 text-slate-950">
          <p className="text-sm font-black uppercase tracking-[0.35em]">
            Braxy OS
          </p>

          <h2 className="mt-3 text-4xl font-black">
            Memberships. LPR. Queue. Revenue. Operations. Mission.
          </h2>

          <p className="mt-4 text-xl font-bold">
            Built for the most technologically advanced, mission-driven express car wash company in America.
          </p>
        </section>
      </div>
    </main>
  )
}