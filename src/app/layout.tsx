import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Moon Friends — Vinayaka Chavithi 2026",
  description:
    "Community event management platform for Moon Friends Vinayaka Chavithi 2026 celebration. Manage collections, expenses, events, and volunteers.",
  keywords: [
    "Moon Friends",
    "Vinayaka Chavithi",
    "Ganesh Chaturthi",
    "community",
    "celebration",
    "event management",
  ],
  authors: [{ name: "Moon Friends Committee" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
