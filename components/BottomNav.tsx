"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/membership", label: "Membership" },
    { href: "/qr-pass", label: "QR Pass" },
    { href: "/account", label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-700 bg-slate-950/95 px-2 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-3xl justify-around">
        {links.map((link) => {
          const active = pathname === link.href

          return (
            <Link
              key={link.href}
              href={link.href}
              className={
                active
                  ? "rounded-xl bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950"
                  : "px-3 py-2 text-sm font-semibold text-slate-300"
              }
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}