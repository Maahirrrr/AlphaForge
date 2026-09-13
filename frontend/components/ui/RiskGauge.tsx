"use client";

import React from "react";

interface RiskGaugeProps {
  label: string;
  current: number; // e.g. 0.63 for 63%
  max: number; // e.g. 1.0 for 100%
  unit?: string;
  warningThreshold?: number; // e.g. 0.8
  formatter?: (val: number) => string;
}

export default function RiskGauge({
  label,
  current,
  max,
  unit = "%",
  warningThreshold = 0.8,
  formatter
}: RiskGaugeProps) {
  const pct = Math.min(100, Math.max(0, (current / max) * 100));
  const isBreached = current > max;
  const isWarning = current > (max * warningThreshold);

  const statusColor = isBreached 
    ? "text-[#EF4444] bg-[#EF4444]/15 border-[#EF4444]/40" 
    : isWarning 
    ? "text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/40" 
    : "text-[#22C55E] bg-[#22C55E]/15 border-[#22C55E]/40";

  const barColor = isBreached ? "bg-[#EF4444]" : isWarning ? "bg-[#F59E0B]" : "bg-[#22C55E]";

  const displayCurrent = formatter ? formatter(current) : unit === "%" ? `${(current * 100).toFixed(1)}%` : `${current}`;
  const displayMax = formatter ? formatter(max) : unit === "%" ? `${(max * 100).toFixed(1)}%` : `${max}`;

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#8A94A6] tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white mono-num">{displayCurrent}</span>
          <span className="text-[#4F596A]">/</span>
          <span className="text-[#8A94A6] mono-num">{displayMax}</span>
          <span className={`px-1 py-0.2 text-[9px] font-bold border ${statusColor}`}>
            {isBreached ? "BREACH" : isWarning ? "WARN" : "OK"}
          </span>
        </div>
      </div>

      {/* Track Bar */}
      <div className="w-full h-1.5 bg-[#0D1117] border border-[#1E2635] overflow-hidden relative">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
        {/* Warning Marker Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-[#F59E0B]/60"
          style={{ left: `${warningThreshold * 100}%` }}
        />
      </div>
    </div>
  );
}
