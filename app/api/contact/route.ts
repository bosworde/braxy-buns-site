import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const runtime = "nodejs"

const nodemailer = require("nodemailer")

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
)

function getLeadSource(type: string | undefined) {
  if (type === "founding-member") return "Founding Member"
  if (type === "career-interest") return "Careers"
  if (type === "investor-inquiry") return "Investor"
  return "Contact Form"
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      name,
      email,
      message,
      zip,
      type,
      phone,
      area,
      firm,
      investorType,
    } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      )
    }

    const isFoundingMember = type === "founding-member"
    const isCareerInterest = type === "career-interest"
    const isInvestorInquiry = type === "investor-inquiry"

    const leadSource = getLeadSource(type)

    const leadNotes = [
      message ? `Message: ${message}` : null,
      zip ? `ZIP: ${zip}` : null,
      area ? `Area of Interest: ${area}` : null,
      firm ? `Firm / Company: ${firm}` : null,
      investorType ? `Investor Type: ${investorType}` : null,
    ]
      .filter(Boolean)
      .join("\n")

    await supabase.from("leads").insert({
      name,
      email,
      phone: phone || null,
      source: leadSource,
      status: "New",
      notes: leadNotes || null,
    })

    const subject = isFoundingMember
      ? `New Founding Member Signup from ${name}`
      : isCareerInterest
      ? `New Career Interest Form Submission from ${name}`
      : isInvestorInquiry
      ? `New Investor Inquiry from ${name}`
      : `New Contact Form Submission from ${name}`

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
      : isInvestorInquiry
      ? `
        <h2>New Investor Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
        <p><strong>Firm / Company:</strong> ${firm || "Not provided"}</p>
        <p><strong>Investor Type:</strong> ${investorType || "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${message || ""}</p>
      `
      : `
        <h2>New Website Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message || ""}</p>
      `

    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Braxy Buns Website" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || "dennis@braxybuns.com",
      subject,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Contact route error:", error)

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    )
  }
}