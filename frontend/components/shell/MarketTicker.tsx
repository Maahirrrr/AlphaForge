"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Pause, Play, Eye } from "lucide-react";

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
}

const INITIAL_TICKERS: TickerItem[] = [
  { symbol: "SPY", price: 564.12, change: 2.84, changePct: 0.51 },
  { symbol: "QQQ", price: 486.30, change: 4.15, changePct: 0.86 },
  { symbol: "NVDA", price: 124.80, change: 3.40, changePct: 2.80 },
  { symbol: "AAPL", price: 232.50, change: -0.45, changePct: -0.19 },
  { symbol: "MSFT", price: 448.20, change: 1.65, changePct: 0.37 },
  { symbol: "BTC-USD", price: 63450.0, change: 1120.0, changePct: 1.80 },
  { symbol: "VIX", price: 16.42, change: -0.72, changePct: -4.20 },
  { symbol: "RELIANCE.NS", price: 2980.0, change: 14.50, changePct: 0.49 },
  { symbol: "TCS.NS", price: 4320.0, change: -12.00, changePct: -0.28 },
];

export default function MarketTicker() {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [isPaused, setIsPaused] = useState(false);

  // Subtle simulated market tick updates
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((item) => {
          const delta = (Math.random() - 0.49) * (item.price * 0.001);
          const newPrice = Number((item.price + delta).toFixed(2));
          const newChange = Number((item.change + delta).toFixed(2));
          const newPct = Number(((newChange / (newPrice - newChange)) * 100).toFixed(2));
          return {
            ...item,
            price: newPrice,
            change: newChange,
            changePct: newPct,
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="w-full bg-[#090C10] border-b border-[#1E2635] h-8 flex items-center text-[11px] font-mono select-none overflow-hidden z-30">
      {/* Ticker Lead Label */}
      <div className="flex items-center gap-1.5 px-3 bg-[#0D1117] border-r border-[#1E2635] text-[#8A94A6] h-full shrink-0 font-bold tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
        <span>MARKETS</span>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="ml-1 text-[#4F596A] hover:text-[#F0F3F8] transition-colors"
          title={isPaused ? "Resume Ticker" : "Pause Ticker"}
        >
          {isPaused ? <Play className="w-2.5 h-2.5 text-[#F59E0B]" /> : <Pause className="w-2.5 h-2.5" />}
        </button>
      </div>

      {/* Ticker Items Stream */}
      <div className="flex items-center overflow-x-auto no-scrollbar whitespace-nowrap divide-x divide-[#1E2635]/60 h-full flex-1">
        {tickers.map((t) => {
          const isPos = t.changePct >= 0;
          return (
            <div
              key={t.symbol}
              className="flex items-center gap-2 px-3 py-1 hover:bg-[#131822] transition-colors shrink-0"
            >
              <span className="font-bold text-[#F0F3F8] tracking-tight">{t.symbol}</span>
              <span className="mono-num text-[#8A94A6]">
                {t.price > 1000 ? t.price.toLocaleString("en-US", { minimumFractionDigits: 2 }) : t.price.toFixed(2)}
              </span>
              <span
                className={`flex items-center gap-0.5 mono-num font-bold text-[10px] ${
                  isPos ? "text-[#22C55E]" : "text-[#EF4444]"
                }`}
              >
                {isPos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {isPos ? "+" : ""}
                {t.changePct.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
