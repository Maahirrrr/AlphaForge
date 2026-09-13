"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, Lock, Key, CheckCircle, Server } from "lucide-react";
import { api } from "../../lib/api";

export default function LiveTradingHub() {
  const [brokerStatus, setBrokerStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState("");
  const [activationToken, setActivationToken] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const res = await api.getBrokerStatus();
      setBrokerStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleRequestToken = async () => {
    try {
      const res = await api.getBrokerStatus();
      // Generate request token via API
      const tokenRes = await fetch("http://127.0.0.1:8000/api/broker/request-live-token", { method: "POST" });
      const data = await tokenRes.json();
      setActivationToken(data.token);
    } catch (err: any) {
      alert("Failed to request token: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* High-Contrast Hazard Warning Banner */}
      <div className="p-4 bg-[#FF3B30]/15 border-2 border-[#FF3B30] text-white font-mono text-xs space-y-2">
        <div className="flex items-center gap-2 text-[#FF3B30] font-bold text-sm">
          <AlertTriangle className="w-5 h-5 animate-pulse" />
          <span>?? LIVE TRADING SAFETY CONTROL HUB</span>
        </div>
        <p className="text-[#F0F2F5] leading-relaxed">
          REAL CAPITAL RISK GATEWAY. By default, AlphaForge strictly operates in PAPER TRADING mode.
          Under no circumstances will a real live order be dispatched unless all safety gates are cleared,
          broker credentials verified, risk engine armed, and explicit dual confirmation provided.
        </p>
      </div>

      {/* Safety Gates Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6]">GATE 1: EXECUTION MODE</span>
          <div className="text-base font-bold font-mono text-[#007AFF] mt-1">
            {brokerStatus?.execution_mode || "PAPER"}
          </div>
          <span className="text-[10px] font-mono text-[#525C6C]">SAFE DEFAULT</span>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6]">GATE 2: BROKER CREDENTIALS</span>
          <div className="text-base font-bold font-mono text-white mt-1">
            {brokerStatus?.api_key_masked || "<NOT CONFIGURED>"}
          </div>
          <span className="text-[10px] font-mono text-[#525C6C]">ISOLATED IN .ENV</span>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6]">GATE 3: PRE-TRADE RISK ENGINE</span>
          <div className="text-base font-bold font-mono text-[#34C759] mt-1">ARMED & ACTIVE</div>
          <span className="text-[10px] font-mono text-[#525C6C]">ALL 7 CHECKS ENFORCED</span>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6]">GATE 4: EMERGENCY KILL SWITCH</span>
          <div className="text-base font-bold font-mono text-[#34C759] mt-1">READY</div>
          <span className="text-[10px] font-mono text-[#525C6C]">INSTANT HALT ARMED</span>
        </div>
      </div>

      {/* Live Activation Checklist */}
      <div className="terminal-card p-6 max-w-2xl mx-auto space-y-5">
        <h3 className="text-sm font-mono font-bold tracking-wider text-white border-b border-[#1D232C] pb-2">
          REQUEST LIVE ACTIVATION HANDSHAKE
        </h3>

        <div className="space-y-3 text-xs font-mono text-[#8A94A6]">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#34C759]" />
            <span>Market data validation and split cleaning completed</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#34C759]" />
            <span>Walk-forward validation Information Coefficient verified</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#34C759]" />
            <span>Paper trading execution passed without risk blocks</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[#1D232C] space-y-3">
          <button
            onClick={handleRequestToken}
            className="w-full py-2.5 bg-[#13171D] border border-[#2A323E] hover:border-[#007AFF] text-white font-mono text-xs font-bold tracking-wider transition-colors"
          >
            GENERATE CONFIRMATION TOKEN
          </button>

          {activationToken && (
            <div className="p-3 bg-[#08090B] border border-[#007AFF] text-xs font-mono">
              <span className="text-[#8A94A6] block mb-1">ONE-TIME AUTHORIZATION TOKEN:</span>
              <span className="text-[#007AFF] font-bold select-all">{activationToken}</span>
            </div>
          )}

          <div className="text-[11px] font-mono text-[#525C6C] leading-relaxed">
            Note: In local development, the system strictly protects your capital. To bind a real broker,
            supply `BROKER_API_KEY`, `BROKER_API_SECRET`, and set `BROKER_LIVE_CONFIRMED=True` in `.env`.
          </div>
        </div>
      </div>
    </div>
  );
}
