"use client";

import React, { useState, useMemo, useRef } from "react";

export interface DataPoint {
  date: string;
  equity: number;
  benchmark?: number;
  drawdown?: number; // e.g. -0.05 for -5%
  cash?: number;
}

interface InteractiveEquityChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  currencyPrefix?: string;
}

export default function InteractiveEquityChart({
  data,
  title = "PORTFOLIO PERFORMANCE & BENCHMARK COMPARISON",
  height = 300,
  currencyPrefix = "₹"
}: InteractiveEquityChartProps) {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "6M" | "YTD" | "1Y" | "ALL">("ALL");
  const [showEquity, setShowEquity] = useState(true);
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [showDrawdown, setShowDrawdown] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Timeframe filtering
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (timeframe === "ALL") return data;
    const countMap: Record<string, number> = {
      "1D": 2,
      "1W": 7,
      "1M": 20,
      "3M": 60,
      "6M": 120,
      "YTD": 90,
      "1Y": 252,
    };
    const count = countMap[timeframe] || data.length;
    return data.slice(-count);
  }, [data, timeframe]);

  // If no data
  if (!filteredData || filteredData.length < 2) {
    return (
      <div className="workstation-card p-6 h-64 flex flex-col items-center justify-center text-xs font-mono text-[#4F596A] space-y-2">
        <span className="text-[#8A94A6] font-bold">[ INSUFFICIENT DATA POINTS FOR CHART RENDERING ]</span>
        <span>Awaiting market telemetry feed or backtest execution.</span>
      </div>
    );
  }

  // Calculate scales and max/min
  const width = 1000;
  const padding = { top: 25, right: 30, bottom: 45, left: 75 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Split plot area: Top 75% for Equity/Benchmark, Bottom 25% for Drawdown
  const equityPlotHeight = showDrawdown ? plotHeight * 0.70 : plotHeight;
  const drawdownPlotTop = padding.top + equityPlotHeight + 15;
  const drawdownPlotHeight = showDrawdown ? plotHeight * 0.25 : 0;

  // Find min/max values
  const allEquities = filteredData.map((d) => d.equity);
  const allBenchmarks = filteredData.map((d) => d.benchmark ?? d.equity);
  const combined = [...allEquities, ...allBenchmarks];

  const minVal = Math.min(...combined);
  const maxVal = Math.max(...combined);
  const valRange = maxVal - minVal || 1;

  // Calculate Drawdown array if not present
  let peak = filteredData[0].equity;
  const ddValues = filteredData.map((d) => {
    if (d.drawdown !== undefined) return d.drawdown;
    if (d.equity > peak) peak = d.equity;
    return (d.equity - peak) / peak; // negative or zero
  });
  const maxDD = Math.min(...ddValues); // most negative
  const ddRange = Math.abs(maxDD) || 0.1;

  // Helper coordinate mappers
  const getX = (idx: number) => padding.left + (idx / (filteredData.length - 1)) * plotWidth;
  const getYEquity = (val: number) => padding.top + (1 - (val - minVal) / valRange) * equityPlotHeight;
  const getYDrawdown = (dd: number) => drawdownPlotTop + (Math.abs(dd) / ddRange) * drawdownPlotHeight;

  // Build SVG Paths
  const equityPath = filteredData.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${getX(i)} ${getYEquity(pt.equity)}`,
    ""
  );

  const benchmarkPath = filteredData.reduce(
    (acc, pt, i) => `${acc} ${i === 0 ? "M" : "L"} ${getX(i)} ${getYEquity(pt.benchmark ?? pt.equity)}`,
    ""
  );

  // Drawdown Area Path
  let ddAreaPath = "";
  if (showDrawdown) {
    ddAreaPath = `M ${getX(0)} ${drawdownPlotTop}`;
    filteredData.forEach((pt, i) => {
      ddAreaPath += ` L ${getX(i)} ${getYDrawdown(ddValues[i])}`;
    });
    ddAreaPath += ` L ${getX(filteredData.length - 1)} ${drawdownPlotTop} Z`;
  }

  const activeIdx = hoverIndex !== null ? hoverIndex : filteredData.length - 1;
  const activePoint = filteredData[activeIdx] || filteredData[filteredData.length - 1];
  const activeDD = ddValues[activeIdx] ?? 0;
  const initialEquity = filteredData[0].equity;
  const totalReturnPct = Number((((activePoint.equity - initialEquity) / initialEquity) * 100).toFixed(2));

  return (
    <div className="workstation-card p-4 space-y-3 font-mono">
      {/* Top Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E2635] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#22C55E]"></span>
          <span className="text-xs font-bold tracking-wider text-[#F0F3F8]">{title}</span>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-[#0D1117] p-0.5 border border-[#1E2635] text-[10px]">
          {(["1D", "1W", "1M", "3M", "6M", "YTD", "1Y", "ALL"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-0.5 font-bold transition-colors ${
                timeframe === tf
                  ? "bg-[#007AFF] text-white"
                  : "text-[#8A94A6] hover:text-[#F0F3F8]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Layer Toggles & Telemetry Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#090C10] p-2 border border-[#1E2635]">
        <div className="flex items-center gap-4">
          {/* Equity Toggle */}
          <button
            onClick={() => setShowEquity(!showEquity)}
            className={`flex items-center gap-1.5 transition-opacity ${showEquity ? "opacity-100" : "opacity-40"}`}
          >
            <span className="w-2.5 h-0.5 bg-[#22C55E]"></span>
            <span className="text-[#8A94A6]">Portfolio:</span>
            <span className="font-bold text-white mono-num">
              {currencyPrefix}{activePoint.equity.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </button>

          {/* Benchmark Toggle */}
          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`flex items-center gap-1.5 transition-opacity ${showBenchmark ? "opacity-100" : "opacity-40"}`}
          >
            <span className="w-2.5 h-0.5 bg-[#007AFF] border-b border-dashed"></span>
            <span className="text-[#8A94A6]">Benchmark:</span>
            <span className="font-bold text-[#8A94A6] mono-num">
              {currencyPrefix}{(activePoint.benchmark ?? activePoint.equity).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
          </button>

          {/* Drawdown Toggle */}
          <button
            onClick={() => setShowDrawdown(!showDrawdown)}
            className={`flex items-center gap-1.5 transition-opacity ${showDrawdown ? "opacity-100" : "opacity-40"}`}
          >
            <span className="w-2.5 h-0.5 bg-[#EF4444]"></span>
            <span className="text-[#8A94A6]">Drawdown:</span>
            <span className="font-bold text-[#EF4444] mono-num">
              {(activeDD * 100).toFixed(2)}%
            </span>
          </button>
        </div>

        {/* Date & Total Return */}
        <div className="flex items-center gap-3 mono-num text-[11px]">
          <span className="text-[#8A94A6]">
            Return:{" "}
            <strong className={totalReturnPct >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}>
              {totalReturnPct >= 0 ? "+" : ""}{totalReturnPct}%
            </strong>
          </span>
          <span className="text-[#4F596A]">[{activePoint.date}]</span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = ((e.clientX - rect.left) / rect.width) * width;
            const ratio = Math.max(0, Math.min(1, (mouseX - padding.left) / plotWidth));
            const idx = Math.round(ratio * (filteredData.length - 1));
            setHoverIndex(idx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Subtle Horizontal Grid Lines for Equity */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + pct * equityPlotHeight;
            const val = maxVal - pct * valRange;
            return (
              <g key={`grid-eq-${i}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1E2635"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#4F596A"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="JetBrains Mono"
                >
                  {currencyPrefix}{(val / 100000).toFixed(1)}L
                </text>
              </g>
            );
          })}

          {/* Benchmark Line (Blue Dashed) */}
          {showBenchmark && (
            <path
              d={benchmarkPath}
              fill="none"
              stroke="#007AFF"
              strokeWidth="1.5"
              strokeDasharray="4 2"
              opacity={0.7}
            />
          )}

          {/* Equity Line (Green Solid) */}
          {showEquity && (
            <path
              d={equityPath}
              fill="none"
              stroke="#22C55E"
              strokeWidth="2.0"
            />
          )}

          {/* Drawdown Area & Subplot */}
          {showDrawdown && (
            <g>
              {/* Separator line between Equity and Drawdown */}
              <line
                x1={padding.left}
                y1={drawdownPlotTop}
                x2={width - padding.right}
                y2={drawdownPlotTop}
                stroke="#1E2635"
              />
              <text
                x={padding.left - 8}
                y={drawdownPlotTop + 3}
                fill="#4F596A"
                fontSize="9"
                textAnchor="end"
                fontFamily="JetBrains Mono"
              >
                0.0%
              </text>
              <text
                x={padding.left - 8}
                y={drawdownPlotTop + drawdownPlotHeight}
                fill="#EF4444"
                fontSize="9"
                textAnchor="end"
                fontFamily="JetBrains Mono"
              >
                {(maxDD * 100).toFixed(0)}%
              </text>

              {/* Red underwater fill */}
              <path
                d={ddAreaPath}
                fill="#EF4444"
                fillOpacity="0.15"
                stroke="#EF4444"
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* Hover Crosshair & Indicators */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={getX(hoverIndex)}
                y1={padding.top}
                x2={getX(hoverIndex)}
                y2={showDrawdown ? drawdownPlotTop + drawdownPlotHeight : padding.top + equityPlotHeight}
                stroke="#38BDF8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Equity Point Indicator */}
              {showEquity && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getYEquity(activePoint.equity)}
                  r="4"
                  fill="#22C55E"
                  stroke="#08090B"
                  strokeWidth="2"
                />
              )}

              {/* Benchmark Point Indicator */}
              {showBenchmark && activePoint.benchmark && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getYEquity(activePoint.benchmark)}
                  r="3.5"
                  fill="#007AFF"
                  stroke="#08090B"
                  strokeWidth="2"
                />
              )}

              {/* Drawdown Point Indicator */}
              {showDrawdown && (
                <circle
                  cx={getX(hoverIndex)}
                  cy={getYDrawdown(activeDD)}
                  r="3.5"
                  fill="#EF4444"
                  stroke="#08090B"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* Bottom Time Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const idx = Math.min(filteredData.length - 1, Math.round(pct * (filteredData.length - 1)));
            const pt = filteredData[idx];
            return (
              <text
                key={`x-axis-${i}`}
                x={getX(idx)}
                y={height - 10}
                fill="#4F596A"
                fontSize="10"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
              >
                {pt.date}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
