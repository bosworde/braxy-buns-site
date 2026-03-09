"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";

const AUTISM_GRADIENT =
  "linear-gradient(90deg,#E40303 0%,#FF8C00 18%,#FFED00 34%,#008026 50%,#004DFF 68%,#750787 100%)";

const LOGO_SRC = "/braxy-buns-logo.png";
const FALLBACK_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' width='760' height='240' viewBox='0 0 760 240'>
    <defs>
      <linearGradient id='g' x1='0' x2='1'>
        <stop offset='0' stop-color='#E40303'/>
        <stop offset='0.18' stop-color='#FF8C00'/>
        <stop offset='0.34' stop-color='#FFED00'/>
        <stop offset='0.50' stop-color='#008026'/>
        <stop offset='0.68' stop-color='#004DFF'/>
        <stop offset='1' stop-color='#750787'/>
      </linearGradient>
    </defs>
    <rect x='0' y='0' width='760' height='240' rx='28' fill='#061426'/>
    <rect x='16' y='16' width='728' height='208' rx='22' fill='none' stroke='url(#g)' stroke-width='6' opacity='0.9'/>
    <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='44' fill='white'>
      BRAXY BUNS CARWASH
    </text>
  </svg>
  `);

const nav = [
  { label: "Home", href: "/" },
  { label: "Unlimited Club", href: "/#club" },
  { label: "Our Story", href: "/our-story" },
  { label: "Inclusion", href: "/inclusion" },
  { label: "Careers", href: "/careers" },
  { label: "Founder’s Letter", href: "/founders-letter" },
  { label: "Contact", href: "/#contact" },
];

function classNames(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function Logo() {
  return (
    <motion.div
      className="relative rounded-2xl"
      animate={{ y: [0, -2, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        aria-hidden="true"
        className="absolute -inset-[8px] rounded-[2.25rem] blur-xl opacity-65"
        style={{
          backgroundImage: AUTISM_GRADIENT,
          maskImage:
            "radial-gradient(60% 60% at 50% 50%, black 40%, transparent 82%)",
        }}
      />

      <div className={classNames("relative overflow-hidden rounded-2xl")}>
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-y-10 -left-1/2 w-[140%] rotate-[-10deg] opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 35%, rgba(255,255,255,0.04) 60%, transparent 100%)",
          }}
          animate={{ x: ["-35%", "35%", "-35%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <img
          src={LOGO_SRC}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
          }}
          alt="Braxy Buns Carwash"
          className="h-16 w-auto object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)] sm:h-20"
        />
      </div>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 text-white">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold">Braxy Buns Carwash</div>
            <p className="mt-2 text-sm text-white/70">
              Premium express tunnel wash with free vacuums.
            </p>
          </div>
          <div className="grid gap-2 text-sm">
            {nav.map((i) => (
              <Link key={i.href} href={i.href} className="text-white/70 hover:text-white">
                {i.label}
              </Link>
            ))}
          </div>
          <div className="text-sm">
            <div className="text-white/70">Contact</div>
            <div className="mt-2 grid gap-1">
              <div>(713) 305 7841</div>
              <div>dennis@braxybuns.com</div>
              <div className="text-white/70">
                © {new Date().getFullYear()} Braxy Buns Carwash. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: "#061426" }}>
      <div className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#061426]/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-white">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
          </Link>

          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {nav.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      href={item.href}
                      className="rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                      {item.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/join" className="hidden sm:block">
              <Button
                className="rounded-2xl text-white ring-1 ring-white/10"
                style={{ backgroundImage: AUTISM_GRADIENT }}
              >
                Join Unlimited Club
              </Button>
            </Link>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 md:hidden"
                >
                  Menu
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-2xl">
                <DialogHeader>
                  <DialogTitle>Navigate</DialogTitle>
                  <DialogDescription>Jump to a page.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-2">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm hover:bg-accent"
                    >
                      {item.label}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  ))}
                  <Link href="/join">
                    <Button className="mt-2 w-full rounded-2xl">Join Unlimited Club</Button>
                  </Link>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {children}

      <Footer />
    </div>
  );
}