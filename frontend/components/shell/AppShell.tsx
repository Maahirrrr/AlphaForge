"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import MarketTicker from "./MarketTicker";
import StatusBar from "./StatusBar";
import CommandPalette from "./CommandPalette";
import ShortcutsModal from "./ShortcutsModal";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Global Keyboard Navigation & Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input or textarea
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      // Meta (Command on Mac) or Ctrl (Windows)
      const isModifier = e.metaKey || e.ctrlKey;

      if (isModifier && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isModifier && e.key === "1") {
        e.preventDefault();
        router.push("/dashboard");
        return;
      }
      if (isModifier && e.key === "2") {
        e.preventDefault();
        router.push("/research");
        return;
      }
      if (isModifier && e.key === "3") {
        e.preventDefault();
        router.push("/backtest");
        return;
      }
      if (isModifier && e.key === "4") {
        e.preventDefault();
        router.push("/strategies");
        return;
      }
      if (isModifier && e.key === "5") {
        e.preventDefault();
        router.push("/portfolio");
        return;
      }
      if (isModifier && e.key === "6") {
        e.preventDefault();
        router.push("/orders");
        return;
      }
      if (isModifier && e.key === "7") {
        e.preventDefault();
        router.push("/live");
        return;
      }
      if (isModifier && e.key === "8") {
        e.preventDefault();
        router.push("/settings");
        return;
      }

      if (isModifier && e.key === "[") {
        e.preventDefault();
        setCollapsed((prev) => !prev);
        return;
      }

      // If not in input, '?' opens shortcuts modal
      if (!isInput && e.key === "?") {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F0F3F8] flex flex-col font-sans selection:bg-[#007AFF]/30 selection:text-white overflow-hidden">
      {/* 1. Fixed TopBar */}
      <TopBar 
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* 2. Global Horizontal Market Ticker */}
      <MarketTicker />

      {/* 3. Main Center Workspace: Sidebar + Dynamic Route Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
        />

        {/* Scrollable Workstation Canvas */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-5 space-y-5 bg-[#08090B] subtle-grid">
          {children}
        </main>
      </div>

      {/* 4. Fixed Telemetry Bottom Status Bar */}
      <StatusBar 
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* 5. Modals & Overlays */}
      <CommandPalette 
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      <ShortcutsModal 
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
