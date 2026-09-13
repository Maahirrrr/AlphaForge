"use client";

import React from "react";
import { RegimeTelemetry } from "../../lib/types";

interface Props {
  regime: RegimeTelemetry | null;
}

export default function RegimeBadge({ regime }: Props) {
  if (!regime) {
    return (
      <div className="workstation-card p-4 flex items-center justify-between text-xs font-mono text-[#4F596A]">
        <span>REGIME DETECTOR: INITIALIZING POSTERIOR PROBABILITIES...</span>
      </div>
    );
  }

  const { current_regime, probabilities, transition_matrix } = regime;

  const colorMap = {
    BULL_TREND: { bg: "bg-[#22C55E]/10", border: "border-[#22C55E]/50", text: "text-[#22C55E]", dot: "bg-[#22C55E]", bar: "bg-[#22C55E]" },
    SIDEWAYS: { bg: "bg-[#F59E0B]/10", border: "border-[#F59E0B]/50", text: "text-[#F59E0B]", dot: "bg-[#F59E0B]", bar: "bg-[#F59E0B]" },
    HIGH_VOLATILITY: { bg: "bg-[#EF4444]/10", border: "border-[#EF4444]/50", text: "text-[#EF4444]", dot: "bg-[#EF4444]", bar: "bg-[#EF4444]" }
  };

  const currentTheme = colorMap[current_regime] || colorMap.SIDEWAYS;

  return (
    <div className="workstation-card p-4 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-[#1E2635] pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#007AFF]"></span>
          <span className="text-[11px] font-bold text-[#F0F3F8] tracking-wider">
            3-STATE GAUSSIAN HMM CLASSIFIER
          </span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-bold tracking-wider ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dot} animate-pulse`}></span>
          {current_regime.replace(/_/g, " ")}
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        <div>
          <div className="flex justify-between text-[#8A94A6] text-[11px] mb-1">
            <span>Bull Trend (Low Vol Momentum)</span>
            <span className="text-white font-bold mono-num">{(probabilities.BULL_TREND * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#0D1117] border border-[#1E2635] h-1.5 overflow-hidden">
            <div className="bg-[#22C55E] h-full transition-all duration-300" style={{ width: `${probabilities.BULL_TREND * 100}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#8A94A6] text-[11px] mb-1">
            <span>Sideways (Mean Reversion)</span>
            <span className="text-white font-bold mono-num">{(probabilities.SIDEWAYS * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#0D1117] border border-[#1E2635] h-1.5 overflow-hidden">
            <div className="bg-[#F59E0B] h-full transition-all duration-300" style={{ width: `${probabilities.SIDEWAYS * 100}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#8A94A6] text-[11px] mb-1">
            <span>High Volatility (Hedging Required)</span>
            <span className="text-white font-bold mono-num">{(probabilities.HIGH_VOLATILITY * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#0D1117] border border-[#1E2635] h-1.5 overflow-hidden">
            <div className="bg-[#EF4444] h-full transition-all duration-300" style={{ width: `${probabilities.HIGH_VOLATILITY * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
