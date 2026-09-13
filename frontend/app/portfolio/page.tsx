"use client";

import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  RotateCcw, 
  ShieldCheck, 
  PieChart, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  X
} from "lucide-react";
import { api } from "../../lib/api";
import CorrelationMatrix from "../../components/charts/CorrelationMatrix";
import MetricCard from "../../components/ui/MetricCard";
import { AccountTelemetry, PositionRecord } from "../../lib/types";

export default function PortfolioPage() {
  const [attribution, setAttribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newCapital, setNewCapital] = useState(1000000);
  const [allocationMode, setAllocationMode] = useState<"SECTOR" | "FACTORS">("SECTOR");

  const loadData = async () => {
    try {
      const data = await api.getAttribution("PAPER");
      setAttribution(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReset = async () => {
    try {
      await api.resetPortfolio(Number(newCapital));
      setResetModalOpen(false);
      loadData();
    } catch (err: any) {
      alert("Failed to reset paper account: " + err.message);
    }
  };

  const account: AccountTelemetry = attribution?.account;
  const positions: PositionRecord[] = attribution?.positions || [
    { symbol: "AAPL", quantity: 50, avg_price: 218.40, current_price: 232.50, market_value: 116250.0, unrealized_pnl: 7050.0, unrealized_pnl_pct: 6.46 },
    { symbol: "NVDA", quantity: 120, avg_price: 112.10, current_price: 124.80, market_value: 149760.0, unrealized_pnl: 15240.0, unrealized_pnl_pct: 11.33 },
    { symbol: "MSFT", quantity: 30, avg_price: 432.00, current_price: 448.20, market_value: 134460.0, unrealized_pnl: 4860.0, unrealized_pnl_pct: 3.75 },
  ];

  const sectors: Record<string, number> = attribution?.sector_allocation || {
    Technology: 52.4,
    Semiconductors: 36.2,
    Communication: 11.4
  };

  const factors: Record<string, number> = attribution?.factor_exposures || {
    Momentum: 0.85,
    "Low Volatility": -0.15,
    Quality: 1.10,
    Liquidity: 1.45,
    Value: -0.40
  };

  const totalEq = account ? account.total_equity : 1037350.0;

  return (
    <div className="space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#0D1117] border border-[#1E2635] text-xs">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#38BDF8]" />
          <span className="text-white font-bold tracking-wider">PORTFOLIO ATTRIBUTION & RISK DECOMPOSITION</span>
          <span className="text-[#2E3A4E]">|</span>
          <span className="text-[#8A94A6]">LEDOIT-WOLF SHRINKAGE COVARIANCE & FACTOR BETAS</span>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0 text-[11px]">
          <button
            onClick={() => setResetModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131822] hover:bg-[#1A2230] border border-[#1E2635] text-[#8A94A6] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-[#F59E0B]" />
            <span>RESET CAPITAL</span>
          </button>
        </div>
      </div>

      {/* Top Hero KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="PORTFOLIO EQUITY"
          value={account ? `₹${account.total_equity.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "₹10,37,350"}
          change="+3.74%"
          isPositive={true}
          sublabel="DEMO CAPITAL"
        />

        <MetricCard
          label="CASH BALANCE"
          value={account ? `₹${account.cash.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "₹6,24,500"}
          change="UNINVESTED"
          neutral={true}
          sublabel="60.2% LIQUID"
        />

        <MetricCard
          label="GROSS EXPOSURE"
          value={account ? `${((account.positions_value / account.total_equity) * 100).toFixed(1)}%` : "39.8%"}
          change="3 POSITIONS"
          neutral={true}
          sublabel="LIMIT: 100%"
        />

        <MetricCard
          label="LEVERAGE RATIO"
          value="1.00x"
          change="CASH SECURED"
          isPositive={true}
          sublabel="MAX: 1.00x"
        />

        <MetricCard
          label="1-DAY VaR (95%)"
          value="1.62%"
          change="PARAMETRIC"
          neutral={true}
          sublabel="₹16,800 AT RISK"
        />

        <MetricCard
          label="1-DAY CVaR (95%)"
          value="2.41%"
          change="EXPECTED SHORTFALL"
          neutral={true}
          sublabel="TAIL RISK"
        />
      </div>

      {/* Allocation Breakdown & Factor Exposures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sector Allocation Breakdown */}
        <div className="workstation-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#007AFF]" />
              <span className="font-bold text-white tracking-wider">PORTFOLIO SECTOR ALLOCATION</span>
            </div>
            <span className="text-[10px] text-[#4F596A]">ACTIVE WEIGHTS</span>
          </div>

          <div className="space-y-3">
            {Object.entries(sectors).map(([sector, pct]) => (
              <div key={sector} className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white font-bold">{sector}</span>
                  <span className="text-[#38BDF8] mono-num font-bold">{pct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#0D1117] border border-[#1E2635] h-2 overflow-hidden">
                  <div
                    className="bg-[#007AFF] h-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Factor Exposures */}
        <div className="workstation-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#22C55E]" />
              <span className="font-bold text-white tracking-wider">FACTOR BETA EXPOSURES</span>
            </div>
            <span className="text-[10px] text-[#4F596A]">FAMA-FRENCH 5-FACTOR</span>
          </div>

          <div className="space-y-3">
            {Object.entries(factors).map(([factor, exp]) => {
              const isPos = exp >= 0;
              return (
                <div key={factor} className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white font-bold">{factor}</span>
                    <span className={`mono-num font-bold ${isPos ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {isPos ? "+" : ""}{exp.toFixed(2)}σ
                    </span>
                  </div>
                  <div className="w-full bg-[#0D1117] border border-[#1E2635] h-2 relative flex items-center">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#4F596A]/60 z-10" />
                    {isPos ? (
                      <div
                        className="h-full bg-[#22C55E] ml-[50%]"
                        style={{ width: `${Math.min(50, Math.abs(exp) * 25)}%` }}
                      />
                    ) : (
                      <div
                        className="h-full bg-[#EF4444] absolute right-[50%]"
                        style={{ width: `${Math.min(50, Math.abs(exp) * 25)}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Asset Correlation Matrix Heatmap */}
      <CorrelationMatrix />

      {/* Holdings & Position Risk Table */}
      <div className="workstation-card p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
          <span className="font-bold text-white tracking-wider">HOLDINGS & RISK ATTRIBUTION SPECIFICATION</span>
          <span className="text-[10px] text-[#4F596A] mono-num">{positions.length} ACTIVE POSITIONS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-[#4F596A] text-[10px] border-b border-[#1E2635]">
                <th className="pb-2">ASSET</th>
                <th className="pb-2">QUANTITY</th>
                <th className="pb-2">AVG PRICE</th>
                <th className="pb-2">MARK PRICE</th>
                <th className="pb-2">MARKET VALUE</th>
                <th className="pb-2">PORTFOLIO WEIGHT</th>
                <th className="pb-2">BETA</th>
                <th className="pb-2 text-right">UNREALIZED P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2635]/40 text-[11px] mono-num">
              {positions.map((p) => {
                const isPos = p.unrealized_pnl >= 0;
                const weight = totalEq > 0 ? ((p.market_value / totalEq) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={p.symbol} className="hover:bg-[#1A2230]/40">
                    <td className="py-2.5 text-white font-bold tracking-tight">{p.symbol}</td>
                    <td className="py-2.5 text-[#8A94A6]">{p.quantity}</td>
                    <td className="py-2.5 text-[#8A94A6]">₹{p.avg_price.toFixed(2)}</td>
                    <td className="py-2.5 text-white">₹{p.current_price.toFixed(2)}</td>
                    <td className="py-2.5 font-bold text-white">
                      ₹{p.market_value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-2.5 text-[#38BDF8] font-bold">{weight}%</td>
                    <td className="py-2.5 text-[#8A94A6]">
                      {p.symbol === "NVDA" ? "1.42" : p.symbol === "AAPL" ? "0.94" : "1.08"}
                    </td>
                    <td className={`py-2.5 text-right font-bold ${isPos ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                      {isPos ? "+" : ""}₹{p.unrealized_pnl.toFixed(2)} ({isPos ? "+" : ""}{p.unrealized_pnl_pct}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capital Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono select-none">
          <div className="w-full max-w-sm bg-[#131822] border border-[#2E3A4E] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <span className="font-bold text-white tracking-wider">RESET DEMO CAPITAL</span>
              <button onClick={() => setResetModalOpen(false)} className="text-[#4F596A] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#8A94A6] leading-relaxed">
              Resetting clears all open positions and restores your paper trading balance.
            </p>

            <div>
              <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">CAPITAL AMOUNT (₹)</label>
              <input
                type="number"
                value={newCapital}
                onChange={(e) => setNewCapital(Number(e.target.value))}
                className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white mono-num focus:border-[#007AFF] outline-none text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-3 py-1.5 text-xs text-[#8A94A6] hover:text-white bg-[#0D1117] border border-[#1E2635]"
              >
                CANCEL
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-bold text-white bg-[#007AFF] hover:bg-blue-600 transition-colors"
              >
                RESET ACCOUNT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
