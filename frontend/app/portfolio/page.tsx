"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, RotateCcw, AlertCircle, PieChart, ShieldAlert } from "lucide-react";
import { api } from "../../lib/api";
import { AccountTelemetry, PositionRecord } from "../../lib/types";

export default function PortfolioPage() {
  const [attribution, setAttribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [newCapital, setNewCapital] = useState(1000000);

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
  const positions: PositionRecord[] = attribution?.positions || [];
  const sectors = attribution?.sector_allocation || {};
  const factors = attribution?.factor_exposures || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[#0E1115] border border-[#1D232C] text-xs font-mono">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#34C759]" />
          <span className="text-white font-bold">PORTFOLIO ATTRIBUTION & RISK DECOMPOSITION</span>
          <span className="text-[#525C6C]">|</span>
          <span className="text-[#8A94A6]">PAPER TRADING ENVIRONMENT</span>
        </div>

        <button
          onClick={() => setResetModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#13171D] border border-[#2A323E] text-white hover:border-[#FF9500] hover:text-[#FF9500] transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> RESET PAPER ACCOUNT
        </button>
      </div>

      {/* Account Overview Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6]">TOTAL PORTFOLIO EQUITY</span>
          <div className="text-xl font-bold mono-num text-white mt-1">
            ?{account ? account.total_equity.toLocaleString("en-IN") : "---"}
          </div>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6]">AVAILABLE CASH</span>
          <div className="text-xl font-bold mono-num text-[#34C759] mt-1">
            ?{account ? account.cash.toLocaleString("en-IN") : "---"}
          </div>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6]">POSITIONS VALUE</span>
          <div className="text-xl font-bold mono-num text-[#007AFF] mt-1">
            ?{account ? account.positions_value.toLocaleString("en-IN") : "---"}
          </div>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6]">NET EXPOSURE</span>
          <div className="text-xl font-bold mono-num text-white mt-1">
            {account && account.total_equity > 0
              ? `${((account.positions_value / account.total_equity) * 100).toFixed(1)}%`
              : "0.0%"}
          </div>
        </div>
      </div>

      {/* Sector & Factor Exposure Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Allocation */}
        <div className="terminal-card p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1D232C]">
            <h4 className="text-xs font-mono font-bold tracking-wider text-white">
              SECTOR ALLOCATION BREAKDOWN
            </h4>
            <span className="text-[10px] font-mono text-[#525C6C]">% OF PORTFOLIO</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {Object.entries(sectors).length > 0 ? (
              Object.entries(sectors).map(([sec, pct]: any) => (
                <div key={sec}>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-white">{sec}</span>
                    <span className="text-[#34C759]">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-[#13171D] h-1.5">
                    <div className="bg-[#34C759] h-1.5" style={{ width: `${Math.min(100, pct)}%` }}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-[#525C6C]">NO CURRENT SECTOR EXPOSURE</div>
            )}
          </div>
        </div>

        {/* Factor Exposure Scores */}
        <div className="terminal-card p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1D232C]">
            <h4 className="text-xs font-mono font-bold tracking-wider text-white">
              MULTI-FACTOR ALPHA EXPOSURE
            </h4>
            <span className="text-[10px] font-mono text-[#525C6C]">STANDARDIZED Z-SCORES</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            {Object.entries(factors).map(([factor, score]: any) => (
              <div key={factor}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-white">{factor}</span>
                  <span className={score >= 0 ? "text-[#007AFF]" : "text-[#FF9500]"}>
                    {score >= 0 ? "+" : ""}
                    {score.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-[#13171D] h-1.5 flex">
                  <div
                    className={`h-1.5 ${score >= 0 ? "bg-[#007AFF]" : "bg-[#FF9500]"}`}
                    style={{ width: `${Math.min(100, Math.abs(score) * 40)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Positions Holdings Table */}
      <div className="terminal-card p-4">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1D232C]">
          <h4 className="text-xs font-mono font-bold tracking-wider text-white">CURRENT ASSET HOLDINGS</h4>
          <span className="text-[10px] font-mono text-[#525C6C]">{positions.length} SECURITIES</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[#525C6C] border-b border-[#1D232C]">
                <th className="pb-2">SECURITY</th>
                <th className="pb-2">QUANTITY</th>
                <th className="pb-2">AVG COST</th>
                <th className="pb-2">MARKET PRICE</th>
                <th className="pb-2">POSITION VALUE</th>
                <th className="pb-2 text-right">UNREALIZED P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D232C]/50">
              {positions.length > 0 ? (
                positions.map((p) => {
                  const isProfitable = p.unrealized_pnl >= 0;
                  return (
                    <tr key={p.symbol} className="hover:bg-[#13171D]">
                      <td className="py-2.5 text-white font-bold">{p.symbol}</td>
                      <td className="py-2.5 text-[#8A94A6]">{p.quantity}</td>
                      <td className="py-2.5 text-[#8A94A6]">?{p.avg_price.toFixed(2)}</td>
                      <td className="py-2.5 text-white">?{p.current_price.toFixed(2)}</td>
                      <td className="py-2.5 text-[#007AFF]">?{p.market_value.toLocaleString("en-IN")}</td>
                      <td
                        className={`py-2.5 text-right font-bold ${
                          isProfitable ? "text-[#34C759]" : "text-[#FF3B30]"
                        }`}
                      >
                        {isProfitable ? "+" : ""}?{p.unrealized_pnl.toFixed(2)} ({p.unrealized_pnl_pct.toFixed(2)}%)
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#525C6C]">
                    NO POSITIONS CURRENTLY ACTIVE IN PORTFOLIO
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Account Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0E1115] border border-[#FF9500] p-6 shadow-2xl">
            <h3 className="text-base font-bold font-mono tracking-wider text-white mb-2">
              RESET PAPER ACCOUNT
            </h3>
            <p className="text-xs text-[#8A94A6] mb-4">
              This will liquidate all simulated paper positions, zero out historic orders, and restore initial cash.
            </p>

            <div className="mb-4 text-xs font-mono">
              <label className="text-[#8A94A6] block mb-1">INITIAL DEMO CAPITAL (?)</label>
              <input
                type="number"
                value={newCapital}
                onChange={(e) => setNewCapital(Number(e.target.value))}
                className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
              />
            </div>

            <div className="flex justify-end gap-3 font-mono text-xs">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 border border-[#1D232C] text-[#8A94A6] hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-[#FF9500] text-black font-bold hover:bg-amber-500 transition-colors"
              >
                CONFIRM RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
