import type { Metadata, Viewport } from "next"
import MemberApp from "./MemberApp"
import { preopening } from "@/lib/member/launch"
export const metadata: Metadata = {
  title: "Member App",
  description: "Your Braxy Buns membership, wash pass, rewards, and vehicle in one place.",
  manifest: "/app/manifest.webmanifest",
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Braxy Buns", statusBarStyle: "default" },
}
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#061426" }
export default function Page() { return <MemberApp preopening={preopening()} /> }
