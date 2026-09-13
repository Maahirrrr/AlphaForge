"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  neutral?: boolean;
  sublabel?: string;
  sparklineData?: number[];
  badge?: string;
  badgeColor?: string;
}

export default function MetricCard({
  label,
  value,
  change,
  isPositive,
  neutral = false,
  sublabel,
  sparklineData,
  badge,
  badgeColor = "text-[#38BDF8] border-[#38BDF8]/40 bg-[#38BDF8]/10"
}: MetricCardProps) {
  // Generate mini SVG sparkline path
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const width = 64;
    const height = 20;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;

    const points = sparklineData.map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    const strokeColor = neutral ? "#8A94A6" : isPositive ? "#22C55E" : "#EF4444";

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="workstation-card p-3.5 flex flex-col justify-between hover:border-[#2E3A4E] transition-colors relative group">
      {/* Top Header Label + Badge */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono font-bold tracking-wider text-[#8A94A6] uppercase truncate">
          {label}
        </span>
        {badge && (
          <span className={`text-[9px] font-mono px-1.5 py-0.2 border ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline justify-between gap-2 mt-1.5">
        <div className="text-xl font-bold font-mono mono-num text-[#F0F3F8] tracking-tight">
          {value}
        </div>
        {renderSparkline()}
      </div>

      {/* Bottom Sublabel + Delta indicator */}
      <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-[#1E2635]/60 text-[10px] font-mono">
        {change ? (
          <div
            className={`flex items-center gap-1 font-bold mono-num ${
              neutral ? "text-[#8A94A6]" : isPositive ? "text-[#22C55E]" : "text-[#EF4444]"
            }`}
          >
            {neutral ? (
              <Minus className="w-3 h-3" />
            ) : isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{change}</span>
          </div>
        ) : (
          <span className="text-[#4F596A]">--</span>
        )}

        {sublabel && (
          <span className="text-[#8A94A6] truncate text-right">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
