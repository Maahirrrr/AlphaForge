"use client";

import React, { useState } from "react";

interface MonthlyReturn {
  year: number;
  month: string;
  returnPct: number;
}

const SAMPLE_HEATMAP_DATA: MonthlyReturn[] = [
  { year: 2024, month: "Jan", returnPct: 4.2 },
  { year: 2024, month: "Feb", returnPct: 2.8 },
  { year: 2024, month: "Mar", returnPct: -1.4 },
  { year: 2024, month: "Apr", returnPct: 3.6 },
  { year: 2024, month: "May", returnPct: 5.1 },
  { year: 2024, month: "Jun", returnPct: -0.8 },
  { year: 2024, month: "Jul", returnPct: 2.2 },
  { year: 2024, month: "Aug", returnPct: 4.9 },
  { year: 2024, month: "Sep", returnPct: -2.1 },
  { year: 2024, month: "Oct", returnPct: 3.2 },
  { year: 2024, month: "Nov", returnPct: 6.4 },
  { year: 2024, month: "Dec", returnPct: 1.8 },

  { year: 2025, month: "Jan", returnPct: 3.1 },
  { year: 2025, month: "Feb", returnPct: 1.5 },
  { year: 2025, month: "Mar", returnPct: 4.8 },
  { year: 2025, month: "Apr", returnPct: -2.6 },
  { year: 2025, month: "May", returnPct: 3.9 },
  { year: 2025, month: "Jun", returnPct: 2.4 },
  { year: 2025, month: "Jul", returnPct: -1.1 },
  { year: 2025, month: "Aug", returnPct: 5.6 },
  { year: 2025, month: "Sep", returnPct: 0.9 },
  { year: 2025, month: "Oct", returnPct: 2.7 },
  { year: 2025, month: "Nov", returnPct: 4.3 },
  { year: 2025, month: "Dec", returnPct: 3.0 },

  { year: 2026, month: "Jan", returnPct: 2.9 },
  { year: 2026, month: "Feb", returnPct: 4.1 },
  { year: 2026, month: "Mar", returnPct: 1.7 },
  { year: 2026, month: "Apr", returnPct: 3.4 },
  { year: 2026, month: "May", returnPct: -0.9 },
  { year: 2026, month: "Jun", returnPct: 2.8 },
  { year: 2026, month: "Jul", returnPct: 3.5 },
  { year: 2026, month: "Aug", returnPct: 1.2 },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ReturnsHeatmap({ data = SAMPLE_HEATMAP_DATA }: { data?: MonthlyReturn[] }) {
  const [hoveredCell, setHoveredCell] = useState<{ year: number; month: string; val: number } | null>(null);

  const years = Array.from(new Set(data.map((d) => d.year))).sort((a, b) => b - a);

  // Return cell color based on return percentage
  const getCellColor = (pct: number) => {
    if (pct === 0) return "bg-[#131822] text-[#8A94A6]";
    if (pct > 0) {
      if (pct > 4.5) return "bg-[#22C55E]/35 text-[#22C55E] font-bold";
      if (pct > 2.0) return "bg-[#22C55E]/20 text-[#22C55E]";
      return "bg-[#22C55E]/10 text-[#86EFAC]";
    } else {
      if (pct < -2.0) return "bg-[#EF4444]/35 text-[#EF4444] font-bold";
      return "bg-[#EF4444]/15 text-[#FCA5A5]";
    }
  };

  return (
    <div className="workstation-card p-4 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
        <span className="font-bold tracking-wider text-[#F0F3F8]">
          MONTHLY PERFORMANCE ATTRIBUTION MATRIX (%)
        </span>
        {hoveredCell ? (
          <span className="text-[#38BDF8] text-[11px] mono-num">
            {hoveredCell.month} {hoveredCell.year}: {hoveredCell.val > 0 ? "+" : ""}{hoveredCell.val.toFixed(1)}%
          </span>
        ) : (
          <span className="text-[10px] text-[#4F596A]">COMPOUNDED PERIODIC HEATMAP</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E2635] text-[#4F596A] text-[10px]">
              <th className="p-1.5 text-left font-normal">YEAR</th>
              {MONTHS.map((m) => (
                <th key={m} className="p-1.5 font-normal">{m.toUpperCase()}</th>
              ))}
              <th className="p-1.5 text-right font-normal text-white">YTD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E2635]/50 text-[11px] mono-num">
            {years.map((y) => {
              const yearData = data.filter((d) => d.year === y);
              const ytd = yearData.reduce((acc, curr) => acc + curr.returnPct, 0);

              return (
                <tr key={y} className="hover:bg-[#131822]/40">
                  <td className="p-1.5 text-left font-bold text-white">{y}</td>
                  {MONTHS.map((m) => {
                    const match = yearData.find((d) => d.month === m);
                    if (!match) {
                      return (
                        <td key={m} className="p-1.5 text-[#2E3A4E]">
                          --
                        </td>
                      );
                    }
                    return (
                      <td
                        key={m}
                        onMouseEnter={() => setHoveredCell({ year: y, month: m, val: match.returnPct })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`p-1.5 cursor-pointer transition-colors ${getCellColor(match.returnPct)}`}
                      >
                        {match.returnPct > 0 ? "+" : ""}
                        {match.returnPct.toFixed(1)}
                      </td>
                    );
                  })}
                  <td className={`p-1.5 text-right font-bold ${ytd >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {ytd > 0 ? "+" : ""}
                    {ytd.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
