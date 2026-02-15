import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: {
    default: "DMX Logistics | Shipping as easy as sending money",
    template: "%s | DMX Logistics",
  },
  description: "Ship with confidence. Track deliveries, book shipments, and manage logistics with DMX.",
  openGraph: {
    title: "DMX Logistics",
    description: "Shipping as easy as sending money.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} bg-white font-sans`}>
      <body className="min-h-screen bg-white text-zinc-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
