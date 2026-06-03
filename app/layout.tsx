import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://braxybuns.com"),
  manifest: "/manifest.json",

  title: {
    default: "Braxy Buns Car Wash | Premium Express Tunnel Technology",
    template: "%s | Braxy Buns Car Wash",
  },

  description:
    "Premium express tunnel car wash in Fulshear, Texas featuring license plate recognition, smart tunnel controls, enhanced drying technology, free vacuums, and a mission-driven focus on neurodiverse employment.",

  keywords: [
    "Braxy Buns Car Wash",
    "Fulshear Car Wash",
    "Express Tunnel Car Wash",
    "License Plate Recognition Car Wash",
    "Unlimited Wash Club",
    "Premium Car Wash Technology",
    "Autism Employment Initiative",
    "Neurodiverse Employment",
    "Texas Car Wash",
  ],

  openGraph: {
    title: "Braxy Buns Car Wash | Premium Express Tunnel Technology",
    description:
      "Braxy Buns is being designed as one of the most advanced express tunnel car washes in Texas, featuring license plate recognition, smart tunnel controls, enhanced drying technology, free vacuums, and a mission-driven focus on neurodiverse employment.",
    url: "https://braxybuns.com",
    siteName: "Braxy Buns Car Wash",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Braxy Buns Car Wash",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Braxy Buns Car Wash | Premium Express Tunnel Technology",
    description:
      "Premium express tunnel car wash in Fulshear, Texas featuring license plate recognition, smart tunnel controls, enhanced drying technology, free vacuums, and a mission-driven focus on neurodiverse employment.",
    images: ["/og-image.jpg"],
  },

  appleWebApp: {
    capable: true,
    title: "Braxy Buns",
    statusBarStyle: "black-translucent",
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/braxy-buns-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}