import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata: Metadata = {
  title: "AlphaForge // Quant Research & Algorithmic Trading",
  description: "ML-powered systematic portfolio research, regime detection, and backtesting terminal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#08090B] text-[#F0F2F5] min-h-screen flex flex-col font-sans selection:bg-[#007AFF]/30 selection:text-white">
        <Navbar />
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
          {children}
        </main>
      </body>
    </html>
  );
}
