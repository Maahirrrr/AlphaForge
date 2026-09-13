"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldAlert, 
  Terminal, 
  Activity, 
  Database, 
  Lock, 
  CheckCircle2, 
  AlertTriangle 
} from "lucide-react";
import { api } from "../lib/api";
import { KillSwitchStatus } from "../lib/types";

export default function Navbar() {
  const pathname = usePathname();
  const [killSwitch, setKillSwitch] = useState<KillSwitchStatus>({
    kill_switch_active: false,
    status: "NORMAL"
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const risk = await api.getRiskStatus();
      if (risk?.kill_switch) {
        setKillSwitch(risk.kill_switch);
      }
      const health = await api.getHealth();
      setIsLiveMode(health?.live_trading_enabled || false);
    } catch (e) {
      // Backend maybe initializing
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerKillSwitch = async () => {
    setLoading(true);
    try {
      const res = await api.triggerKillSwitch("Manual Emergency Halt from Navbar");
      setKillSwitch(res);
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Failed to trigger kill switch: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { label: "COCKPIT", href: "/dashboard" },
    { label: "RESEARCH LAB", href: "/research" },
    { label: "BACKTEST LAB", href: "/backtest" },
    { label: "STRATEGIES", href: "/strategies" },
    { label: "PORTFOLIO", href: "/portfolio" },
    { label: "ORDERS", href: "/orders" },
    { label: "LIVE SAFETY HUB", href: "/live" },
    { label: "SETTINGS", href: "/settings" }
  ];

  return (
    <>
      <header className="w-full bg-[#08090B] border-b border-[#1D232C] sticky top-0 z-50">
        {/* System Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#151921] text-[11px] mono-num text-[#8A94A6]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-white font-bold tracking-wider">
              <Terminal className="w-3.5 h-3.5 text-[#007AFF]" />
              ALPHAFORGE <span className="text-[#525C6C]">v1.0.0</span>
            </span>
            <span className="hidden sm:inline text-[#525C6C]">|</span>
            <span className="hidden sm:flex items-center gap-1 text-[#34C759]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse"></span>
              CORE ONLINE
            </span>
            <span className="hidden md:flex items-center gap-1 text-[#525C6C]">
              <Database className="w-3 h-3" /> DB: LOCAL_SYNC
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Indicator Badge */}
            {isLiveMode ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#FF3B30]/20 border border-[#FF3B30] text-[#FF3B30] font-bold tracking-wider animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#FF3B30]"></span>
                LIVE TRADING
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-[#13171D] border border-[#2A323E] text-[#007AFF] font-bold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]"></span>
                PAPER TRADING (DEFAULT)
              </div>
            )}

            {/* Kill Switch Trigger */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center gap-1.5 px-2.5 py-0.5 font-bold tracking-wider border transition-all ${
                killSwitch.kill_switch_active
                  ? "bg-[#FF3B30] text-white border-[#FF3B30] animate-bounce"
                  : "bg-[#1B0E0E] text-[#FF3B30] border-[#FF3B30]/40 hover:bg-[#FF3B30] hover:text-white"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {killSwitch.kill_switch_active ? "[ HALTED - KILL SWITCH ACTIVE ]" : "[ KILL SWITCH ]"}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 overflow-x-auto">
          <nav className="flex space-x-1 py-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-[11px] font-mono tracking-wider transition-colors uppercase whitespace-nowrap border-b-2 ${
                    active
                      ? "border-[#007AFF] text-white bg-[#0E1115]"
                      : "border-transparent text-[#8A94A6] hover:text-white hover:border-[#2A323E]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Kill Switch Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0E1115] border border-[#FF3B30] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-[#FF3B30] mb-4">
              <AlertTriangle className="w-7 h-7" />
              <div>
                <h3 className="text-base font-bold tracking-wider">EMERGENCY KILL SWITCH</h3>
                <p className="text-xs text-[#8A94A6]">IMMEDIATE ORDER HALT & CANCELLATION</p>
              </div>
            </div>

            <p className="text-xs text-[#F0F2F5] mb-6 leading-relaxed">
              Activating the emergency kill switch will immediately:
              <br />• Terminate all active strategy execution loops
              <br />• Cancel any pending unfilled orders at the broker
              <br />• Block all new manual or algorithmic order submissions
              <br />• Preserve portfolio state and write an immutable audit log
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-[#1D232C] text-xs font-mono text-[#8A94A6] hover:text-white hover:bg-[#13171D]"
              >
                CANCEL
              </button>
              <button
                onClick={handleTriggerKillSwitch}
                disabled={loading}
                className="px-5 py-2 bg-[#FF3B30] text-white text-xs font-bold font-mono tracking-wider hover:bg-red-700 transition-colors"
              >
                {loading ? "HALTING..." : "CONFIRM EMERGENCY HALT"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
