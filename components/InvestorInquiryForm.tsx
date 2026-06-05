"use client";

import { useState } from "react";

export default function InvestorInquiryForm() {
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      type: "investor-inquiry",
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      firm: formData.get("firm"),
      investorType: formData.get("investorType"),
      message: formData.get("message"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed");
      }

      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-8 max-w-4xl"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Name"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
        />

        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
        />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input
          name="phone"
          placeholder="Phone Number"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
        />

        <input
          name="firm"
          placeholder="Firm / Company"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
        />
      </div>

      <div className="mt-4">
        <select
          name="investorType"
          defaultValue=""
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
        >
          <option value="" disabled>
            Select Investor Type
          </option>

          <option value="Individual Investor">
            Individual Investor
          </option>

          <option value="Family Office">
            Family Office
          </option>

          <option value="Private Equity">
            Private Equity
          </option>

          <option value="Lender / Bank">
            Lender / Bank
          </option>

          <option value="Broker / Advisor">
            Broker / Advisor
          </option>

          <option value="Strategic Partner">
            Strategic Partner
          </option>
        </select>
      </div>

      <div className="mt-4">
        <textarea
          name="message"
          rows={6}
          placeholder="Tell us about your interest in the Braxy Buns flagship project"
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 w-full rounded-2xl px-6 py-4 font-semibold text-white disabled:opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#E40303,#FF8C00,#FFED00,#008026,#004DFF,#750787)",
        }}
      >
        {status === "sending"
          ? "Sending..."
          : "Request Investor Information"}
      </button>

      {status === "sent" && (
        <p className="mt-4 text-center text-green-300">
          Thank you. Your investor inquiry has been received.
        </p>
      )}

      {status === "error" && (
        <p className="mt-4 text-center text-red-300">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}