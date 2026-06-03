"use client";

import { useState } from "react";

export default function CareerInterestForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      type: "career-interest",
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      area: formData.get("area"),
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");

      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 grid max-w-4xl gap-3">
      <div className="grid gap-3 md:grid-cols-2">
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

      <div className="grid gap-3 md:grid-cols-2">
        <input
          name="phone"
          placeholder="Phone"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
        />

        <select
          name="area"
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white"
          defaultValue=""
        >
          <option value="" disabled>
            Area of Interest
          </option>
          <option value="Customer Experience">Customer Experience</option>
          <option value="Vacuum Plaza Support">Vacuum Plaza Support</option>
          <option value="Tunnel Support">Tunnel Support</option>
          <option value="Neurodiverse Employment Pathway">
            Neurodiverse Employment Pathway
          </option>
          <option value="General Interest">General Interest</option>
        </select>
      </div>

      <textarea
        name="message"
        placeholder="Tell us a little about your interest"
        className="min-h-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
      />

      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-2xl px-6 py-3 font-semibold text-white disabled:opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#E40303,#FF8C00,#FFED00,#008026,#004DFF,#750787)",
        }}
      >
        {status === "sending" ? "Sending..." : "Join Hiring Interest List"}
      </button>

      {status === "sent" && (
        <p className="text-center text-sm text-green-300">
          Thank you. We received your career interest form.
        </p>
      )}

      {status === "error" && (
        <p className="text-center text-sm text-red-300">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}