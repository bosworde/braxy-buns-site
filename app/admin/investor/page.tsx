"use client"

import Link from "next/link"

export default function InvestorPage() {
  const equityTarget = 2600000
  const raised = 0
  const remaining = equityTarget - raised

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-cyan-300">
              Investor Mode
            </p>

            <h1 className="mt-2 text-5xl font-black">
              Braxy Buns Investor Dashboard
            </h1>

            <p className="mt-2 text-slate-400">
              Capital raise progress, site economics, projections, and growth vision.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/founder" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Founder
            </Link>

            <Link href="/admin/revenue" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Revenue
            </Link>

            <Link href="/admin/operations" className="rounded-xl bg-white/10 px-5 py-3 font-bold">
              Operations
            </Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <Stat title="Equity Target" value="$2.6M" />
          <Stat title="Raised" value={`$${raised.toLocaleString()}`} />
          <Stat title="Remaining" value={`$${remaining.toLocaleString()}`} />
          <Stat title="Investor Count" value="0" />
        </section>

        <section className="rounded-3xl bg-white/10 p-6">
          <h2 className="text-3xl font-black">Flagship Site Economics</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric title="Tunnel Length" value="120 ft" />
            <Metric title="Vacuum Stalls" value="18" />
            <Metric title="Land Requirement" value="1.5–2.0 Acres" />
            <Metric title="Equipment Budget" value="$2.0M" />
            <Metric title="Location" value="Fulshear, TX" />
            <Metric title="Model" value="Express Tunnel" />
            <Metric title="Membership Focus" value="Recurring Revenue" />
            <Metric title="Technology" value="LPR + App + QR" />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <ProjectionCard
            title="Stabilized Site"
            revenue="$2.0M+"
            ebitda="$800K+"
          />

          <ProjectionCard
            title="5 Locations"
            revenue="$10M+"
            ebitda="$4M+"
          />

          <ProjectionCard
            title="25 Locations"
            revenue="$50M+"
            ebitda="$20M+"
          />
        </section>

        <section className="rounded-3xl bg-white/10 p-6">
          <h2 className="text-3xl font-black">Enterprise Vision</h2>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-4">Locations</th>
                  <th className="py-4">Revenue</th>
                  <th className="py-4">EBITDA</th>
                  <th className="py-4">Estimated Enterprise Value</th>
                  <th className="py-4">Employment Impact</th>
                </tr>
              </thead>

              <tbody>
                <Row
                  locations="1"
                  revenue="$2M+"
                  ebitda="$800K+"
                  value="$8M–12M"
                  impact="5–10 Neurodiverse Team Members"
                />

                <Row
                  locations="5"
                  revenue="$10M+"
                  ebitda="$4M+"
                  value="$40M–60M"
                  impact="50+ Jobs"
                />

                <Row
                  locations="25"
                  revenue="$50M+"
                  ebitda="$20M+"
                  value="$200M–300M"
                  impact="250+ Jobs"
                />

                <Row
                  locations="100"
                  revenue="$200M+"
                  ebitda="$80M+"
                  value="$800M+"
                  impact="1,000+ Jobs"
                />
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-3xl bg-cyan-400 p-10 text-slate-950">
          <h2 className="text-4xl font-black">
            Braxy Buns Mission
          </h2>

          <p className="mt-6 text-2xl font-bold">
            Build the most technologically advanced,
            mission-driven express car wash company in America.
          </p>

          <p className="mt-6 text-xl font-black">
            God First. We Second. Children Third.
          </p>
        </section>
      </div>
    </main>
  )
}

function Stat({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-white/10 p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-3xl font-black text-cyan-300">
        {value}
      </p>
    </div>
  )
}

function Metric({
  title,
  value,
}: {
  title: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-slate-950/60 p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-xl font-black">
        {value}
      </p>
    </div>
  )
}

function ProjectionCard({
  title,
  revenue,
  ebitda,
}: {
  title: string
  revenue: string
  ebitda: string
}) {
  return (
    <div className="rounded-3xl bg-white/10 p-6">
      <h2 className="text-3xl font-black">
        {title}
      </h2>

      <div className="mt-6 space-y-3">
        <p>
          <span className="text-slate-400">Revenue:</span> {revenue}
        </p>

        <p>
          <span className="text-slate-400">EBITDA:</span> {ebitda}
        </p>
      </div>
    </div>
  )
}

function Row({
  locations,
  revenue,
  ebitda,
  value,
  impact,
}: {
  locations: string
  revenue: string
  ebitda: string
  value: string
  impact: string
}) {
  return (
    <tr className="border-b border-white/10">
      <td className="py-4">{locations}</td>
      <td className="py-4">{revenue}</td>
      <td className="py-4">{ebitda}</td>
      <td className="py-4 text-cyan-300 font-black">{value}</td>
      <td className="py-4">{impact}</td>
    </tr>
  )
}