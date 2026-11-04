import type { MetadataRoute } from "next"
export function GET() {
  const manifest: MetadataRoute.Manifest = {
    id: "/app", name: "Braxy Buns Wash Club", short_name: "Braxy Buns",
    description: "Your wash club, right in your pocket.", start_url: "/app", scope: "/app",
    display: "standalone", background_color: "#061426", theme_color: "#061426",
    icons: [{ src: "/app/icon", sizes: "512x512", type: "image/png", purpose: "any" }],
  }
  return Response.json(manifest, { headers: { "Content-Type": "application/manifest+json" } })
}
