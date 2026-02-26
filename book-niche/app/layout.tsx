import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito, Geist_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookNiche — Curate Your Collection",
  description:
    "A book discovery engine for Fantasy and Romance. Find your next read by vibes, tropes, and magic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${nunito.variable} ${geistMono.variable}`}>
      <body className="min-h-screen antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
