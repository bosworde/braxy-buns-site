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
import BraxyBunsMembershipSections from "@/components/BraxyBunsMembershipSections_fixed";
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

const LOGO_SRC = "/logo.png";



const brand = {
  name: "Braxy Buns Carwash",
  tagline:
    "Braxy Buns is being designed as one of the most advanced express tunnel car washes in Texas, featuring license plate recognition, smart tunnel controls, enhanced drying technology, free vacuums, and a future mobile app experience.",
  phone: "(713) 305 7841",
  email: "dennis@braxybuns.com",
  addressLine: "Fulshear, TX",
  ctaPrimary: "Reserve Founding Member Pricing",
  ctaSecondary: "Get Directions",
  mission:
    "Inspired by our son Braxton, our mission is to create meaningful employment opportunities for neurodiverse individuals while delivering an exceptional customer experience.",
};

const nav = [
  { label: "Services", href: "#services" },
  { label: "Technology", href: "#technology" },
  { label: "Future Location", href: "/future-location" },
  { label: "Investors", href: "/investors" },
  { label: "Locations", href: "#locations" },
  { label: "Our Story", href: "/our-story" },
  { label: "Vision", href: "/vision" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "#contact" },
];

const services = [
  {
    title: "Premium 120+ Foot Tunnel Wash",
    desc: "A premium express tunnel experience designed for improved cleaning, longer dwell time, stronger drying, shine, and speed.",
    icon: Sparkles,
    bullets: ["Extended dwell time", "Enhanced drying zone", "Ceramic protection"],
  },
  {
    title: "18 Free Vacuum Stations",
    desc: "Powerful vacuums and detail space so every customer can finish their clean.",
    icon: Droplets,
    bullets: ["Always free", "High suction power", "Detail-friendly layout"],
  },
  {
    title: "Fast, Safe, Consistent",
    desc: "Modern equipment, trained staff, and clear wash-quality checks.",
    icon: ShieldCheck,
    bullets: ["Paint-safe process", "Daily equipment checks", "Friendly attendants"],
  },
  {
    title: "LPR Enabled Membership Access",
    desc: "Designed for busy schedules with quick lane flow and planned license plate recognition.",
    icon: Timer,
    bullets: ["Fast member entry", "Contactless access", "Quick checkout"],
  },
];

const locations = [
  {
    name: "Braxy Buns — Fulshear",
    address: "1093 Corridor (Coming Soon)",
    hours: "Planned hours to be announced",
    note: "Planned flagship location with founding member offers and community partnerships.",
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
    quote: "Fastest wash I’ve ever used—car looks brand new and the staff is awesome.",
    rating: 5,
  },
  {
    name: "Herb P.",
    quote: "Unlimited club is a no-brainer. Spot-free finish every time. Great vacs too.",
    rating: 5,
  },
  {
    name: "Alyssa R.",
    quote: "Love the community give-back focus. Clean car and a great mission.",
    rating: 5,
  },
];

const faqs = [
  {
    q: "How does the Unlimited Wash Club work?",
    a: "Sign up once, then wash as often as you want. Entry is planned to use license plate recognition or another membership access method for quick entry.",
  },
  {
    q: "Will Braxy Buns have a mobile app?",
    a: "Yes. The Braxy Buns mobile app is planned to allow customers to manage memberships, purchase washes, receive rewards, and access promotions.",
  },
  {
    q: "What makes the Braxy Buns tunnel different?",
    a: "Braxy Buns is planning a 120+ foot premium express tunnel with smart tunnel controls, improved dwell time, enhanced drying, and 18 free vacuum stations.",
  },
  {
    q: "Is the tunnel wash safe for my paint?",
    a: "We are designing the wash process around modern equipment, trained attendants, regular quality checks, and a paint-safe customer experience.",
  },
  {
    q: "How do you support autism programs?",
    a: "Braxy Buns plans to create meaningful employment opportunities for neurodiverse individuals and support local autism-focused organizations through partnerships, awareness events, and give-backs.",
  },
];

const AUTISM_GRADIENT =
  "linear-gradient(90deg,#E40303 0%,#FF8C00 18%,#FFED00 34%,#008026 50%,#004DFF 68%,#750787 100%)";

const INK = "#061426";
const INK_2 = "#071b33";
const INK_3 = "#0a2b4b";

function classNames(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function Logo({ variant }: { variant: "nav" | "hero" }) {
  const isNav = variant === "nav";

  return (
    <motion.div
      className={classNames("relative", isNav ? "rounded-2xl" : "rounded-[2.75rem]")}
      animate={{ y: isNav ? [0, -2, 0] : [0, -6, 0] }}
      transition={{ duration: isNav ? 5.5 : 6.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        aria-hidden="true"
        className={classNames(
          "absolute -inset-[10px] rounded-[2.9rem] blur-2xl opacity-70",
          isNav && "-inset-[8px] rounded-[2.25rem] blur-xl opacity-65"
        )}
        style={{
          backgroundImage: AUTISM_GRADIENT,
          maskImage: "radial-gradient(60% 60% at 50% 50%, black 40%, transparent 82%)",
        }}
      />

      <div className={classNames("relative overflow-hidden", isNav ? "rounded-2xl" : "rounded-[2.75rem]")}>
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
            (e.currentTarget as HTMLImageElement).src = LOGO_SRC;
          }}
          alt={brand.name}
          className={classNames(
            "w-auto object-contain",
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
      <span className="relative z-10">{children}</span>
    </Button>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={classNames("h-4 w-4", i < rating ? "fill-current" : "opacity-30")} />
      ))}
    </div>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
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
              <Button variant="outline" className="rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 md:hidden">
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
                  <a key={item.href} href={item.href} className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm hover:bg-accent">
                    {item.label}
                    <ChevronRight className="h-4 w-4" />
                  </a>
                ))}
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

      <div className="mx-auto max-w-6xl px-4 py-10 text-white sm:py-20">
        <div className="relative mb-10 flex justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-x-24 -inset-y-16 rounded-[3rem] opacity-100"
            style={{
              backgroundImage: AUTISM_GRADIENT,
              filter: "blur(70px)",
              maskImage: "radial-gradient(70% 60% at 50% 50%, black 45%, transparent 95%)",
            }}
          />
          <Logo variant="hero" />
        </div>

        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Badge className="rounded-full bg-white/10 text-white" variant="secondary">
              Now planning near {brand.addressLine}
            </Badge>

            <h1 className="mt-4 text-5xl font-semibold tracking-tight leading-tight sm:text-6xl">
              <span className="block bg-clip-text text-transparent" style={{ backgroundImage: AUTISM_GRADIENT }}>
                Premium Car Wash Technology.
              </span>
              <span className="mt-2 block text-white">Built for Fulshear.</span>
              <span className="mt-2 block text-white">Powered by Purpose.</span>
              <span className="mt-2 block text-white/80">Inspired by Braxton.</span>
            </h1>

            <p className="mt-4 text-base text-white/75 sm:text-lg">{brand.tagline}</p>
            <p className="mt-4 text-base text-white/75 sm:text-lg">{brand.mission}</p>
<div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
  <p className="text-center text-sm font-medium text-white">
    Every Braxy Buns location is designed to create meaningful employment
    opportunities for neurodiverse individuals while delivering a premium,
    technology-driven car wash experience.
  </p>
</div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">🎉 Founding Member Special</p>
                  <p className="text-sm text-white/70">Founding memberships now available</p>
                  <p className="text-sm text-white/70">
                    Lock in <span className="font-semibold text-white">$10 off per month</span> for life
                  </p>
                </div>

                <a href="/join">
                  <button
                    className="mt-3 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-xl sm:mt-0"
                    style={{ backgroundImage: AUTISM_GRADIENT }}
                  >
                    Become a Founding Member
                  </button>
                </a>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#club">
                <GradientButton className="group w-full rounded-2xl sm:w-auto">{brand.ctaPrimary}</GradientButton>
              </a>
              <a href="#technology">
                <Button variant="outline" className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto">
                  See Our Technology
                </Button>
              </a>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4" /> Premium Technology
                </div>
                <p className="mt-1 text-xs text-white/70">Smart tunnel controls and enhanced drying</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CreditCard className="h-4 w-4" /> License Plate Recognition
                </div>
                <p className="mt-1 text-xs text-white/70">Fast, contactless member entry</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <HeartHandshake className="h-4 w-4" /> Neurodiverse Employment
                </div>
                <p className="mt-1 text-xs text-white/70">Inspired by Braxton and built with purpose</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Planned Premium Features</CardTitle>
                <CardDescription className="text-white/70">
                  Built for speed, quality, convenience, and community impact.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {[
                  { t: "License Plate Recognition", b: "Fast Entry", d: "Contactless member recognition for shorter wait times." },
                  { t: "Mobile App", b: "Coming Soon", d: "Manage memberships, buy washes, rewards, and promotions." },
                  { t: "Enhanced Drying", b: "Premium Finish", d: "Longer drying zone and upgraded blower configuration." },
                  { t: "18 Free Vacuums", b: "Always Free", d: "High-suction vacuums included with every visit." },
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
                  <Button variant="outline" className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 sm:w-auto">
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

function SpecsStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur md:grid-cols-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">Tunnel Length</div>
          <div className="mt-2 text-2xl font-semibold">120+ Foot Premium Tunnel</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">Vacuum Stations</div>
          <div className="mt-2 text-2xl font-semibold">18 Free Vacuums</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50">Membership</div>
          <div className="mt-2 text-2xl font-semibold">LPR Enabled Membership Club</div>
        </div>
      </div>
    </section>
  );
}

function TechnologyShowcase() {
  const items = [
    {
      title: "120+ Foot Premium Tunnel",
      desc: "Longer tunnel length allows more room for wash stages, rinse quality, drying performance, and vehicle flow.",
    },
    {
      title: "Enhanced Drying Zone",
      desc: "Extended drying space and upgraded blower placement are planned to help customers leave with a cleaner, drier vehicle.",
    },
    {
      title: "Smart Tunnel Controls",
      desc: "Modern tunnel controls are planned to improve equipment timing, chemical delivery, consistency, and uptime.",
    },
    {
      title: "License Plate Recognition",
      desc: "Fast, contactless member recognition designed to reduce friction and improve the Unlimited Wash Club experience.",
    },
    {
      title: "Future Mobile App",
      desc: "Customers will be able to manage memberships, buy washes, access promotions, and receive rewards.",
    },
    {
  title: "Dual Pay Lane Design",
  desc: "Planned entrance design optimized for faster throughput, reduced wait times, and improved customer flow."
},
{
  title: "Dual Pay Lane Entry",
  desc: "Designed to reduce wait times, improve vehicle throughput, and enhance the customer experience during peak hours.",
},
    {
      title: "AI-Ready Optimization",
      desc: "Future-ready systems designed to support smarter wash performance, monitoring, reporting, and operational decisions.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-white backdrop-blur">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="rounded-full bg-white/10 text-white" variant="secondary">
            Premium Tunnel Design
          </Badge>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            Engineered for a Cleaner, Drier, Faster Wash.
          </h2>

          <p className="mt-4 text-base text-white/70 sm:text-lg">
            Braxy Buns is planning a 120+ foot premium express tunnel designed to create a better wash sequence,
            longer chemical dwell time, enhanced rinsing, improved drying, and faster customer throughput.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.title} className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyDifferent() {
  const items = [
    ["License Plate Recognition", "Fast, contactless member access without cards or stickers."],
    ["Mobile App", "Membership management, rewards, promotions, and wash purchases."],
    ["Smart Tunnel Controls", "Better wash quality, consistency, timing, and equipment performance."],
    ["120+ Foot Premium Tunnel", "Extended wash sequence, improved dwell time, and stronger throughput."],
    ["Enhanced Drying System", "Longer drying zone and upgraded blower configuration for a drier finish."],
    ["Purpose-Driven Mission", "Creating meaningful jobs for neurodiverse individuals."],
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white backdrop-blur">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Why Braxy Buns Is Different
          </h2>
          <p className="mt-3 text-white/70">
            Braxy Buns is being designed to combine premium wash technology, superior drying performance,
            a modern customer experience, and meaningful employment opportunities for neurodiverse individuals.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {items.map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-white/70">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Technology() {
  const items = [
    {
      title: "License Plate Recognition",
      desc: "Planned LPR technology will allow wash club members to enter quickly through contactless vehicle recognition.",
    },
    {
      title: "Mobile App Integration",
      desc: "The future Braxy Buns mobile app will allow customers to manage memberships, purchase washes, receive rewards, and access promotions.",
    },
    {
      title: "Smart Tunnel Controls",
      desc: "Smart tunnel systems are planned to improve wash timing, chemical delivery, equipment performance, and consistency.",
    },
    {
      title: "120+ Foot Premium Express Tunnel",
      desc: "Braxy Buns is planning a longer express tunnel with improved wash sequencing, better dwell time, and an enhanced drying zone.",
    },
    {
      title: "Enhanced Drying System",
      desc: "Upgraded blowers, optimized airflow, and longer drying space are planned to help deliver a cleaner, drier finish.",
    },
    {
      title: "AI Tunnel Optimization",
      desc: "Future-ready smart controls designed to optimize chemical delivery, wash quality, and drying performance.",
    },
    {
      title: "Digital Membership Platform",
      desc: "Fast enrollment, automated billing, membership management, and future app-based customer engagement.",
    },
    {
      title: "18 Free Vacuums",
      desc: "High-suction vacuum stations designed to help every customer leave with a cleaner vehicle inside and out.",
    },
  ];

  return (
    <section id="technology" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Technology"
        title="Built with Smart Car Wash Technology"
        desc="Braxy Buns is being designed to deliver a faster, smarter, and drier wash experience."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Card key={item.title} className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Services"
        title="Built like the best premium express tunnel washes"
        desc="Premium equipment, consistent results, and clear options for any kind of driver."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {services.map((s) => (
          <Card key={s.title} className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
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
    </section>
  );
}

function MobileApp() {
  return (
    <section id="mobileapp" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Mobile App"
        title="A Better Customer Experience from Phone to Tunnel"
        desc="The planned Braxy Buns app will support memberships, rewards, wash purchases, and future LPR integration."
      />

      <div className="mt-10 grid gap-4 md:grid-cols-4">
        {["Manage Memberships", "Buy Washes", "Rewards & Offers", "Fast Member Access"].map((title) => (
          <Card key={title} className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/70">
                Planned feature for the future Braxy Buns mobile app experience.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function Locations() {
  return (
    <section id="locations" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Locations"
        title="Our Planned Flagship Location"
       desc="Braxy Buns is currently planning its first flagship location in the Fulshear, Texas area."
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
              <Button variant="outline" className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10">
                Save
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Mission"
        title="More than a car wash"
        desc="Braxy Buns is being built to deliver premium wash quality while creating meaningful opportunities for neurodiverse individuals."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Inspired by Braxton</CardTitle>
            <CardDescription className="text-white/70">
              A premium wash experience with a purpose-driven heart.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-white/70">{brand.mission}</p>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { t: "Neurodiverse Jobs", i: HeartHandshake, d: "Meaningful employment with purpose." },
                { t: "Responsible Process", i: Leaf, d: "Smart chemistry and water management." },
                { t: "Quality Checks", i: ShieldCheck, d: "Consistent results and care." },
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
          <CardFooter>
            <a href="/our-story">
              <Button variant="outline" className="rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10">
                Read Our Story
              </Button>
            </a>
          </CardFooter>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
          <CardHeader>
           <CardTitle className="text-lg">Why Braxy Buns Matters</CardTitle>
            <CardDescription className="text-white/70">
  More than a car wash. A mission-driven business built for the community.
</CardDescription>
          </CardHeader>
         <CardContent className="grid gap-4">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <h4 className="font-semibold">Employment With Purpose</h4>
    <p className="mt-2 text-sm text-white/70">
      Braxy Buns is being designed to create meaningful employment opportunities
      for neurodiverse individuals while delivering a premium customer experience.
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <h4 className="font-semibold">Premium Technology</h4>
    <p className="mt-2 text-sm text-white/70">
      Planned features include license plate recognition, smart tunnel controls,
      enhanced drying systems, a future mobile app, and a premium tunnel design.
    </p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <h4 className="font-semibold">Community Impact</h4>
    <p className="mt-2 text-sm text-white/70">
      Braxy Buns plans to support autism-focused organizations and become a
      positive force within the Fulshear community.
    </p>
  </div>
</CardContent>
        </Card>
      </div>
    </section>
  );
}
function Roadmap() {
  const milestones = [
    {
      phase: "2026",
      items: [
        { text: "Brand Created", complete: true },
        { text: "LLC Formed", complete: true },
        { text: "Trademark Filed", complete: true },
        { text: "Website Live", complete: true },
        { text: "Investor Materials Complete", complete: true },
        { text: "Capital Raise Underway", complete: true },
      ],
    },
    {
      phase: "2027",
      items: [
        { text: "Site Selection", complete: false },
        { text: "Permitting & Design", complete: false },
        { text: "Construction Begins", complete: false },
        { text: "Hiring & Training", complete: false },
      ],
    },
    {
      phase: "Grand Opening",
      items: [
        { text: "Launch Unlimited Wash Club", complete: false },
        { text: "Open Braxy Buns Fulshear", complete: false },
        { text: "Community Autism Partnership Launch", complete: false },
      ],
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <SectionHeader
        eyebrow="Roadmap"
        title="Building Braxy Buns"
        desc="Follow our journey from concept to grand opening."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {milestones.map((group) => (
          <Card
            key={group.phase}
            className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur"
          >
            <CardHeader>
              <CardTitle>{group.phase}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {group.items.map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div
                    className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
                      item.complete
                        ? "border-green-500 bg-green-500"
                        : "border-white/30"
                    }`}
                  >
                    {item.complete ? "✓" : ""}
                  </div>

                  <span className="text-sm text-white/80">
                    {item.text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
        <h3 className="text-2xl font-semibold text-white">
          Braxy Buns is Just Getting Started
        </h3>

        <p className="mt-3 text-white/70">
          Our goal is to build one of the most advanced express tunnel car
          washes in Texas while creating meaningful employment opportunities
          for neurodiverse individuals and supporting autism-focused causes.
        </p>
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
            <AccordionItem key={f.q} value={`item-${i}`} className="mb-3 rounded-2xl border border-white/10 bg-white/5 px-4 text-white">
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
              <GradientButton className="rounded-2xl" type="submit">
                Send message
              </GradientButton>
              {status === "sent" ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                  ✅ Message sent. Connect this form to your email service.
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-white/10 bg-white/5 text-white backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg">Reach us</CardTitle>
            <CardDescription className="text-white/70">Braxy Buns Carwash</CardDescription>
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
            <Button variant="outline" className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10">
              Contact
            </Button>
          </a>
        </div>
        <div className="mt-2 text-center text-[11px] text-white/70">
          Premium wash technology + neurodiverse employment mission
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
              <div className="text-white/70">
                © {new Date().getFullYear()} {brand.name}. All rights reserved.
              </div>
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
        <SpecsStrip />
        <TechnologyShowcase />
        <WhyDifferent />
        <Technology />
        <Services />
        <MobileApp />
        <BraxyBunsMembershipSections />
        <Locations />
        <About />
        <Roadmap />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}