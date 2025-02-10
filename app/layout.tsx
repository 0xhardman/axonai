import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MinecraftNav } from "@/components/MinecraftNav";
import { RainbowProvider } from "@/components/rainbow-kit";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AxonAI - AI-Powered Smart Contract Agent",
  description: "Interact with your smart contracts through natural language using AI-powered agents",
  keywords: "blockchain, smart contracts, AI, ethereum, web3",
  authors: [{ name: "AxonAI Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased vt323-regular`}
      >
        <RainbowProvider>
          <MinecraftNav />
          {children}
          <Toaster />
        </RainbowProvider>
      </body>
    </html>
  );
}
