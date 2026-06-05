"use client";

import { useState } from "react";
import SiteShell from "@/components/SiteShell";

export default function InvestorMaterialsPage() {
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    if (password === "Braxy2026") {
      setAuthorized(true);
    } else {
      alert("Incorrect password");
    }
  }

  if (!authorized) {
    return (
      <SiteShell>
        <main className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <h1 className="text-3xl font-semibold text-white">
              Investor Materials
            </h1>

            <p className="mt-4 text-white/70">
              Authorized investors and lenders only.
            </p>

            <form onSubmit={handleLogin} className="mt-6">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
              />

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl py-3 font-semibold text-white"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg,#E40303,#FF8C00,#FFED00,#008026,#004DFF,#750787)",
                }}
              >
                Access Materials
              </button>
            </form>
          </div>
        </main>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <main className="min-h-screen px-6 py-16 text-white">
        <section className="mx-auto max-w-5xl">
          <h1 className="text-5xl font-semibold">
            Braxy Buns Investor Materials
          </h1>

          <p className="mt-4 text-white/70">
            Confidential materials for qualified investors, lenders, family
            offices, and strategic partners.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">
                Investor Presentation
              </h2>

              <p className="mt-3 text-white/70">
                Upload investor deck here.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">
                Financial Projections
              </h2>

              <p className="mt-3 text-white/70">
                Upload financial model here.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">
                Site Renderings
              </h2>

              <p className="mt-3 text-white/70">
                Upload renderings here.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-semibold">
                Capital Structure
              </h2>

              <p className="mt-3 text-white/70">
                Upload capital stack and waterfall here.
              </p>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}