import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://braxybuns.com"),

  title: {
    default: "Braxy Buns Carwash",
    template: "%s | Braxy Buns Carwash",
  },

  description:
    "Premium tunnel + self-serve bays in Fulshear, Texas. Fast, spotless, and friendly — supporting autism and neurodiverse families.",

  keywords: [
    "Car wash Fulshear",
    "Fulshear car wash",
    "Unlimited car wash club",
    "Tunnel car wash Texas",
    "Self serve car wash",
    "Braxy Buns Carwash",
  ],

  openGraph: {
    type: "website",
    url: "https://braxybuns.com",
    siteName: "Braxy Buns Carwash",
    title: "Braxy Buns Carwash",
    description:
      "Premium tunnel + self-serve bays in Fulshear, Texas — delivering spotless results with purpose.",
   
  },images: [
  {
    url: "https://braxybuns.com/braxy-buns-logo.png",
    width: 1200,
    height: 630,
    alt: "Braxy Buns Carwash",
  },
],


  twitter: {
    card: "summary_large_image",
    title: "Braxy Buns Carwash",
  description:
  "Braxy Buns Carwash delivers premium tunnel and self-serve washes in Fulshear, Texas — fast, spotless results with a mission supporting autism and neurodiverse families.",

    images: ["https://braxybuns.com/braxy-buns-logo.png"],

  },

  robots: {
    index: true,
    follow: true,
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

