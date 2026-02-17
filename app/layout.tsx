import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://braxybuns.com"),
  title: {
    default: "Braxy Buns Carwash",
    template: "%s | Braxy Buns Carwash",
  },
  description:
    "Premium tunnel + self-serve bays near Fulshear, Texas — fast, spotless, and friendly with a mission to support autism and neurodiverse families.",
  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "https://braxybuns.com",
    siteName: "Braxy Buns Carwash",
    title: "Braxy Buns Carwash",
    description:
      "Premium tunnel + self-serve bays near Fulshear, Texas — fast, spotless, and friendly with a mission to support autism and neurodiverse families.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Braxy Buns Carwash",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Braxy Buns Carwash",
    description:
      "Premium tunnel + self-serve bays near Fulshear, Texas — fast, spotless, and friendly with a mission to support autism and neurodiverse families.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
