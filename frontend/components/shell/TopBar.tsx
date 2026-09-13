"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Terminal, 
  ShieldAlert, 
  Search, 
  Bell, 
  Settings, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  Lock
} from "lucide-react";
import { api } from "../../lib/api";
import { KillSwitchStatus, AccountTelemetry } from "../../lib/types";

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
}

export default function TopBar({ onOpenCommandPalette, onOpenShortcuts }: TopBarProps) {
  const pathname = usePathname();
  const [killSwitch, setKillSwitch] = useState<KillSwitchStatus>({
    kill_switch_active: false,
    status: "NORMAL",
  });
  const [account, setAccount] = useState<AccountTelemetry | null>(null);
  const [isKillModalOpen, setIsKillModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(2);

  const fetchTelemetry = async () => {
    try {
      const risk = await api.getRiskStatus();
      if (risk?.kill_switch) setKillSwitch(risk.kill_switch);
      const summary = await api.getPortfolioSummary("PAPER");
      if (summary?.account) setAccount(summary.account);
    } catch (e) {
      // Backend maybe offline in demo mode
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerKillSwitch = async () => {
    setLoading(true);
    try {
      const res = await api.triggerKillSwitch("Operator Emergency Halt from Global Shell");
      setKillSwitch(res);
      setIsKillModalOpen(false);
    } catch (err: any) {
      alert("Failed to trigger emergency halt: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Determine current workspace title from pathname
  const getWorkspaceLabel = () => {
    if (pathname.includes("/research")) return "RESEARCH LAB";
    if (pathname.includes("/backtest")) return "BACKTEST LAB";
    if (pathname.includes("/strategies")) return "STRATEGY STUDIO";
    if (pathname.includes("/portfolio")) return "PORTFOLIO & RISK";
    if (pathname.includes("/orders")) return "ORDER BLOTTER";
    if (pathname.includes("/live")) return "LIVE SAFETY HUB";
    if (pathname.includes("/settings")) return "TERMINAL SETTINGS";
    return "COCKPIT DASHBOARD";
  };

  return (
    <>
      <header className="w-full bg-[#0D1117] border-b border-[#1E2635] h-12 flex items-center justify-between px-4 text-xs font-mono select-none z-40 sticky top-0">
        {/* Left: Brand + Breadcrumb Workspace */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 text-white font-bold tracking-wider hover:opacity-90 transition-opacity">
            <div className="w-6 h-6 bg-[#007AFF]/15 border border-[#007AFF]/50 flex items-center justify-center text-[#007AFF]">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <span className="text-[#F0F3F8] tracking-widest text-[13px]">ALPHAFORGE</span>
          </Link>

          <span className="text-[#2E3A4E]">/</span>

          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#131822] border border-[#1E2635] text-[#38BDF8] font-bold text-[11px] tracking-wider">
            {getWorkspaceLabel()}
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 bg-[#131822] border border-[#1E2635] text-[#8A94A6] text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            <span>US MARKETS OPEN</span>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center justify-between gap-6 px-3 py-1.5 bg-[#131822] hover:bg-[#1A2230] border border-[#1E2635] hover:border-[#2E3A4E] text-[#8A94A6] transition-all text-[11px] w-64 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Search or command...</span>
          </span>
          <span className="kbd-hint">⌘K</span>
        </button>

        {/* Right: Telemetry + Paper/Live Status + Kill Switch */}
        <div className="flex items-center gap-3">
          {/* Portfolio P&L Quick Pill */}
          {account && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#131822] border border-[#1E2635] text-[11px]">
              <span className="text-[#8A94A6]">P&L:</span>
              <span
                className={`font-bold mono-num ${
                  account.total_pnl >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                }`}
              >
                {account.total_pnl >= 0 ? "+" : ""}₹{account.total_pnl.toLocaleString("en-IN")}
              </span>
              <span
                className={`text-[10px] font-bold mono-num ${
                  account.total_pnl >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"
                }`}
              >
                ({account.total_pnl >= 0 ? "+" : ""}{account.total_pnl_pct}%)
              </span>
            </div>
          )}

          {/* Execution Mode Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131822] border border-[#1E2635] text-[#007AFF] font-bold tracking-wider text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></span>
            <span>PAPER TRADING</span>
          </div>

          {/* Emergency Kill Switch Button */}
          <button
            onClick={() => setIsKillModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1 font-bold tracking-wider border transition-all text-[11px] ${
              killSwitch.kill_switch_active
                ? "bg-[#EF4444] text-white border-[#EF4444] animate-pulse"
                : "bg-[#251012] text-[#EF4444] border-[#EF4444]/40 hover:bg-[#EF4444] hover:text-white"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{killSwitch.kill_switch_active ? "HALTED" : "KILL SWITCH"}</span>
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 text-[#8A94A6] hover:text-white hover:bg-[#131822] border border-transparent hover:border-[#1E2635] transition-all relative"
            title="Keyboard Shortcuts (?)"
          >
            <span className="kbd-hint">?</span>
          </button>

          {/* Settings Link */}
          <Link
            href="/settings"
            className="p-1.5 text-[#8A94A6] hover:text-white hover:bg-[#131822] border border-transparent hover:border-[#1E2635] transition-all"
            title="Terminal Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Emergency Kill Switch Confirmation Modal */}
      {isKillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono">
          <div className="w-full max-w-md bg-[#131822] border-2 border-[#EF4444] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-[#EF4444]">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <h3 className="text-base font-bold tracking-wider">
                EMERGENCY KILL SWITCH TRIGGER
              </h3>
            </div>

            <p className="text-xs text-[#F0F3F8] leading-relaxed">
              Activating the Global Kill Switch immediately halts the algorithmic trading engine, blocks all active order submissions, and freezes portfolio rebalancing loops.
            </p>

            <div className="p-3 bg-[#0D1117] border border-[#1E2635] text-[11px] text-[#8A94A6] space-y-1">
              <div>TARGET SUBSYSTEM: <span className="text-white font-bold">EVENT_DISPATCHER & RISK_ENGINE</span></div>
              <div>REASON: <span className="text-white">OPERATOR_MANUAL_HALT</span></div>
              <div>RESET PROTOCOL: <span className="text-white">REQUIRES VALID AUTHENTICATION TOKEN</span></div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsKillModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#8A94A6] hover:text-white bg-[#0D1117] border border-[#1E2635]"
              >
                CANCEL
              </button>
              <button
                onClick={handleTriggerKillSwitch}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-white bg-[#EF4444] hover:bg-red-600 transition-colors"
              >
                {loading ? "HALTING ENGINE..." : "CONFIRM EMERGENCY HALT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
