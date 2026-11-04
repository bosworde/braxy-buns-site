import { ImageResponse } from "next/og"
export const size = { width: 512, height: 512 }
export const contentType = "image/png"
export default function Icon() {
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: "#061426", color: "#67e8f9", alignItems: "center", justifyContent: "center", flexDirection: "column", border: "28px solid #facc15", borderRadius: 100 }}><span style={{ fontSize: 145, fontWeight: 900 }}>BB</span><span style={{ fontSize: 32, color: "white", letterSpacing: 4 }}>WASH CLUB</span></div>, size)
}
