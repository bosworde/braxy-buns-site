import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  return NextResponse.json({
    ok: true,
    env: {
      ZOHO_USER: process.env.ZOHO_USER ? "SET" : "MISSING",
      ZOHO_PASS: process.env.ZOHO_PASS ? "SET" : "MISSING",
      ZOHO_TO: process.env.ZOHO_TO ? "SET" : "MISSING",
    },
  });
}

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: name, email, message" },
        { status: 400 }
      );
    }

    const user = process.env.ZOHO_USER!;
    const pass = process.env.ZOHO_PASS!;
    const to = process.env.ZOHO_TO || user;

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Braxy Buns Website" <${user}>`,
      to,
      replyTo: email,
      subject: subject || "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("CONTACT API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
