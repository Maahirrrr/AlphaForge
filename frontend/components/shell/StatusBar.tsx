"use client";

import React, { useState, useEffect } from "react";
import { Activity, ShieldCheck, Database, Clock, Cpu } from "lucide-react";

interface StatusBarProps {
  onOpenShortcuts: () => void;
}

export default function StatusBar({ onOpenShortcuts }: StatusBarProps) {
  const [timeUtc, setTimeUtc] = useState("");
  const [timeEst, setTimeEst] = useState("");
  const [timeIst, setTimeIst] = useState("");

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + " UTC");
      setTimeEst(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "America/New_York",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now) + " EST"
      );
      setTimeIst(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(now) + " IST"
      );
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-[#090C10] border-t border-[#1E2635] h-7 flex items-center justify-between px-3 text-[10px] font-mono select-none text-[#8A94A6] z-40">
      {/* Left: Operational Subsystem Telemetry */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-[#22C55E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span className="font-bold">ENGINE: RUNNING</span>
        </span>

        <span className="text-[#2E3A4E]">|</span>

        <span className="hidden sm:flex items-center gap-1 text-[#F0F3F8]">
          <ShieldCheck className="w-3 h-3 text-[#007AFF]" />
          <span>RISK ENGINE: ARMED (100%)</span>
        </span>

        <span className="hidden md:inline text-[#2E3A4E]">|</span>

        <span className="hidden md:flex items-center gap-1 text-[#8A94A6]">
          <Database className="w-3 h-3 text-[#38BDF8]" />
          <span>DB: SQLITE_SYNCED</span>
        </span>
      </div>

      {/* Center: Realtime Telemetry Latency & Memory */}
      <div className="hidden lg:flex items-center gap-4 text-[#4F596A]">
        <span>
          LATENCY: <strong className="text-[#22C55E] mono-num">24ms</strong>
        </span>
        <span>•</span>
        <span>
          DRIFT MONITOR: <strong className="text-[#38BDF8] mono-num">0.00% (NORMAL)</strong>
        </span>
        <span>•</span>
        <span>
          MEMORY: <strong className="text-white mono-num">142MB</strong>
        </span>
      </div>

      {/* Right: Multi-Timezone Clocks + Shortcut Modal Trigger */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 mono-num text-[#8A94A6]">
          <Clock className="w-3 h-3 text-[#4F596A]" />
          <span>{timeUtc || "--:--:-- UTC"}</span>
          <span className="text-[#2E3A4E]">/</span>
          <span>{timeEst || "--:--:-- EST"}</span>
          <span className="text-[#2E3A4E]">/</span>
          <span className="text-[#F0F3F8]">{timeIst || "--:--:-- IST"}</span>
        </div>

        <span className="text-[#2E3A4E]">|</span>

        <button
          onClick={onOpenShortcuts}
          className="flex items-center gap-1 text-[#8A94A6] hover:text-[#F0F3F8] hover:bg-[#131822] px-1.5 py-0.5 border border-transparent hover:border-[#1E2635] transition-colors"
        >
          <kbd className="kbd-hint text-[9px]">?</kbd>
          <span className="hidden sm:inline">SHORTCUTS</span>
        </button>
      </div>
    </footer>
  );
}
