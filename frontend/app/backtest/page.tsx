"use client";

import React, { useState } from "react";
import { 
  LineChart, 
  Play, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  Download
} from "lucide-react";
import { api } from "../../lib/api";
import InteractiveEquityChart, { DataPoint } from "../../components/charts/InteractiveEquityChart";
import ReturnsHeatmap from "../../components/charts/ReturnsHeatmap";
import MetricCard from "../../components/ui/MetricCard";
import { BacktestResult } from "../../lib/types";

export default function BacktestLabPage() {
  const [strategy, setStrategy] = useState("ML_CROSS_SECTIONAL");
  const [universe, setUniverse] = useState("AAPL,MSFT,NVDA");
  const [capital, setCapital] = useState(1000000);
  const [slippage, setSlippage] = useState(5.0);
  const [commission, setCommission] = useState(3.0);
  const [rebalanceDays, setRebalanceDays] = useState(5);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeChartTab, setActiveChartTab] = useState<"EQUITY" | "HEATMAP">("EQUITY");

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const symList = universe.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
      const res = await api.runBacktest({
        strategy_type: strategy,
        universe: symList,
        initial_capital: Number(capital),
        slippage_bps: Number(slippage),
        rebalance_freq_days: Number(rebalanceDays)
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to execute backtest simulation.");
    } finally {
      setLoading(false);
    }
  };

  const chartPoints: DataPoint[] = (result?.equity_curve || []).map((pt) => ({
    date: pt.date,
    equity: pt.equity,
    benchmark: pt.benchmark,
    cash: pt.cash
  }));

  return (
    <div className="space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#0D1117] border border-[#1E2635] text-xs">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-[#22C55E]" />
          <span className="text-white font-bold tracking-wider">EVENT-DRIVEN BACKTESTING LAB</span>
          <span className="text-[#2E3A4E]">|</span>
          <span className="text-[#8A94A6]">BAR-BY-BAR SIMULATION, FRICTION & SLIPPAGE SPECIFICATION</span>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0 text-[11px]">
          <span className="px-2 py-0.5 bg-[#131822] text-[#22C55E] border border-[#1E2635] font-bold">
            TICK-QUEUE SIMULATION ENGINE
          </span>
        </div>
      </div>

      {/* 3-Column Architecture: Left Setup (3 cols) + Center Results (6 cols) + Right Metrics (3 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Strategy & Simulation Setup (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="workstation-card p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <span className="font-bold text-white tracking-wider">SIMULATION PARAMETERS</span>
              <span className="text-[10px] text-[#4F596A]">SLIPPAGE & FEES</span>
            </div>

            <form onSubmit={handleRunBacktest} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">QUANT STRATEGY</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white font-bold focus:border-[#007AFF] outline-none"
                >
                  <option value="ML_CROSS_SECTIONAL">ML Cross-Sectional Alpha (XGBoost)</option>
                  <option value="MOMENTUM">Quantitative Momentum-X</option>
                  <option value="REGIME_ADAPTIVE">Regime-Adaptive Dynamic HMM</option>
                  <option value="MEAN_REVERSION">Statistical Mean Reversion</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">UNIVERSE SYMBOLS</label>
                <input
                  type="text"
                  value={universe}
                  onChange={(e) => setUniverse(e.target.value)}
                  placeholder="AAPL, MSFT, NVDA"
                  className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white focus:border-[#007AFF] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">INITIAL CAPITAL (₹ / $)</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white mono-num focus:border-[#007AFF] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1">SLIPPAGE (BPS)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={slippage}
                    onChange={(e) => setSlippage(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white mono-num focus:border-[#007AFF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1">FEES (BPS)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={commission}
                    onChange={(e) => setCommission(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white mono-num focus:border-[#007AFF] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">REBALANCE FREQUENCY</label>
                <select
                  value={rebalanceDays}
                  onChange={(e) => setRebalanceDays(Number(e.target.value))}
                  className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white font-bold focus:border-[#007AFF] outline-none"
                >
                  <option value={1}>Daily Rebalance (1-Day)</option>
                  <option value={5}>Weekly Rebalance (5-Day)</option>
                  <option value={20}>Monthly Rebalance (20-Day)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full p-2.5 bg-[#22C55E] hover:bg-emerald-600 text-black font-bold tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-spin text-black" />
                    <span>SIMULATING QUEUE...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>EXECUTE BACKTEST</span>
                  </span>
                )}
              </button>
            </form>

            {error && (
              <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444] text-[#EF4444] text-xs">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Results & Visualizer (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Chart View Toggle Bar */}
          <div className="flex items-center justify-between border-b border-[#1E2635] pb-1 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveChartTab("EQUITY")}
                className={`px-3 py-1 text-xs font-bold border-b-2 transition-colors ${
                  activeChartTab === "EQUITY"
                    ? "text-[#007AFF] border-[#007AFF]"
                    : "text-[#8A94A6] border-transparent hover:text-white"
                }`}
              >
                EQUITY CURVE & DRAWDOWN
              </button>
              <button
                onClick={() => setActiveChartTab("HEATMAP")}
                className={`px-3 py-1 text-xs font-bold border-b-2 transition-colors ${
                  activeChartTab === "HEATMAP"
                    ? "text-[#007AFF] border-[#007AFF]"
                    : "text-[#8A94A6] border-transparent hover:text-white"
                }`}
              >
                MONTHLY RETURNS HEATMAP
              </button>
            </div>
            {result && (
              <span className="text-[10px] text-[#4F596A]">
                {result.trades.length} TRADES EXECUTED
              </span>
            )}
          </div>

          {/* Active View */}
          {activeChartTab === "EQUITY" ? (
            <InteractiveEquityChart
              data={chartPoints.length > 0 ? chartPoints : [
                { date: "2024-01", equity: 1000000, benchmark: 1000000, drawdown: 0 },
                { date: "2024-06", equity: 1180000, benchmark: 1080000, drawdown: -0.02 },
                { date: "2025-01", equity: 1290000, benchmark: 1140000, drawdown: -0.04 },
                { date: "2025-06", equity: 1420000, benchmark: 1210000, drawdown: -0.06 },
                { date: "2026-01", equity: 1512700, benchmark: 1280000, drawdown: -0.07 },
              ]}
              title={result ? `${result.strategy_name} SIMULATION RESULTS` : "PREVIEW SIMULATION TRAJECTORY"}
              height={320}
            />
          ) : (
            <ReturnsHeatmap />
          )}

          {/* Trade Blotter Table */}
          <div className="workstation-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <span className="font-bold text-white tracking-wider">EXECUTION TRADE AUDIT</span>
              <span className="text-[10px] text-[#4F596A]">SLIPPAGE & FEES DEDUCTED</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#4F596A] text-[10px] border-b border-[#1E2635]">
                    <th className="pb-2">DATE</th>
                    <th className="pb-2">ASSET</th>
                    <th className="pb-2">SIDE</th>
                    <th className="pb-2">QUANTITY</th>
                    <th className="pb-2">FILL PRICE</th>
                    <th className="pb-2">SLIPPAGE</th>
                    <th className="pb-2 text-right">FEES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2635]/40 text-[11px] mono-num">
                  {(result?.trades || [
                    { timestamp: "2026-08-20", symbol: "NVDA", side: "BUY", quantity: 120, price: 114.20, slippage: 0.0571, commission: 41.1, fees: 137.0 },
                    { timestamp: "2026-08-10", symbol: "AAPL", side: "SELL", quantity: 40, price: 234.80, slippage: 0.1174, commission: 28.1, fees: 93.9 },
                    { timestamp: "2026-07-25", symbol: "MSFT", side: "BUY", quantity: 35, price: 442.10, slippage: 0.2210, commission: 46.4, fees: 154.7 },
                    { timestamp: "2026-07-15", symbol: "GOOGL", side: "SELL", quantity: 50, price: 172.40, slippage: 0.0862, commission: 25.8, fees: 86.2 },
                  ]).map((t, idx) => (
                    <tr key={idx} className="hover:bg-[#1A2230]/40">
                      <td className="py-2 text-[#8A94A6]">{t.timestamp}</td>
                      <td className="py-2 text-white font-bold">{t.symbol}</td>
                      <td className={`py-2 font-bold ${t.side === "BUY" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                        {t.side}
                      </td>
                      <td className="py-2 text-[#F0F3F8]">{t.quantity}</td>
                      <td className="py-2 text-white">₹{t.price.toFixed(2)}</td>
                      <td className="py-2 text-[#F59E0B]">₹{t.slippage.toFixed(4)}</td>
                      <td className="py-2 text-right text-[#8A94A6]">₹{t.fees.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Key Performance Metrics Inspector (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="workstation-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <span className="font-bold text-white tracking-wider">STRATEGY PERFORMANCE RATIOS</span>
              <span className="text-[10px] text-[#22C55E] font-bold">ANNUALIZED</span>
            </div>

            <div className="space-y-2 text-xs text-[#8A94A6]">
              <div className="flex justify-between border-b border-[#1E2635]/40 pb-1">
                <span>Total Return:</span>
                <span className="font-bold text-[#22C55E] mono-num">
                  {result ? `+${result.metrics.total_return_pct}%` : "+42.81%"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1E2635]/40 pb-1">
                <span>Compound Return (CAGR):</span>
                <span className="font-bold text-white mono-num">
                  {result ? `${result.metrics.cagr_pct}%` : "18.4%"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1E2635]/40 pb-1">
                <span>Sharpe Ratio (Rf=0%):</span>
                <span className="font-bold text-white mono-num">
                  {result ? result.metrics.sharpe_ratio.toFixed(2) : "1.91"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1E2635]/40 pb-1">
                <span>Sortino Ratio (Downside):</span>
                <span className="font-bold text-[#38BDF8] mono-num">
                  {result ? result.metrics.sortino_ratio.toFixed(2) : "2.37"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1E2635]/40 pb-1">
                <span>Calmar Ratio (Return/DD):</span>
                <span className="font-bold text-white mono-num">
                  {result ? result.metrics.calmar_ratio.toFixed(2) : "1.87"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1E2635]/40 pb-1">
                <span>Maximum Drawdown:</span>
                <span className="font-bold text-[#EF4444] mono-num">
                  {result ? `${result.metrics.max_drawdown_pct}%` : "-9.82%"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1E2635]/40 pb-1">
                <span>Win Rate:</span>
                <span className="font-bold text-[#22C55E] mono-num">
                  {result ? `${result.metrics.win_rate_pct}%` : "63.2%"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1E2635]/40 pb-1">
                <span>Profit Factor:</span>
                <span className="font-bold text-white mono-num">
                  {result ? result.metrics.profit_factor.toFixed(2) : "1.84"}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#1E2635]/40 pb-1">
                <span>Jensen's Alpha:</span>
                <span className="font-bold text-[#22C55E] mono-num">
                  {result ? `+${(result.metrics.alpha * 100).toFixed(1)}%` : "+14.2%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Market Beta (SPY):</span>
                <span className="font-bold text-white mono-num">
                  {result ? result.metrics.beta.toFixed(2) : "0.88"}
                </span>
              </div>
            </div>
          </div>

          {/* Friction & Costs Card */}
          <div className="workstation-card p-4 space-y-2.5 text-xs">
            <div className="text-[10px] font-bold text-[#4F596A] tracking-wider border-b border-[#1E2635] pb-1">
              FRICTION & TRANSACTION COST IMPACT
            </div>
            <div className="flex justify-between text-[#8A94A6]">
              <span>Gross Profit Generated:</span>
              <span className="text-white mono-num">₹5,27,550</span>
            </div>
            <div className="flex justify-between text-[#8A94A6]">
              <span>Total Slippage & Fees:</span>
              <span className="text-[#F59E0B] mono-num">-₹14,850</span>
            </div>
            <div className="flex justify-between text-[#8A94A6] border-t border-[#1E2635] pt-1">
              <span className="font-bold text-white">Net Realized Alpha:</span>
              <span className="font-bold text-[#22C55E] mono-num">+₹5,12,700</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
