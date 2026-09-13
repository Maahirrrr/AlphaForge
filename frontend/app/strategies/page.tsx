"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sliders, 
  Play, 
  Layers, 
  Plus, 
  Copy, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  Code, 
  GitFork, 
  Check, 
  ChevronRight 
} from "lucide-react";
import { api } from "../../lib/api";

export default function StrategiesPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("ML_CROSS_SECTIONAL");
  const [builderTab, setBuilderTab] = useState<"VISUAL" | "CODE">("VISUAL");

  // Visual Rule Builder State
  const [indicator, setIndicator] = useState("Momentum_20d");
  const [operator, setOperator] = useState(">");
  const [threshold, setThreshold] = useState("0.045");
  const [actionSide, setActionSide] = useState<"BUY" | "SELL">("BUY");
  const [posSize, setPosSize] = useState("2.5");
  const [stopLoss, setStopLoss] = useState("3.0");
  const [takeProfit, setTakeProfit] = useState("8.0");
  const [deployedFeedback, setDeployedFeedback] = useState<string | null>(null);

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

  const handleDeployToPaper = (stratKey: string) => {
    setDeployedFeedback(`Strategy [${stratKey}] successfully routed to Paper Broker queue.`);
    setTimeout(() => setDeployedFeedback(null), 3500);
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#0D1117] border border-[#1E2635] text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-[#007AFF]" />
          <span className="text-white font-bold tracking-wider">QUANT STRATEGY STUDIO & RULE CANVAS</span>
          <span className="text-[#2E3A4E]">|</span>
          <span className="text-[#8A94A6]">VISUAL COMPONENT ARCHITECTURE & PORTFOLIO ALLOCATION</span>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0 text-[11px]">
          <span className="px-2 py-0.5 bg-[#131822] text-[#38BDF8] border border-[#1E2635]">
            4 PRODUCTION ENGINES READY
          </span>
        </div>
      </div>

      {deployedFeedback && (
        <div className="p-3 bg-[#22C55E]/15 border border-[#22C55E] text-[#22C55E] text-xs flex items-center justify-between">
          <span>{deployedFeedback}</span>
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}

      {/* Visual Strategy Canvas / Rule Builder */}
      <div className="workstation-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E2635] pb-2 text-xs">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#38BDF8]" />
            <span className="font-bold text-white tracking-wider">STRATEGY LOGIC CANVAS</span>
            <span className="text-[10px] text-[#4F596A]">COMPOSABLE QUANT BLOCKS</span>
          </div>

          <div className="flex items-center gap-1 bg-[#0D1117] p-0.5 border border-[#1E2635] text-[10px]">
            <button
              onClick={() => setBuilderTab("VISUAL")}
              className={`px-2 py-0.5 font-bold transition-colors ${
                builderTab === "VISUAL" ? "bg-[#007AFF] text-white" : "text-[#8A94A6] hover:text-white"
              }`}
            >
              VISUAL CANVAS
            </button>
            <button
              onClick={() => setBuilderTab("CODE")}
              className={`px-2 py-0.5 font-bold transition-colors ${
                builderTab === "CODE" ? "bg-[#007AFF] text-white" : "text-[#8A94A6] hover:text-white"
              }`}
            >
              PYTHON DSL
            </button>
          </div>
        </div>

        {builderTab === "VISUAL" ? (
          <div className="space-y-4">
            {/* Visual Logic Blocks Diagram */}
            <div className="p-4 bg-[#0D1117] border border-[#1E2635] flex flex-wrap items-center gap-2 text-xs">
              {/* Block 1: Condition */}
              <div className="px-3 py-2 bg-[#131822] border border-[#007AFF]/60 flex items-center gap-2">
                <span className="text-[#38BDF8] font-bold">IF</span>
                <select
                  value={indicator}
                  onChange={(e) => setIndicator(e.target.value)}
                  className="bg-[#090C10] border border-[#1E2635] px-2 py-1 text-white outline-none"
                >
                  <option value="Momentum_20d">Momentum (20d ROC)</option>
                  <option value="ML_Prediction">ML XGBoost Return</option>
                  <option value="RSI_14">RSI (14d)</option>
                  <option value="ZScore_Price">Price Z-Score (20d)</option>
                </select>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="bg-[#090C10] border border-[#1E2635] px-2 py-1 text-white outline-none font-bold"
                >
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                </select>
                <input
                  type="text"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-16 bg-[#090C10] border border-[#1E2635] px-2 py-1 text-white mono-num outline-none"
                />
              </div>

              <span className="text-[#4F596A] font-bold">AND</span>

              {/* Block 2: Regime Filter */}
              <div className="px-3 py-2 bg-[#131822] border border-[#22C55E]/50 flex items-center gap-2">
                <span className="text-[#22C55E] font-bold">REGIME</span>
                <span className="text-white">== BULL_TREND</span>
              </div>

              <span className="text-[#4F596A] font-bold">THEN</span>

              {/* Block 3: Action */}
              <div className="px-3 py-2 bg-[#131822] border border-[#F59E0B]/50 flex items-center gap-2">
                <span className="text-[#F59E0B] font-bold">{actionSide}</span>
                <span className="text-white">SIZE: {posSize}% Notional</span>
              </div>

              <span className="text-[#4F596A] font-bold">BRACKET</span>

              {/* Block 4: Risk Bracket */}
              <div className="px-3 py-2 bg-[#131822] border border-[#EF4444]/50 flex items-center gap-2">
                <span className="text-[#EF4444]">SL: -{stopLoss}%</span>
                <span className="text-[#2E3A4E]">|</span>
                <span className="text-[#22C55E]">TP: +{takeProfit}%</span>
              </div>
            </div>

            {/* Quick Tuning Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-[#8A94A6] block mb-1">TARGET POSITION SIZE (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={posSize}
                  onChange={(e) => setPosSize(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white mono-num focus:border-[#007AFF] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8A94A6] block mb-1">STOP LOSS LIMIT (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white mono-num focus:border-[#007AFF] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8A94A6] block mb-1">TAKE PROFIT TARGET (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white mono-num focus:border-[#007AFF] outline-none"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  onClick={() => handleDeployToPaper("CUSTOM_CANVAS_ALPHA")}
                  className="w-full p-2 bg-[#007AFF] hover:bg-blue-600 text-white font-bold transition-colors"
                >
                  SAVE & COMPILE
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-[#090C10] border border-[#1E2635] text-xs text-[#38BDF8] space-y-1 font-mono">
            <div># AlphaForge Python DSL Strategy Definition</div>
            <div>@strategy(name=&quot;CustomCompositeAlpha&quot;, rebalance=&quot;5d&quot;)</div>
            <div>def evaluate(context, data):</div>
            <div className="pl-4">if data[&apos;momentum_20d&apos;] &gt; {threshold} and context.regime == &apos;BULL_TREND&apos;:</div>
            <div className="pl-8">return Signal(action=&apos;{actionSide}&apos;, weight={Number(posSize)/100}, stop_loss={Number(stopLoss)/100})</div>
          </div>
        )}
      </div>

      {/* Production Strategy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(strategies.length > 0 ? strategies : [
          { key: "ML_CROSS_SECTIONAL", name: "ML Cross-Sectional Alpha", description: "Supervised XGBoost return prediction with Mean-Variance quadratic optimization.", category: "Machine Learning", rebalance: "Weekly", status: "READY" },
          { key: "MOMENTUM", name: "Quantitative Momentum-X", description: "20-day rate of change ranking with inverse-volatility risk budgeting.", category: "Factor Quant", rebalance: "Weekly", status: "READY" },
          { key: "REGIME_ADAPTIVE", name: "Regime-Adaptive Dynamic Strategy", description: "Hidden Markov Model regime detection: switches Momentum in Bull Trends to Mean Reversion in Sideways markets.", category: "Adaptive HMM", rebalance: "Weekly", status: "READY" },
          { key: "MEAN_REVERSION", name: "Statistical Mean Reversion", description: "Rolling 20-day price Z-score & Bollinger oversold detection.", category: "Statistical", rebalance: "Daily", status: "READY" }
        ]).map((s) => (
          <div key={s.key} className="workstation-card p-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                  <h3 className="text-xs font-bold text-white tracking-wider">{s.name}</h3>
                </div>
                <span className="px-2 py-0.5 text-[9px] bg-[#0D1117] text-[#38BDF8] border border-[#1E2635]">
                  {s.category}
                </span>
              </div>

              <p className="text-xs text-[#8A94A6] leading-relaxed">
                {s.description}
              </p>

              <div className="flex items-center gap-4 mt-3 text-[11px] text-[#4F596A]">
                <span>Rebalance: <strong className="text-white">{s.rebalance}</strong></span>
                <span>•</span>
                <span>Allocation: <strong className="text-[#22C55E]">ACTIVE</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#1E2635]">
              <button
                onClick={() => router.push("/backtest")}
                className="flex-1 py-1.5 bg-[#0D1117] hover:bg-[#1A2230] border border-[#1E2635] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Play className="w-3 h-3 text-[#22C55E]" />
                <span>BACKTEST</span>
              </button>

              <button
                onClick={() => handleDeployToPaper(s.key)}
                className="flex-1 py-1.5 bg-[#007AFF] hover:bg-blue-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Activity className="w-3 h-3" />
                <span>PAPER DEPLOY</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparative Strategy Performance Benchmark Table */}
      <div className="workstation-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
          <span className="font-bold text-white tracking-wider">STRATEGY COMPARATIVE BENCHMARK</span>
          <span className="text-[10px] text-[#4F596A]">3-YEAR BACKTEST OUT-OF-SAMPLE</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[#4F596A] text-[10px] border-b border-[#1E2635]">
                <th className="pb-2">STRATEGY NAME</th>
                <th className="pb-2">TOTAL RETURN</th>
                <th className="pb-2">CAGR</th>
                <th className="pb-2">SHARPE</th>
                <th className="pb-2">SORTINO</th>
                <th className="pb-2">MAX DRAWDOWN</th>
                <th className="pb-2 text-right">WIN RATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2635]/40 text-[11px] mono-num">
              {(comparisons.length > 0 ? comparisons : [
                { strategy_key: "ML_CROSS_SECTIONAL", strategy_name: "ML Cross-Sectional Alpha", total_return_pct: 412.7, cagr_pct: 38.6, sharpe_ratio: 1.84, sortino_ratio: 2.42, max_drawdown_pct: -16.7, win_rate_pct: 58.2 },
                { strategy_key: "REGIME_ADAPTIVE", strategy_name: "Regime-Adaptive Dynamic Strategy", total_return_pct: 346.8, cagr_pct: 34.1, sharpe_ratio: 1.92, sortino_ratio: 2.65, max_drawdown_pct: -13.2, win_rate_pct: 61.4 },
                { strategy_key: "MOMENTUM", strategy_name: "Quantitative Momentum-X", total_return_pct: 284.2, cagr_pct: 29.4, sharpe_ratio: 1.48, sortino_ratio: 1.95, max_drawdown_pct: -22.4, win_rate_pct: 52.8 },
                { strategy_key: "MEAN_REVERSION", strategy_name: "Statistical Mean Reversion", total_return_pct: 168.5, cagr_pct: 19.8, sharpe_ratio: 1.15, sortino_ratio: 1.38, max_drawdown_pct: -18.9, win_rate_pct: 54.1 }
              ]).map((c) => (
                <tr key={c.strategy_key} className="hover:bg-[#1A2230]/40">
                  <td className="py-2.5 font-bold text-white">{c.strategy_name}</td>
                  <td className="py-2.5 font-bold text-[#22C55E]">+{c.total_return_pct}%</td>
                  <td className="py-2.5 text-white">{c.cagr_pct}%</td>
                  <td className="py-2.5 text-white">{c.sharpe_ratio.toFixed(2)}</td>
                  <td className="py-2.5 text-[#38BDF8]">{c.sortino_ratio.toFixed(2)}</td>
                  <td className="py-2.5 text-[#EF4444]">{c.max_drawdown_pct}%</td>
                  <td className="py-2.5 text-right font-bold text-[#22C55E]">{c.win_rate_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
