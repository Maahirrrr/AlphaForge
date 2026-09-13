"use client";

import React, { useState } from "react";

interface Driver {
  feature: string;
  value: number;
  shap_impact: number;
}

interface Props {
  topPositive: Driver[];
  topNegative: Driver[];
  baselineValue?: number;
}

export default function ShapWaterfall({ topPositive, topNegative, baselineValue = 0.0024 }: Props) {
  const [hovered, setHovered] = useState<Driver | null>(null);
  const allDrivers = [...(topPositive || []), ...(topNegative || [])];

  if (!allDrivers.length) {
    return (
      <div className="workstation-card p-4 text-xs font-mono text-[#4F596A]">
        [ NO ACTIVE SHAP ATTRIBUTIONS DETECTED ]
      </div>
    );
  }

  const maxAbs = Math.max(...allDrivers.map((d) => Math.abs(d.shap_impact))) || 0.05;

  return (
    <div className="workstation-card p-4 space-y-3 font-mono">
      <div className="flex items-center justify-between pb-2 border-b border-[#1E2635]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#007AFF]"></span>
          <span className="text-xs font-bold tracking-wider text-[#F0F3F8]">
            TREESHAP ATTRIBUTION (FORWARD RETURN PREDICTION)
          </span>
        </div>
        <span className="text-[10px] text-[#8A94A6]">
          BASE EXPECTATION: <strong className="text-white mono-num">{(baselineValue * 100).toFixed(2)}%</strong>
        </span>
      </div>

      <div className="space-y-2.5">
        {allDrivers.map((d, i) => {
          const isPos = d.shap_impact >= 0;
          const barWidth = Math.min(100, Math.max(5, Math.round((Math.abs(d.shap_impact) / maxAbs) * 100)));

          return (
            <div
              key={i}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
              className="text-xs p-1.5 hover:bg-[#1A2230]/40 transition-colors"
            >
              <div className="flex justify-between items-center text-[11px] mb-1">
                <span className="text-white font-bold tracking-tight">{d.feature}</span>
                <div className="flex items-center gap-2 mono-num">
                  <span className="text-[#8A94A6] text-[10px]">val={d.value.toFixed(2)}</span>
                  <span className={`font-bold ${isPos ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                    {isPos ? "+" : ""}
                    {(d.shap_impact * 100).toFixed(3)}%
                  </span>
                </div>
              </div>

              {/* Centered zero-line relative bar */}
              <div className="w-full bg-[#0D1117] border border-[#1E2635] h-2 relative flex items-center">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#4F596A]/50 z-10"></div>
                {isPos ? (
                  <div
                    className="h-full bg-[#22C55E] ml-[50%]"
                    style={{ width: `${barWidth / 2}%` }}
                  />
                ) : (
                  <div
                    className="h-full bg-[#EF4444] absolute right-[50%]"
                    style={{ width: `${barWidth / 2}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hovered && (
        <div className="p-2 bg-[#0D1117] border border-[#1E2635] text-[10px] text-[#8A94A6] flex justify-between">
          <span>Active Feature: <strong className="text-white">{hovered.feature}</strong></span>
          <span>Normalized Impact: <strong className="text-[#38BDF8]">{(hovered.shap_impact / maxAbs).toFixed(2)}σ</strong></span>
        </div>
      )}
    </div>
  );
}
