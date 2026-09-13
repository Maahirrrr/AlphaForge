import type { Metadata } from "next";
import "./globals.css";
import AppShell from "../components/shell/AppShell";

export const metadata: Metadata = {
  title: "AlphaForge // Quant Research & Algorithmic Trading Workstation",
  description: "Institutional ML-powered quantitative trading terminal, walk-forward validation, market regime classification, and event-driven backtesting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
