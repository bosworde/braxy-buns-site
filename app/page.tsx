"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  MapPin,
  Sparkles,
  ShieldCheck,
  Timer,
  Droplets,
  CreditCard,
  Phone,
  Mail,
  HeartHandshake,
  Leaf,
  ChevronRight,
  Star,
  Check,
} from "lucide-react";

/**
 * Braxy Buns Carwash — single-page marketing site
 *
 * IMPORTANT (why you still don't see the logo):
 * In many previews (including this canvas), there is no real `/public` folder being served.
 * So a path like `/braxy-buns-logo.png` may 404.
 *
 * Fix: We embed the logo as a data-URI so it renders instantly everywhere.
 * When you move this into your real site later, you can switch back to:
 *   <img src={LOGO_SRC} ... />
 * and place the file at /public/braxy-buns-logo.png.
 */

// Logo handling:
// In a real Next.js app, put the PNG in /public and this will work.
// For previews that don't serve /public, we include a safe SVG fallback.
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

const brand = {
  name: "Braxy Buns Carwash",
  tagline: "Premium tunnel + self-serve bays. Fast, spotless, and friendly.",
  phone: "(281) 555-0199",
  email: "hello@braxybuns.com",
  addressLine: "Fulshear, TX",
  ctaPrimary: "Join Unlimited Wash Club",
  ctaSecondary: "Get Directions",
  mission:
    "We’re building a cleaner ride and a kinder community—supporting autism programs through local partnerships and monthly give-backs.",
};

const nav = [
  { label: "Services", href: "#services" },
  { label: "Unlimited Club", href: "#club" },
  { label: "Locations", href: "#locations" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const services = [
  {
    title: "Premium Tunnel Wash",
    desc: "Soft-touch + high-pressure blend, ceramic protectant, spot-free rinse.",
    icon: Sparkles,
    bullets: ["Ceramic sealant option", "Wheel + tire treatment", "Spot-free finish"],
  },
  {
    title: "Self-Serve Bays",
    desc: "Total control—high-pressure foam, rinse, wax, and vacuums.",
    icon: Droplets,
    bullets: ["Foam cannon", "High-pressure rinse", "Powerful vacs"],
  },
  {
    title: "Fast, Safe, Consistent",
    desc: "Modern equipment, trained staff, and clear wash-quality checks.",
    icon: ShieldCheck,
    bullets: ["Paint-safe process", "Daily equipment checks", "Friendly attendants"],
  },
  {
    title: "In & Out in Minutes",
    desc: "Designed for busy schedules—with easy entry + quick lane flow.",
    icon: Timer,
    bullets: ["Express lane", "Clear signage", "Quick checkout"],
  },
];

const clubTiers = [
  {
    name: "Basic",
    price: "$24.99",
    per: "/mo",
    highlight: "Best for weekly washers",
    features: [
      "Unlimited washes",
      "Basic tunnel package",
      "Free vacuums",
      "License plate recognition",
    ],
  },
  {
    name: "Plus",
    price: "$34.99",
    per: "/mo",
    highlight: "Most popular",
    featured: true,
    features: [
      "Everything in Basic",
      "Ceramic protectant",
      "Wheel + tire shine",
      "Spot-free rinse",
    ],
  },
  {
    name: "Max",
    price: "$44.99",
    per: "/mo",
    highlight: "Showroom shine",
    features: [
      "Everything in Plus",
      "Graphene/ceramic top coat",
      "Triple foam polish",
      "Priority lane (when available)",
    ],
  },
];

const locations = [
  {
    name: "Braxy Buns — Fulshear",
    address: "1093 Corridor (Coming Soon)",
    hours: "Mon–Sun: 7:00a–9:00p",
    note: "Grand Opening specials + autism partnership launch.",
  },
  {
    name: "Future Site",
    address: "Within 10 miles of Fulshear (In Planning)",
    hours: "TBD",
    note: "Want Braxy Buns near you? Tell us your intersection.",
  },
];

const testimonials = [
  {
    name: "Jason B.",
    quote:
      "Fastest wash I’ve ever used—car looks brand new and the staff is awesome.",
    rating: 5,
  },
  {
    name: "Herb P.",
    quote:
      "Unlimited club is a no-brainer. Spot-free finish every time. Great vacs too.",
    rating: 5,
  },
  {
    name: "Alyssa R.",
    quote:
      "Love the community give-back focus. Clean car and a great mission.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How does the Unlimited Wash Club work?",
    a: "Sign up once, then wash as often as you want. Entry uses license plate recognition (or a windshield tag) for quick access.",
  },
  {
    q: "Is the tunnel wash safe for my paint?",
    a: "We use a paint-safe process with regular equipment checks and trained attendants. If you have special concerns (matte wrap, new ceramic, etc.), ask an attendant for the best option.",
  },
  {
    q: "What forms of payment do you accept?",
    a: "All major credit/debit cards are accepted. Some locations may support mobile pay.",
  },
  {
    q: "How do you support autism programs?",
    a: "We partner with local organizations for monthly give-backs and awareness events. A portion of select promotions supports autism services and community resources.",
  },
];

const AUTISM_GRADIENT =
  "linear-gradient(90deg,#E40303 0%,#FF8C00 18%,#FFED00 34%,#008026 50%,#004DFF 68%,#750787 100%)";

// Brand background colors (high-end deep navy)
const INK = "#061426";
const INK_2 = "#071b33";
const INK_3 = "#0a2b4b";

// --- Favicon + Social preview (Next.js example) ---
// Place these files in /public:
//   /favicon.ico
//   /icon.png
//   /apple-touch-icon.png
//   /og-image.png   (1200x630)
//   /twitter-image.png (1200x630)
// Then add tags in your <head> (Next.js: app/layout.tsx or pages/_document.tsx):
//   <link rel="icon" href="/favicon.ico" />
//   <meta property="og:image" content="/og-image.png" />
//   <meta name="twitter:image" content="/twitter-image.png" />

function classNames(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function Logo({
  variant,
}: {
  variant: "nav" | "hero";
}) {
  const isNav = variant === "nav";
  return (
    <motion.div
      className={classNames(
        "relative",
        isNav ? "rounded-2xl" : "rounded-[2.75rem]"
      )}
      animate={{ y: isNav ? [0, -2, 0] : [0, -6, 0] }}
      transition={{ duration: isNav ? 5.5 : 6.5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Autism-gradient halo rim */}
      <div
        aria-hidden="true"
        className={classNames(
          "absolute -inset-[10px] rounded-[2.9rem] blur-2xl opacity-70",
          isNav && "-inset-[8px] rounded-[2.25rem] blur-xl opacity-65"
        )}
        style={{
          backgroundImage: AUTISM_GRADIENT,
          maskImage:
            "radial-gradient(60% 60% at 50% 50%, black 40%, transparent 82%)",
        }}
      />

      <div
        className={classNames(
          "relative overflow-hidden",
          isNav ? "rounded-2xl" : "rounded-[2.75rem]"
        )}
      >
        {/* Subtle glossy sweep */}
        <motion.div
          aria-hidden="true"
          className={classNames(
            "pointer-events-none absolute -inset-y-10 -left-1/2 w-[140%] rotate-[-10deg]",
            isNav ? "opacity-25" : "opacity-30"
          )}
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
          alt={brand.name}
          className={classNames(
            "w-auto object-contain",
            // responsive + prominent
            isNav
              ? "h-16 sm:h-20 drop-shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
              : "w-full max-w-[20rem] sm:max-w-3xl md:max-w-5xl drop-shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
          )}
        />
      </div>
    </motion.div>
  );
}

function GradientButton({
  children,
  className,
  variant,
  ...props
}: React.ComponentProps<typeof Button> & { variant?: any }) {
  if (variant) {
    return (
      <Button variant={variant} className={className} {...props}>
        {children}
      </Button>
    );
  }
  return (
    <Button
      className={classNames(
        "relative overflow-hidden text-white shadow-[0_18px_60px_rgba(0,0,0,0.35)]",
        "ring-1 ring-white/10",
        className
      )}
      style={{ backgroundImage: AUTISM_GRADIENT }}
      {...props}
    >
      {/* Gloss highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.10) 25%, transparent 55%)",
          mixBlendMode: "soft-light",
        }}
      />
      {/* Shimmer sweep on hover */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-8 -left-1/2 w-[140%] rotate-[-12deg] opacity-0 transition-opacity duration-300 group-hover:opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 35%, rgba(255,255,255,0.12) 60%, transparent 100%)",
        }}
      />
      <span className="relative z-10">{children}</span>
    </Button>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={classNames(
            "h-4 w-4",
            i < rating ? "fill-current" : "opacity-30"
          )}
        />
      ))}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center text-white">
      <div className="mb-3 flex items-center justify-center gap-2">
        <Badge variant="secondary" className="rounded-full bg-white/10 px-3 py-1 text-white">
          {eyebrow}
        </Badge>
      </div>
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {desc ? <p className="mt-3 text-base text-white/70">{desc}</p> : null}
    </div>
  );
}

function TopNav() {
  return (
    <div className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#061426]/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-white">
        <a href="#top" className="flex items-center gap-2">
          <Logo variant="nav" />
        </a>

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
          <a href="#club" className="hidden sm:block">
            <GradientButton className="group rounded-2xl">{brand.ctaPrimary}</GradientButton>
          </a>

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
                <DialogDescription>Jump to a section.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-2">
                {nav.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm hover:bg-accent"
                  >
                    {item.label}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                ))}
                <a href="#club">
                  <Button className="mt-2 w-full rounded-2xl">{brand.ctaPrimary}</Button>
                </a>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `
            radial-gradient(1000px 520px at 12% 0%, rgba(227,3,3,.18), transparent 60%),
            radial-gradient(900px 520px at 88% 20%, rgba(0,77,255,.18), transparent 60%),
            radial-gradient(900px 520px at 55% 100%, rgba(117,7,135,.16), transparent 60%),
            linear-gradient(180deg, ${INK} 0%, ${INK_2} 55%, ${INK_3} 100%)
          `.trim(),
        }}
      />

      {/* Subtle grid + noise overlay for a premium finish */}
      <div
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(60% 55% at 50% 35%, black 55%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.08]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%2260%22 height=%2260%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')",
        }}
      />
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 text-white sm:py-20">
        <div className="relative mb-10 flex justify-center">
          {/* Animated shine streak behind the logo */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-24 top-1/2 h-10 -translate-y-1/2 rotate-[-8deg] blur-2xl"
            style={{
              backgroundImage:
                "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.08) 65%, transparent 100%)",
            }}
            animate={{ x: ["-30%", "30%", "-30%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-10 -inset-y-8 rounded-[2.25rem] opacity-80"
            style={{
              backgroundImage: AUTISM_GRADIENT,
              filter: "blur(34px)",
              maskImage: "radial-gradient(60% 50% at 50% 50%, black 40%, transparent 85%)",
            }}
          />

          <Logo variant="hero" />
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Badge className="rounded-full bg-white/10 text-white" variant="secondary">
              Now planning near {brand.addressLine}
            </Badge>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              <span
                className="inline-block bg-clip-text text-transparent"
                style={{ backgroundImage: AUTISM_GRADIENT }}
              >
                A cleaner car in minutes
              </span>
              <span className="text-white"> —</span>
              <span className="block text-white/80">with a mission behind it.</span>
            </h1>
            <p className="mt-4 text-base text-white/75 sm:text-lg">
              {brand.tagline} Join the Unlimited Wash Club for the best value and the
              quickest way back to a spotless ride.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#club">
                <GradientButton className="group w-full rounded-2xl sm:w-auto">
                  {brand.ctaPrimary}
                </GradientButton>
              </a>
              <a href="#locations">
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {brand.ctaSecondary}
                </Button>
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4" /> Premium Wash
                </div>
                <p className="mt-1 text-xs text-white/70">Ceramic options + spot-free finish</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4" /> Unlimited Club
                </div>
                <p className="mt-1 text-xs text-white/70">Best value for weekly+ washers</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <HeartHandshake className="h-4 w-4" /> Autism Give-Back
                </div>
                <p className="mt-1 text-xs text-white/70">Local partnerships + events</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Grand Opening Specials</CardTitle>
                <CardDescription className="text-white/70">
                  Placeholder offers — swap these for your actual promos.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[{ t: "1st Month Club", b: "$10 off", d: "New members only. Cancel anytime after first month." },
                  { t: "Free Vacuums", b: "Always", d: "High-suction bays with easy access." },
                  { t: "Community Day", b: "Give-back", d: "A portion of proceeds supports local autism resources." },
                ].map((x) => (
                  <div key={x.t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{x.t}</div>
                      <Badge className="rounded-full bg-white/10 text-white">{x.b}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-white/70">{x.d}</p>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <div className="text-xs text-white/70">Questions? Call {brand.phone}</div>
                <a href="#contact" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
                  >
                    Contact us
                  </Button>
                </a>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Services"
        title="Built like the best tunnel washes — with self-serve flexibility"
        desc="Premium equipment, consistent results, and clear options for any kind of driver."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <Card
            key={s.title}
            className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{s.title}</CardTitle>
                  <CardDescription className="mt-1 text-white/70">{s.desc}</CardDescription>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5">
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4" />
                    <span className="text-white/70">{b}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Add-ons that matter</CardTitle>
            <CardDescription className="text-white/70">
              Upsell without pressure: clear choices, clear benefits.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Ceramic Protectant", icon: Sparkles },
              { title: "Wheel + Tire Shine", icon: ShieldCheck },
              { title: "Spot-Free Rinse", icon: Droplets },
              { title: "Interior Vacuums", icon: Timer },
            ].map((x) => (
              <div
                key={x.title}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
                  <x.icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">{x.title}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">For fleets & businesses</CardTitle>
            <CardDescription className="text-white/70">
              Set up volume plans for company vehicles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">
              We can structure monthly billing, multi-vehicle discounts, and reporting—perfect
              for service fleets and sales teams.
            </p>
          </CardContent>
          <CardFooter>
            <a href="#contact" className="w-full">
              <Button className="w-full rounded-2xl">Request a fleet quote</Button>
            </a>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

function Club() {
  return (
    <section id="club" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Unlimited Wash Club"
        title="Wash as often as you want — one simple monthly price"
        desc="Choose a plan that fits your schedule. Upgrade or cancel anytime."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {clubTiers.map((t) => (
          <Card
            key={t.name}
            className={classNames(
              "rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur",
              t.featured && "ring-1 ring-white/20"
            )}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{t.name}</CardTitle>
                {t.featured ? (
                  <Badge className="rounded-full text-white" style={{ backgroundImage: AUTISM_GRADIENT }}>
                    Most popular
                  </Badge>
                ) : null}
              </div>
              <CardDescription className="text-white/70">{t.highlight}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-semibold">{t.price}</div>
                <div className="pb-1 text-sm text-white/70">{t.per}</div>
              </div>
              <ul className="mt-5 grid gap-2">
                {t.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4" />
                    <span className="text-white/70">{f}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <GradientButton className="w-full rounded-2xl">Join {t.name}</GradientButton>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Easy entry, no hassle</CardTitle>
            <CardDescription className="text-white/70">
              Unlimited members use license plate recognition for quick access.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {["Sign up", "Scan plate", "Wash anytime"].map((x, i) => (
              <div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/70">Step {i + 1}</div>
                <div className="mt-1 text-sm font-medium">{x}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Gift cards</CardTitle>
            <CardDescription className="text-white/70">Perfect for teens, parents, and busy friends.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-white/70">
              Offer digital + physical options at checkout. Add a simple redemption flow with
              unique codes.
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Buy gift cards
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

function Locations() {
  return (
    <section id="locations" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Locations"
        title="Find a Braxy Buns near you"
        desc="Add your real addresses, embedded maps, and live hours here."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {locations.map((l) => (
          <Card key={l.name} className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">{l.name}</CardTitle>
              <CardDescription className="text-white/70">{l.address}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span className="text-white/70">{l.hours}</span>
              </div>
              <p className="text-sm text-white/70">{l.note}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <GradientButton className="w-full rounded-2xl">Directions</GradientButton>
              <Button
                variant="outline"
                className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Save
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium">Want a location near you?</div>
            <div className="text-sm text-white/70">Tell us your cross streets and we’ll consider it.</div>
          </div>
          <a href="#contact">
            <GradientButton className="mt-3 rounded-2xl sm:mt-0">Suggest a site</GradientButton>
          </a>
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="About"
        title="A premium wash that gives back"
        desc="Modern wash quality, consistent operations, and community partnerships."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Our mission</CardTitle>
            <CardDescription className="text-white/70">
              Clean cars. Better days. Stronger community support.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-white/70">{brand.mission}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[{ t: "Give-back events", i: HeartHandshake, d: "Monthly partner days + awareness." },
                { t: "Responsible process", i: Leaf, d: "Smart chemistry + water management." },
                { t: "Quality checks", i: ShieldCheck, d: "Consistent results and care." },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <x.i className="h-4 w-4" /> {x.t}
                  </div>
                  <p className="mt-1 text-xs text-white/70">{x.d}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="text-xs text-white/70">Interested in partnering? Let’s talk.</div>
            <a href="#contact">
              <Button
                variant="outline"
                className="rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                Partner with us
              </Button>
            </a>
          </CardFooter>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">What people say</CardTitle>
            <CardDescription className="text-white/70">Swap these with real reviews once you’re live.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {testimonials.slice(0, 2).map((t) => (
              <div key={t.name} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{t.name}</div>
                  <Stars rating={t.rating} />
                </div>
                <p className="mt-2 text-sm text-white/70">“{t.quote}”</p>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <a href="#reviews" className="w-full">
              <GradientButton className="w-full rounded-2xl">See more reviews</GradientButton>
            </a>
          </CardFooter>
        </Card>
      </div>

      <div id="reviews" className="mt-10 grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.name} className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{t.name}</CardTitle>
                <Stars rating={t.rating} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">“{t.quote}”</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader eyebrow="FAQ" title="Quick answers" desc="Everything you need to know before you pull in." />

      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`item-${i}`}
              className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-white"
            >
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-white/70">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Contact() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sent");
    window.setTimeout(() => setStatus("idle"), 4000);
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Contact"
        title="Let’s get you washed up"
        desc="Questions, partnerships, fleet plans, or location suggestions—send a note."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Send a message</CardTitle>
            <CardDescription className="text-white/70">We reply quickly during business hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Name" required className="rounded-2xl" />
                <Input placeholder="Phone or Email" required className="rounded-2xl" />
              </div>
              <Input placeholder="Subject" className="rounded-2xl" />
              <Textarea placeholder="How can we help?" required className="min-h-[120px] rounded-2xl" />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-white/70">By submitting, you agree we may contact you about your request.</div>
                <GradientButton className="rounded-2xl" type="submit">
                  Send message
                </GradientButton>
              </div>
              {status === "sent" ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                  ✅ Message sent (demo). Connect this form to your email service.
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Reach us</CardTitle>
            <CardDescription className="text-white/70">Add your real business contact details.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              { k: "Phone", v: brand.phone, I: Phone },
              { k: "Email", v: brand.email, I: Mail },
              { k: "Area", v: brand.addressLine, I: MapPin },
            ].map((x) => (
              <div key={x.k} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5">
                  <x.I className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs text-white/70">{x.k}</div>
                  <div className="text-sm font-medium">{x.v}</div>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <a href="#locations" className="w-full">
              <Button
                variant="outline"
                className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                View locations
              </Button>
            </a>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}

function MobileCTA() {
  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 px-4 sm:hidden">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#061426]/70 p-2 backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          <a href="#club">
            <GradientButton className="group w-full rounded-2xl">{brand.ctaPrimary}</GradientButton>
          </a>
          <a href="#contact">
            <Button
              variant="outline"
              className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Contact
            </Button>
          </a>
        </div>
        <div className="mt-2 text-center text-[11px] text-white/70">
          Community give-back: autism partnerships + monthly events
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10 text-white">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold">{brand.name}</div>
            <p className="mt-2 text-sm text-white/70">{brand.tagline}</p>
          </div>
          <div className="grid gap-2 text-sm">
            {nav.map((i) => (
              <a key={i.href} href={i.href} className="text-white/70 hover:text-white">
                {i.label}
              </a>
            ))}
          </div>
          <div className="text-sm">
            <div className="text-white/70">Contact</div>
            <div className="mt-2 grid gap-1">
              <div>{brand.phone}</div>
              <div>{brand.email}</div>
              <div className="text-white/70">© {new Date().getFullYear()} {brand.name}. All rights reserved.</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function BraxyBunsCarwashSite() {
  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: INK }}>
      <TopNav />
      <MobileCTA />
      <main>
        <Hero />
        <Services />
        <Club />
        <Locations />
        <About />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
