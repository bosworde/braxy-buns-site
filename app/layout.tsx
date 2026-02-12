import "./globals.css";

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
