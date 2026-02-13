import "./globals.css";
export const metadata = {
  title: "Braxy Buns Carwash | Premium Tunnel & Self-Serve | Fulshear TX",
  description:
    "Premium tunnel car wash and self-serve bays in Fulshear, TX. Unlimited wash club. Autism community partnerships.",
  openGraph: {
    title: "Braxy Buns Carwash",
    description: "Premium wash. Community mission.",
    images: ["/braxy-buns-logo.png"],
  },
};

export const metadata = {
  title: "Braxy Buns Carwash",
  description: "Premium tunnel + self-serve bays. Fast, spotless, and friendly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
