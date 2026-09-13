"use client";

import React from "react";
import { RegimeTelemetry } from "../../lib/types";

interface Props {
  regime: RegimeTelemetry | null;
}

export default function RegimeBadge({ regime }: Props) {
  if (!regime) {
    return (
      <div className="terminal-card p-4 flex items-center justify-between">
        <span className="text-xs font-mono text-[#525C6C]">REGIME DETECTOR: INITIALIZING...</span>
      </div>
    );
  }

  const { current_regime, probabilities } = regime;

  const colorMap = {
    BULL_TREND: { bg: "bg-[#34C759]/10", border: "border-[#34C759]", text: "text-[#34C759]", dot: "bg-[#34C759]" },
    SIDEWAYS: { bg: "bg-[#FF9500]/10", border: "border-[#FF9500]", text: "text-[#FF9500]", dot: "bg-[#FF9500]" },
    HIGH_VOLATILITY: { bg: "bg-[#FF3B30]/10", border: "border-[#FF3B30]", text: "text-[#FF3B30]", dot: "bg-[#FF3B30]" }
  };

  const currentTheme = colorMap[current_regime] || colorMap.SIDEWAYS;

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center justify-between mb-3 border-b border-[#1D232C] pb-2">
        <span className="text-[11px] font-mono text-[#8A94A6] tracking-wider">HMM MARKET REGIME</span>
        <div className={`flex items-center gap-1.5 px-2 py-0.5 border text-[11px] font-mono font-bold tracking-wider ${currentTheme.bg} ${currentTheme.border} ${currentTheme.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${currentTheme.dot} animate-pulse`}></span>
          {current_regime.replace("_", " ")}
        </div>
      </div>

      <div className="space-y-2 text-xs font-mono">
        <div>
          <div className="flex justify-between text-[#8A94A6] mb-1">
            <span>Bull Trend (Low Vol)</span>
            <span className="text-white">{(probabilities.BULL_TREND * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#13171D] h-1.5">
            <div className="bg-[#34C759] h-1.5" style={{ width: `${probabilities.BULL_TREND * 100}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#8A94A6] mb-1">
            <span>Sideways / Mean Reverting</span>
            <span className="text-white">{(probabilities.SIDEWAYS * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#13171D] h-1.5">
            <div className="bg-[#FF9500] h-1.5" style={{ width: `${probabilities.SIDEWAYS * 100}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-[#8A94A6] mb-1">
            <span>High Volatility / Bearish</span>
            <span className="text-white">{(probabilities.HIGH_VOLATILITY * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#13171D] h-1.5">
            <div className="bg-[#FF3B30] h-1.5" style={{ width: `${probabilities.HIGH_VOLATILITY * 100}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
