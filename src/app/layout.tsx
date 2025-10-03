import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
