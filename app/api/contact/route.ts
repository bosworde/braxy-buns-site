import { NextResponse } from "next/server";

export const runtime = "nodejs";

const nodemailer = require("nodemailer");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, message, zip, type, phone, area } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const isFoundingMember = type === "founding-member";
    const isCareerInterest = type === "career-interest";

    const subject = isFoundingMember
      ? `New Founding Member Signup from ${name}`
      : isCareerInterest
      ? `New Career Interest Form Submission from ${name}`
      : `New Contact Form Submission from ${name}`;

    const html = isFoundingMember
      ? `
        <h2>New Founding Member Signup</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>ZIP Code:</strong> ${zip || "Not provided"}</p>
      `
      : isCareerInterest
      ? `
        <h2>New Career Interest Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Area of Interest:</strong> ${area || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${message || ""}</p>
      `
      : `
        <h2>New Website Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message || ""}</p>
      `;

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Braxy Buns Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || "dennis@braxybuns.com",
      subject,
      html,
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