import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chartlite - Lightweight Charting Library",
  description: "Beautiful charts for modern web apps. Lightweight, fast, and developer-friendly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="max-w-7xl mx-auto">
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  );
}
