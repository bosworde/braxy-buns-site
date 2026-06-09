import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
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

    return NextResponse.json({
      plate,
      confidence,
    })
  } catch (error) {
    console.error("LPR scan error:", error)

    return NextResponse.json(
      { error: "Server error scanning plate." },
      { status: 500 }
    )
  }
}