import { NextResponse } from "next/server";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodemailer = require("nodemailer");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, zip, type } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const isFoundingMember = type === "founding-member";

    await transporter.sendMail({
      from: `"Braxy Buns Website" <${process.env.EMAIL_USER}>`,
      to: "dennis@braxybuns.com",
      subject: isFoundingMember
        ? `New Founding Member Signup from ${name}`
        : `New Contact Form Submission from ${name}`,
      html: isFoundingMember
        ? `
          <h2>New Founding Member Signup</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>ZIP Code:</strong> ${zip || "Not provided"}</p>
        `
        : `
          <h2>New Website Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message || ""}</p>
        `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}