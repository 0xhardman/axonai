import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainNav } from "@/components/ui/nav";
import { RainbowProvider } from "@/components/rainbow-kit";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
        <RainbowProvider>
          <MainNav />
          {children}
          <Toaster />
        </RainbowProvider>
      </body>
    </html>
  );
}
