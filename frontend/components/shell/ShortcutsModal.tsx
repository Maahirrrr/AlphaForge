"use client";

import React, { useEffect } from "react";
import { X, Keyboard } from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: "WORKSPACE NAVIGATION",
      shortcuts: [
        { key: "⌘ 1", desc: "Open Cockpit Dashboard" },
        { key: "⌘ 2", desc: "Open Quantitative Research Lab" },
        { key: "⌘ 3", desc: "Open Backtesting Lab" },
        { key: "⌘ 4", desc: "Open Strategy Studio" },
        { key: "⌘ 5", desc: "Open Portfolio Attribution & Risk" },
        { key: "⌘ 6", desc: "Open Order Management Blotter" },
        { key: "⌘ 7", desc: "Open Live Execution Safety Hub" },
        { key: "⌘ 8", desc: "Open Terminal System Settings" },
      ],
    },
    {
      title: "GLOBAL SYSTEM CONTROLS",
      shortcuts: [
        { key: "⌘ K", desc: "Open Global Command Palette" },
        { key: "?", desc: "Open Keyboard Shortcuts Map" },
        { key: "Esc", desc: "Close Active Modal / Slide-Over Drawer" },
        { key: "R", desc: "Trigger Telemetry Stream Refresh" },
      ],
    },
    {
      title: "EXECUTION & EXPERIMENT SHORTCUTS",
      shortcuts: [
        { key: "B", desc: "Run Active Backtest Simulation" },
        { key: "T", desc: "Run Supervised XGBoost Model Train" },
        { key: "K", desc: "Trigger Global Emergency Kill Switch" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 font-mono select-none">
      <div className="w-full max-w-xl bg-[#131822] border border-[#2E3A4E] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 bg-[#0D1117] border-b border-[#1E2635] flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xs">
            <Keyboard className="w-4 h-4 text-[#007AFF]" />
            <span>TERMINAL KEYBINDINGS & ACCELERATORS</span>
          </div>
          <button onClick={onClose} className="text-[#4F596A] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts Body */}
        <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {shortcutGroups.map((grp) => (
            <div key={grp.title} className="space-y-2">
              <div className="text-[10px] font-bold text-[#4F596A] tracking-wider border-b border-[#1E2635] pb-1">
                {grp.title}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {grp.shortcuts.map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between p-1.5 hover:bg-[#1A2230] text-xs transition-colors"
                  >
                    <span className="text-[#8A94A6]">{s.desc}</span>
                    <kbd className="kbd-hint text-[11px] font-bold">{s.key}</kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-2 bg-[#090C10] border-t border-[#1E2635] text-right text-[10px] text-[#4F596A]">
          Press <kbd className="kbd-hint text-[9px]">Esc</kbd> to exit
        </div>
      </div>
    </div>
  );
}
