"use client";

import React, { useState, useEffect } from "react";
import { Sliders, CheckCircle2, Play, Activity } from "lucide-react";
import { api } from "../../lib/api";

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const strats = await api.getStrategies();
        setStrategies(strats);
        const comp = await api.compareStrategies();
        setComparisons(comp);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[#0E1115] border border-[#1D232C] text-xs font-mono">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#007AFF]" />
          <span className="text-white font-bold">SYSTEMATIC STRATEGY STUDIO</span>
          <span className="text-[#525C6C]">|</span>
          <span className="text-[#8A94A6]">MULTI-ASSET QUANTITATIVE ENGINES</span>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategies.map((s) => (
          <div key={s.key} className="terminal-card p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1D232C] pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#34C759]"></span>
                  <h3 className="text-sm font-bold font-mono text-white tracking-wider">{s.name}</h3>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-[#13171D] text-[#007AFF] border border-[#2A323E]">
                  {s.category}
                </span>
              </div>

              <p className="text-xs text-[#8A94A6] leading-relaxed mb-4">{s.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#1D232C] text-xs font-mono">
              <span className="text-[#525C6C]">Rebalance: {s.rebalance}</span>
              <span className="text-[#34C759] font-bold">[ {s.status} ]</span>
            </div>
          </div>
        ))}
      </div>

      {/* Side-by-side Comparative Performance Table */}
      <div className="terminal-card p-4">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1D232C]">
          <h4 className="text-xs font-mono font-bold tracking-wider text-white">
            QUANT STRATEGY BENCHMARK COMPARISON MATRIX
          </h4>
          <span className="text-[10px] font-mono text-[#525C6C]">IDENTICAL HISTORICAL SAMPLE PERIOD</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[#525C6C] border-b border-[#1D232C]">
                <th className="pb-2">STRATEGY</th>
                <th className="pb-2">TOTAL RETURN</th>
                <th className="pb-2">CAGR</th>
                <th className="pb-2">SHARPE</th>
                <th className="pb-2">SORTINO</th>
                <th className="pb-2">MAX DRAWDOWN</th>
                <th className="pb-2">WIN RATE</th>
                <th className="pb-2 text-right">TOTAL TRADES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D232C]/50">
              {comparisons.length > 0 ? (
                comparisons.map((c) => (
                  <tr key={c.strategy_key} className="hover:bg-[#13171D]">
                    <td className="py-2.5 text-white font-bold">{c.strategy_name}</td>
                    <td
                      className={`py-2.5 font-bold ${
                        c.total_return_pct >= 0 ? "text-[#34C759]" : "text-[#FF3B30]"
                      }`}
                    >
                      {c.total_return_pct >= 0 ? "+" : ""}
                      {c.total_return_pct}%
                    </td>
                    <td className="py-2.5 text-[#34C759]">{c.cagr_pct}%</td>
                    <td className="py-2.5 text-white">{c.sharpe_ratio}</td>
                    <td className="py-2.5 text-[#8A94A6]">{c.sortino_ratio}</td>
                    <td className="py-2.5 text-[#FF3B30]">{c.max_drawdown_pct}%</td>
                    <td className="py-2.5 text-[#007AFF]">{c.win_rate_pct}%</td>
                    <td className="py-2.5 text-right text-[#8A94A6]">{c.total_trades}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-[#525C6C]">
                    LOADING COMPARISON BENCHMARKS...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
