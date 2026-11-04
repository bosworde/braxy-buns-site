import { NextResponse } from "next/server"
import { authenticatedAdmin, MemberError } from "@/lib/member/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    await authenticatedAdmin(req)
    const apiKey = process.env.PLATE_RECOGNIZER_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing PLATE_RECOGNIZER_API_KEY. Add it in Vercel environment variables.",
        },
        { status: 500 }
      )
    }

    const formData = await req.formData()
    const image = formData.get("image")

    if (!image || !(image instanceof File)) {
      return NextResponse.json(
        { error: "No image uploaded." },
        { status: 400 }
      )
    }

    if (image.size > 10 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
      return NextResponse.json({ error: "Upload a JPEG, PNG, or WebP image under 10 MB." }, { status: 400 })
    }

    const plateForm = new FormData()
    plateForm.append("upload", image)

    const response = await fetch(
      "https://api.platerecognizer.com/v1/plate-reader/",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
        },
        body: plateForm,
        signal: AbortSignal.timeout(15000),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: result?.detail || "Plate scan failed." },
        { status: response.status }
      )
    }

    const plate = result?.results?.[0]?.plate || ""
    const confidence = result?.results?.[0]?.score || 0

    if (result?.results?.length !== 1 || confidence < 0.9) {
      return NextResponse.json({ error: "Plate is uncertain or multiple plates were detected. Confirm the plate manually before lookup." }, { status: 422 })
    }

    return NextResponse.json({
      plate,
      confidence,
    })
  } catch (error) {
    if (error instanceof MemberError) return NextResponse.json({ error: error.message }, { status: error.status })

    return NextResponse.json(
      { error: "Server error scanning plate." },
      { status: 500 }
    )
  }
}