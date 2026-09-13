"use client";

import React, { useState, useEffect } from "react";
import { Settings, Shield, DollarSign, Database, Server } from "lucide-react";
import { api } from "../../lib/api";

export default function SettingsPage() {
  const [risk, setRisk] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.getRiskStatus();
        setRisk(r);
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
          <Settings className="w-4 h-4 text-[#007AFF]" />
          <span className="text-white font-bold">SYSTEM CONFIGURATION & PARAMETERS</span>
          <span className="text-[#525C6C]">|</span>
          <span className="text-[#8A94A6]">RISK LIMITS, BROKER APIS & COST MODELS</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Limits */}
        <div className="terminal-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1D232C] pb-2 text-white font-mono font-bold text-xs">
            <Shield className="w-4 h-4 text-[#34C759]" />
            <span>PRE-TRADE RISK LIMITS</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between border-b border-[#1D232C]/40 pb-1.5">
              <span className="text-[#8A94A6]">MAX PORTFOLIO EXPOSURE</span>
              <span className="text-white font-bold">
                {risk?.limits?.max_portfolio_exposure ? `${risk.limits.max_portfolio_exposure * 100}%` : "100%"}
              </span>
            </div>

            <div className="flex justify-between border-b border-[#1D232C]/40 pb-1.5">
              <span className="text-[#8A94A6]">MAX SINGLE POSITION WEIGHT</span>
              <span className="text-white font-bold">
                {risk?.limits?.max_position_weight ? `${risk.limits.max_position_weight * 100}%` : "15%"}
              </span>
            </div>

            <div className="flex justify-between border-b border-[#1D232C]/40 pb-1.5">
              <span className="text-[#8A94A6]">MAX DAILY LOSS THRESHOLD</span>
              <span className="text-[#FF3B30] font-bold">
                {risk?.limits?.max_daily_loss_pct ? `-${risk.limits.max_daily_loss_pct * 100}%` : "-2%"}
              </span>
            </div>

            <div className="flex justify-between border-b border-[#1D232C]/40 pb-1.5">
              <span className="text-[#8A94A6]">MAX DRAWDOWN HALT LIMIT</span>
              <span className="text-[#FF3B30] font-bold">
                {risk?.limits?.max_drawdown_pct ? `-${risk.limits.max_drawdown_pct * 100}%` : "-15%"}
              </span>
            </div>

            <div className="flex justify-between border-b border-[#1D232C]/40 pb-1.5">
              <span className="text-[#8A94A6]">MAX SINGLE ORDER NOTIONAL</span>
              <span className="text-white font-bold">
                ₹{risk?.limits?.max_order_value ? risk.limits.max_order_value.toLocaleString("en-IN") : "2,00,000"}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction Cost Model */}
        <div className="terminal-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1D232C] pb-2 text-white font-mono font-bold text-xs">
            <DollarSign className="w-4 h-4 text-[#FF9500]" />
            <span>TRANSACTION COSTS & SLIPPAGE SPECIFICATION</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between border-b border-[#1D232C]/40 pb-1.5">
              <span className="text-[#8A94A6]">DEFAULT FIXED SLIPPAGE</span>
              <span className="text-white font-bold">5.0 Basis Points (0.05%)</span>
            </div>

            <div className="flex justify-between border-b border-[#1D232C]/40 pb-1.5">
              <span className="text-[#8A94A6]">BROKER COMMISSION</span>
              <span className="text-white font-bold">3.0 Basis Points (0.03%)</span>
            </div>

            <div className="flex justify-between border-b border-[#1D232C]/40 pb-1.5">
              <span className="text-[#8A94A6]">EXCHANGE TURNOVER FEE</span>
              <span className="text-white font-bold">0.35 Basis Points</span>
            </div>

            <div className="flex justify-between border-b border-[#1D232C]/40 pb-1.5">
              <span className="text-[#8A94A6]">SECURITIES TRANSACTION TAX (STT)</span>
              <span className="text-white font-bold">10.0 Basis Points (0.10%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
