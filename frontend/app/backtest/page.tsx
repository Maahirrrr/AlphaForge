"use client";

import React, { useState } from "react";
import { Play, LineChart, ShieldCheck, DollarSign, Clock, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { api } from "../../lib/api";
import EquityChart from "../../components/charts/EquityChart";
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#0E1115] border border-[#1D232C] text-xs font-mono">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-[#34C759]" />
          <span className="text-white font-bold">EVENT-DRIVEN BACKTESTING LAB</span>
          <span className="text-[#525C6C]">|</span>
          <span className="text-[#8A94A6]">REALISTIC SLIPPAGE, TRANSACTION COSTS & RISK LIMITS</span>
        </div>
      </div>

      {/* Control Configuration Panel */}
      <div className="terminal-card p-5">
        <h3 className="text-xs font-mono font-bold tracking-wider text-white mb-4 border-b border-[#1D232C] pb-2">
          SIMULATION PARAMETERS & EXECUTION FRICTION
        </h3>

        <form onSubmit={handleRunBacktest} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-xs font-mono">
          <div>
            <label className="text-[#8A94A6] block mb-1">STRATEGY</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            >
              <option value="ML_CROSS_SECTIONAL">ML Cross-Sectional Alpha</option>
              <option value="MOMENTUM">Quantitative Momentum</option>
              <option value="MEAN_REVERSION">Statistical Mean Reversion</option>
              <option value="REGIME_ADAPTIVE">Regime-Adaptive Dynamic Strategy</option>
            </select>
          </div>

          <div>
            <label className="text-[#8A94A6] block mb-1">UNIVERSE (COMMA-SEPARATED)</label>
            <input
              type="text"
              value={universe}
              onChange={(e) => setUniverse(e.target.value)}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            />
          </div>

          <div>
            <label className="text-[#8A94A6] block mb-1">INITIAL CAPITAL (₹ / $)</label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            />
          </div>

          <div>
            <label className="text-[#8A94A6] block mb-1">SLIPPAGE (BPS)</label>
            <input
              type="number"
              step="0.5"
              value={slippage}
              onChange={(e) => setSlippage(Number(e.target.value))}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            />
          </div>

          <div>
            <label className="text-[#8A94A6] block mb-1">REBALANCE FREQ (DAYS)</label>
            <input
              type="number"
              value={rebalanceDays}
              onChange={(e) => setRebalanceDays(Number(e.target.value))}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full p-2.5 bg-[#34C759] text-black font-bold tracking-wider hover:bg-green-500 transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              {loading ? "SIMULATING..." : "RUN BACKTEST"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-[#FF3B30]/10 border border-[#FF3B30] text-[#FF3B30] text-xs font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Results Telemetry */}
      {result && (
        <div className="space-y-6">
          {/* Institutional Metrics Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">TOTAL RETURN</span>
              <div
                className={`text-base font-bold mono-num mt-1 ${
                  result.metrics.total_return_pct >= 0 ? "text-[#34C759]" : "text-[#FF3B30]"
                }`}
              >
                {result.metrics.total_return_pct >= 0 ? "+" : ""}
                {result.metrics.total_return_pct}%
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">CUMULATIVE</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">CAGR</span>
              <div className="text-base font-bold mono-num text-[#34C759] mt-1">
                {result.metrics.cagr_pct}%
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">ANNUALIZED</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">SHARPE RATIO</span>
              <div className="text-base font-bold mono-num text-white mt-1">
                {result.metrics.sharpe_ratio}
              </div>
              <span className="text-[10px] font-mono text-[#34C759]">RF = 5%</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">SORTINO RATIO</span>
              <div className="text-base font-bold mono-num text-white mt-1">
                {result.metrics.sortino_ratio}
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">DOWNSIDE VOL</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">MAX DRAWDOWN</span>
              <div className="text-base font-bold mono-num text-[#FF3B30] mt-1">
                {result.metrics.max_drawdown_pct}%
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">HIGH-WATER</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">CALMAR RATIO</span>
              <div className="text-base font-bold mono-num text-white mt-1">
                {result.metrics.calmar_ratio}
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">CAGR / MAX DD</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">WIN RATE</span>
              <div className="text-base font-bold mono-num text-[#007AFF] mt-1">
                {result.metrics.win_rate_pct}%
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">PROFIT FACTOR: {result.metrics.profit_factor}</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">TOTAL COSTS PAID</span>
              <div className="text-base font-bold mono-num text-[#FF9500] mt-1">
                ?{result.metrics.total_costs_paid.toLocaleString("en-IN")}
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">{result.metrics.total_trades} TRADES</span>
            </div>
          </div>

          {/* Equity Chart */}
          <EquityChart data={result.equity_curve} title={`EQUITY CURVE: ${result.strategy_name}`} />

          {/* Detailed Trades Log */}
          <div className="terminal-card p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1D232C]">
              <h4 className="text-xs font-mono font-bold tracking-wider text-white">
                SIMULATED EXECUTION AUDIT LOG
              </h4>
              <span className="text-[10px] font-mono text-[#525C6C]">LAST 200 TRADES</span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-[#0E1115] border-b border-[#1D232C]">
                  <tr className="text-[#525C6C]">
                    <th className="pb-2">DATE</th>
                    <th className="pb-2">ASSET</th>
                    <th className="pb-2">SIDE</th>
                    <th className="pb-2">QTY</th>
                    <th className="pb-2">EXEC PRICE</th>
                    <th className="pb-2">SLIPPAGE</th>
                    <th className="pb-2">FEES</th>
                    <th className="pb-2 text-right">TRADE P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D232C]/50">
                  {result.trades.map((t, idx) => (
                    <tr key={idx} className="hover:bg-[#13171D]">
                      <td className="py-2 text-[#8A94A6]">{t.timestamp}</td>
                      <td className="py-2 text-white font-bold">{t.symbol}</td>
                      <td className={`py-2 font-bold ${t.side === "BUY" ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                        {t.side}
                      </td>
                      <td className="py-2 text-[#8A94A6]">{t.quantity}</td>
                      <td className="py-2 text-white">?{t.price.toFixed(2)}</td>
                      <td className="py-2 text-[#8A94A6]">?{t.slippage.toFixed(4)}</td>
                      <td className="py-2 text-[#8A94A6]">?{(t.commission + t.fees).toFixed(2)}</td>
                      <td
                        className={`py-2 text-right font-bold ${
                          t.pnl >= 0 ? "text-[#34C759]" : "text-[#FF3B30]"
                        }`}
                      >
                        {t.pnl !== 0 ? `${t.pnl > 0 ? "+" : ""}?${t.pnl.toFixed(2)}` : "---"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
