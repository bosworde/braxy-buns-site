import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://braxybuns.com"),

  title: {
    default: "Braxy Buns Carwash | Premium Tunnel + Self-Serve Bays",
    template: "%s | Braxy Buns Carwash",
  },

  description:
    "Premium tunnel + self-serve bays in Fulshear, Texas — delivering spotless results with purpose and supporting autism awareness.",

  keywords: [
    "Car wash Fulshear",
    "Braxy Buns Carwash",
    "Premium tunnel car wash",
    "Self serve car wash Texas",
    "Unlimited wash club",
    "Autism support business",
  ],

  openGraph: {
    title: "Braxy Buns Carwash | Premium Tunnel + Self-Serve Bays",
    description:
      "Premium tunnel + self-serve bays in Fulshear, Texas — delivering spotless results with purpose.",
    url: "https://braxybuns.com",
    siteName: "Braxy Buns Carwash",
    images: [
      {
        url: "/og-image.jpg", // must exist in /public
        width: 1200,
        height: 630,
        alt: "Braxy Buns Carwash",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Braxy Buns Carwash | Premium Tunnel + Self-Serve Bays",
    description:
      "Premium tunnel + self-serve bays in Fulshear, Texas — delivering spotless results with purpose.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
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
