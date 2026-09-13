"use client";

import React from "react";

interface Driver {
  feature: string;
  value: number;
  shap_impact: number;
}

interface Props {
  topPositive: Driver[];
  topNegative: Driver[];
}

export default function ShapWaterfall({ topPositive, topNegative }: Props) {
  const allDrivers = [...(topPositive || []), ...(topNegative || [])];
  if (!allDrivers.length) {
    return (
      <div className="terminal-card p-4 text-xs font-mono text-[#525C6C]">
        [ NO SHAP EXPLANATION DRIVERS LOADED ]
      </div>
    );
  }

  const maxAbs = Math.max(...allDrivers.map((d) => Math.abs(d.shap_impact))) || 1.0;

  return (
    <div className="terminal-card p-4">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1D232C]">
        <h4 className="text-xs font-mono font-bold tracking-wider text-white">
          SHAP PREDICTION ATTRIBUTION (TOP ALPHA DRIVERS)
        </h4>
        <span className="text-[10px] font-mono text-[#525C6C]">TREE-SHAPLEY VALUES</span>
      </div>

      <div className="space-y-2">
        {allDrivers.map((d, i) => {
          const isPos = d.shap_impact > 0;
          const barWidth = Math.min(100, Math.round((Math.abs(d.shap_impact) / maxAbs) * 100));

          return (
            <div key={i} className="text-xs font-mono">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#F0F2F5]">{d.feature}</span>
                <span className={isPos ? "text-[#34C759]" : "text-[#FF3B30]"}>
                  {isPos ? "+" : ""}
                  {d.shap_impact.toFixed(4)}
                </span>
              </div>
              <div className="w-full bg-[#13171D] h-2 flex">
                <div
                  className={`h-2 ${isPos ? "bg-[#34C759]" : "bg-[#FF3B30]"}`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
