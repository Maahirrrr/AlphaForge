"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  LayoutDashboard, 
  Cpu, 
  LineChart, 
  Sliders, 
  Briefcase, 
  ListOrdered, 
  ShieldAlert, 
  Settings, 
  Play, 
  RotateCcw, 
  ArrowRight,
  TrendingUp,
  X
} from "lucide-react";
import { api } from "../../lib/api";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShortcuts: () => void;
}

interface CommandItem {
  id: string;
  category: "NAVIGATION" | "ACTIONS" | "SYMBOLS";
  title: string;
  subtitle?: string;
  shortcut?: string;
  icon: any;
  action: () => void;
}

export default function CommandPalette({ isOpen, onClose, onOpenShortcuts }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: CommandItem[] = [
    // Navigation
    {
      id: "nav-cockpit",
      category: "NAVIGATION",
      title: "Open Cockpit Dashboard",
      subtitle: "Telemetry, active strategies, risk monitor",
      shortcut: "⌘1",
      icon: LayoutDashboard,
      action: () => { router.push("/dashboard"); onClose(); }
    },
    {
      id: "nav-research",
      category: "NAVIGATION",
      title: "Open Research Lab",
      subtitle: "Supervised ML, TreeSHAP, Walk-forward validation",
      shortcut: "⌘2",
      icon: Cpu,
      action: () => { router.push("/research"); onClose(); }
    },
    {
      id: "nav-backtest",
      category: "NAVIGATION",
      title: "Open Backtest Lab",
      subtitle: "Event-driven simulation, slippage, trade logs",
      shortcut: "⌘3",
      icon: LineChart,
      action: () => { router.push("/backtest"); onClose(); }
    },
    {
      id: "nav-strategies",
      category: "NAVIGATION",
      title: "Open Strategy Studio",
      subtitle: "Figma for quant strategies, rule canvas",
      shortcut: "⌘4",
      icon: Sliders,
      action: () => { router.push("/strategies"); onClose(); }
    },
    {
      id: "nav-portfolio",
      category: "NAVIGATION",
      title: "Open Portfolio & Risk",
      subtitle: "Ledoit-Wolf factor exposure, correlation matrix",
      shortcut: "⌘5",
      icon: Briefcase,
      action: () => { router.push("/portfolio"); onClose(); }
    },
    {
      id: "nav-orders",
      category: "NAVIGATION",
      title: "Open Order Blotter",
      subtitle: "Simulated paper and live execution blotter",
      shortcut: "⌘6",
      icon: ListOrdered,
      action: () => { router.push("/orders"); onClose(); }
    },
    {
      id: "nav-live",
      category: "NAVIGATION",
      title: "Open Live Safety Hub",
      subtitle: "Pre-trade risk gates, Kill switch, Token gates",
      shortcut: "⌘7",
      icon: ShieldAlert,
      action: () => { router.push("/live"); onClose(); }
    },
    {
      id: "nav-settings",
      category: "NAVIGATION",
      title: "Open Terminal Settings",
      subtitle: "Risk parameters, broker APIs, general preferences",
      shortcut: "⌘8",
      icon: Settings,
      action: () => { router.push("/settings"); onClose(); }
    },

    // Actions
    {
      id: "act-run-backtest",
      category: "ACTIONS",
      title: "Run Latest Backtest Simulation",
      subtitle: "Executes ML Cross-Sectional Alpha backtest",
      shortcut: "B",
      icon: Play,
      action: () => { router.push("/backtest"); onClose(); }
    },
    {
      id: "act-train-model",
      category: "ACTIONS",
      title: "Train XGBoost Alpha Model",
      subtitle: "Runs 16-fold walk forward validation for AAPL",
      shortcut: "T",
      icon: Cpu,
      action: () => { router.push("/research"); onClose(); }
    },
    {
      id: "act-kill-switch",
      category: "ACTIONS",
      title: "Trigger Emergency Kill Switch",
      subtitle: "Immediately halts trading engine and blocks orders",
      shortcut: "K",
      icon: ShieldAlert,
      action: async () => {
        await api.triggerKillSwitch("Operator trigger from Command Palette");
        onClose();
      }
    },
    {
      id: "act-reset-portfolio",
      category: "ACTIONS",
      title: "Reset Paper Account Capital",
      subtitle: "Restores initial virtual capital to ₹10,00,000",
      shortcut: "R",
      icon: RotateCcw,
      action: async () => {
        await api.resetPortfolio(1000000);
        router.push("/dashboard");
        onClose();
      }
    },
    {
      id: "act-shortcuts",
      category: "ACTIONS",
      title: "View Keyboard Shortcuts",
      subtitle: "Opens comprehensive terminal keybindings map",
      shortcut: "?",
      icon: Settings,
      action: () => { onClose(); onOpenShortcuts(); }
    },

    // Symbols
    {
      id: "sym-aapl",
      category: "SYMBOLS",
      title: "Inspect AAPL (Apple Inc.)",
      subtitle: "US Tech Universe · Market Quote & Signals",
      icon: TrendingUp,
      action: () => { router.push("/dashboard"); onClose(); }
    },
    {
      id: "sym-nvda",
      category: "SYMBOLS",
      title: "Inspect NVDA (NVIDIA Corp.)",
      subtitle: "Semiconductors · High Volatility Regime",
      icon: TrendingUp,
      action: () => { router.push("/dashboard"); onClose(); }
    },
    {
      id: "sym-reliance",
      category: "SYMBOLS",
      title: "Inspect RELIANCE.NS (Reliance Industries)",
      subtitle: "India Nifty Universe · Energy & Telecom",
      icon: TrendingUp,
      action: () => { router.push("/dashboard"); onClose(); }
    }
  ];

  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/80 backdrop-blur-xs p-4 font-mono select-none">
      <div className="w-full max-w-xl bg-[#131822] border border-[#2E3A4E] shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
        {/* Search Header */}
        <div className="p-3 bg-[#0D1117] border-b border-[#1E2635] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#007AFF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, route, or symbol (e.g. 'Backtest', 'AAPL')..."
            className="w-full bg-transparent border-none outline-none text-white text-xs placeholder:text-[#4F596A]"
          />
          <button onClick={onClose} className="text-[#4F596A] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 divide-y divide-[#1E2635]/40 flex-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#4F596A]">
              NO COMMANDS MATCHING &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#1A2230] text-white border-l-2 border-[#007AFF]"
                      : "text-[#8A94A6] hover:bg-[#1A2230]/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#007AFF]" : "text-[#4F596A]"}`} />
                    <div className="truncate">
                      <div className="text-[12px] font-bold text-[#F0F3F8] tracking-tight">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[10px] text-[#8A94A6] truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] text-[#4F596A] px-1.5 py-0.5 bg-[#090C10] border border-[#1E2635]">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <span className="kbd-hint text-[9px]">{item.shortcut}</span>
                    )}
                    <ArrowRight className={`w-3 h-3 ${isSelected ? "text-[#007AFF]" : "opacity-0"}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Guidance */}
        <div className="p-2 bg-[#090C10] border-t border-[#1E2635] flex items-center justify-between text-[10px] text-[#4F596A]">
          <div className="flex items-center gap-2">
            <span>Navigate <kbd className="kbd-hint text-[8px]">↑</kbd> <kbd className="kbd-hint text-[8px]">↓</kbd></span>
            <span>Select <kbd className="kbd-hint text-[8px]">Enter</kbd></span>
            <span>Close <kbd className="kbd-hint text-[8px]">Esc</kbd></span>
          </div>
          <div>ALPHA_FORGE v1.0.4</div>
        </div>
      </div>
    </div>
  );
}
