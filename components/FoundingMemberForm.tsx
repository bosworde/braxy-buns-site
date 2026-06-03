"use client";

import { useState } from "react";

export default function FoundingMemberForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      type: "founding-member",
      name: formData.get("name"),
      email: formData.get("email"),
      zip: formData.get("zip"),
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
    <form onSubmit={handleSubmit} className="mx-auto mt-8 grid max-w-3xl gap-3 md:grid-cols-4">
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

      <input
        name="zip"
        placeholder="ZIP Code"
        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40"
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
        {status === "sending" ? "Sending..." : "Join List"}
      </button>

      {status === "sent" && (
        <p className="md:col-span-4 text-center text-sm text-green-300">
          You’re on the list. Thank you for joining the Braxy Buns founding member interest list.
        </p>
      )}

      {status === "error" && (
        <p className="md:col-span-4 text-center text-sm text-red-300">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}