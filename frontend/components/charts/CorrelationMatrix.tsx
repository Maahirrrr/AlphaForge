"use client";

import React, { useState } from "react";

const ASSETS = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "RELIANCE", "TCS"];

// Symmetrical correlation matrix sample data
const CORR_DATA: Record<string, Record<string, number>> = {
  AAPL: { AAPL: 1.00, MSFT: 0.74, NVDA: 0.68, GOOGL: 0.65, AMZN: 0.62, RELIANCE: 0.28, TCS: 0.32 },
  MSFT: { AAPL: 0.74, MSFT: 1.00, NVDA: 0.72, GOOGL: 0.79, AMZN: 0.71, RELIANCE: 0.24, TCS: 0.35 },
  NVDA: { AAPL: 0.68, MSFT: 0.72, NVDA: 1.00, GOOGL: 0.61, AMZN: 0.58, RELIANCE: 0.18, TCS: 0.29 },
  GOOGL: { AAPL: 0.65, MSFT: 0.79, NVDA: 0.61, GOOGL: 1.00, AMZN: 0.76, RELIANCE: 0.22, TCS: 0.31 },
  AMZN: { AAPL: 0.62, MSFT: 0.71, NVDA: 0.58, GOOGL: 0.76, AMZN: 1.00, RELIANCE: 0.25, TCS: 0.30 },
  RELIANCE: { AAPL: 0.28, MSFT: 0.24, NVDA: 0.18, GOOGL: 0.22, AMZN: 0.25, RELIANCE: 1.00, TCS: 0.52 },
  TCS: { AAPL: 0.32, MSFT: 0.35, NVDA: 0.29, GOOGL: 0.31, AMZN: 0.30, RELIANCE: 0.52, TCS: 1.00 },
};

export default function CorrelationMatrix() {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y">("3M");
  const [hoveredCell, setHoveredCell] = useState<{ a: string; b: string; val: number } | null>(null);

  const getHeatColor = (val: number) => {
    if (val === 1.0) return "bg-[#007AFF]/35 text-white font-bold";
    if (val >= 0.70) return "bg-[#EF4444]/30 text-[#FCA5A5] font-bold";
    if (val >= 0.50) return "bg-[#F59E0B]/25 text-[#FCD34D]";
    if (val >= 0.30) return "bg-[#38BDF8]/20 text-[#BAE6FD]";
    return "bg-[#1E2635]/40 text-[#8A94A6]";
  };

  return (
    <div className="workstation-card p-4 space-y-3 font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2635] pb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-[#F0F3F8]">
            CROSS-ASSET RETURN CORRELATION MATRIX
          </span>
          {hoveredCell && (
            <span className="text-[#38BDF8] text-[11px] mono-num">
              Corr({hoveredCell.a}, {hoveredCell.b}) = {hoveredCell.val.toFixed(2)}
            </span>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-[#0D1117] p-0.5 border border-[#1E2635] text-[10px]">
          {(["1D", "1W", "1M", "3M", "1Y"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 font-bold transition-colors ${
                timeframe === tf ? "bg-[#007AFF] text-white" : "text-[#8A94A6] hover:text-[#F0F3F8]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E2635] text-[#4F596A] text-[10px]">
              <th className="p-2 text-left font-normal">ASSET</th>
              {ASSETS.map((a) => (
                <th key={a} className="p-2 font-normal">{a.replace(".NS", "")}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2635]/40 text-[11px] mono-num">
            {ASSETS.map((rowAsset) => (
              <tr key={rowAsset} className="hover:bg-[#131822]/40">
                <td className="p-2 text-left font-bold text-white border-r border-[#1E2635]/60">
                  {rowAsset.replace(".NS", "")}
                </td>
                {ASSETS.map((colAsset) => {
                  const val = CORR_DATA[rowAsset]?.[colAsset] ?? 0;
                  return (
                    <td
                      key={colAsset}
                      onMouseEnter={() => setHoveredCell({ a: rowAsset, b: colAsset, val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`p-2 transition-colors cursor-pointer border border-[#1E2635]/20 ${getHeatColor(val)}`}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
