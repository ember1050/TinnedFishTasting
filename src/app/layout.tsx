import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tinned Fish Tasting",
  description:
    "Rate, rank, and review tinned fish. Host blind tastings with friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b bg-white sticky top-0 z-50">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              🐟 Tinned Fish Tasting
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/fish"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Browse Fish
              </Link>
              <Link
                href="/tastings"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Tastings
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Profile
              </Link>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign In
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t py-8 text-center text-sm text-gray-500">
          © 2026 Tinned Fish Tasting. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
