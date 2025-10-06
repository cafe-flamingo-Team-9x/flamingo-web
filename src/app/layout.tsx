import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getServerEnv } from "@/lib/env";
import "./globals.css";
import { Providers } from "./providers";

// Validate environment at app bootstrap (server-side)
getServerEnv();

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Flamingo Restaurant | Fine Dining in Piliyandala",
  description:
    "Experience exceptional dining at Flamingo Restaurant in Piliyandala. Casual elegance meets delicious cuisine with our BYOB policy.",
  keywords: ["restaurant", "dining", "Piliyandala", "Sri Lanka", "BYOB", "fine dining"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
