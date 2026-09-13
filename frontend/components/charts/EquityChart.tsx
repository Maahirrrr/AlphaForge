"use client";

import React, { useState } from "react";

interface EquityPoint {
  date: string;
  equity: number;
  benchmark: number;
}

interface Props {
  data: EquityPoint[];
  title?: string;
}

export default function EquityChart({ data, title = "PORTFOLIO EQUITY CURVE VS BENCHMARK" }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length < 2) {
    return (
      <div className="terminal-card p-6 h-72 flex items-center justify-center text-xs mono-num text-[#525C6C]">
        [ INSUFFICIENT DATA POINTS FOR TELEMETRY RENDERING ]
      </div>
    );
  }

  const equities = data.map((d) => d.equity);
  const benchmarks = data.map((d) => d.benchmark);
  const minVal = Math.min(...equities, ...benchmarks) * 0.95;
  const maxVal = Math.max(...equities, ...benchmarks) * 1.05;
  const range = maxVal - minVal || 1.0;

  const width = 1000;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 30, left: 60 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Generate SVG path for equity
  const getX = (idx: number) => padding.left + (idx / (data.length - 1)) * plotWidth;
  const getY = (val: number) => padding.top + plotHeight - ((val - minVal) / range) * plotHeight;

  const equityPath = data.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${getX(i)} ${getY(pt.equity)}`,
    ""
  );

  const benchmarkPath = data.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${getX(i)} ${getY(pt.benchmark)}`,
    ""
  );

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  return (
    <div className="terminal-card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-2 border-b border-[#1D232C] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#34C759]"></span>
          <h4 className="text-xs font-mono font-bold tracking-wider text-[#F0F2F5]">{title}</h4>
        </div>

        <div className="flex items-center gap-4 text-xs mono-num">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#34C759]"></span>
            <span className="text-[#8A94A6]">Portfolio:</span>
            <span className="font-bold text-white">?{activePoint.equity.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#007AFF] border-b border-dashed"></span>
            <span className="text-[#8A94A6]">Benchmark:</span>
            <span className="font-bold text-[#8A94A6]">?{activePoint.benchmark.toLocaleString("en-IN")}</span>
          </div>
          <span className="text-[#525C6C]">[{activePoint.date}]</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const ratio = Math.max(0, Math.min(1, (mouseX - padding.left) / plotWidth));
            const idx = Math.round(ratio * (data.length - 1));
            setHoverIndex(idx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Subtle Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + pct * plotHeight;
            const val = maxVal - pct * range;
            return (
              <g key={i}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#1D232C" strokeDasharray="3 3" />
                <text x={padding.left - 8} y={y + 3} fill="#525C6C" fontSize="10" textAnchor="end" fontFamily="JetBrains Mono">
                  ?{(val / 100000).toFixed(1)}L
                </text>
              </g>
            );
          })}

          {/* Benchmark Line (Blue) */}
          <path d={benchmarkPath} fill="none" stroke="#007AFF" strokeWidth="1.5" strokeDasharray="4 2" opacity={0.8} />

          {/* Equity Line (Green) */}
          <path d={equityPath} fill="none" stroke="#34C759" strokeWidth="2.0" />

          {/* Hover crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={padding.top + plotHeight}
                stroke="#F0F2F5"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle cx={getX(hoverIndex)} cy={getY(data[hoverIndex].equity)} r="4" fill="#34C759" stroke="#08090B" strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
