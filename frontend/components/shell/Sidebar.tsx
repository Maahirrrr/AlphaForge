"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Cpu, 
  LineChart, 
  Sliders, 
  Briefcase, 
  ListOrdered, 
  ShieldAlert, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Radio
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  const navSections = [
    {
      title: "CORE",
      items: [
        {
          label: "Cockpit",
          href: "/dashboard",
          icon: LayoutDashboard,
          shortcut: "⌘1",
          statusColor: "bg-[#22C55E]",
        },
        {
          label: "Research Lab",
          href: "/research",
          icon: Cpu,
          shortcut: "⌘2",
          statusColor: "bg-[#38BDF8]",
        },
        {
          label: "Backtest Lab",
          href: "/backtest",
          icon: LineChart,
          shortcut: "⌘3",
          statusColor: "bg-[#22C55E]",
        },
        {
          label: "Strategy Studio",
          href: "/strategies",
          icon: Sliders,
          shortcut: "⌘4",
          statusColor: "bg-[#F59E0B]",
        },
      ],
    },
    {
      title: "RISK & EXECUTION",
      items: [
        {
          label: "Portfolio & Risk",
          href: "/portfolio",
          icon: Briefcase,
          shortcut: "⌘5",
          statusColor: "bg-[#38BDF8]",
        },
        {
          label: "Order Blotter",
          href: "/orders",
          icon: ListOrdered,
          shortcut: "⌘6",
          statusColor: "bg-[#22C55E]",
        },
        {
          label: "Live Safety Hub",
          href: "/live",
          icon: ShieldAlert,
          shortcut: "⌘7",
          statusColor: "bg-[#EF4444]",
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        {
          label: "Settings",
          href: "/settings",
          icon: Settings,
          shortcut: "⌘8",
          statusColor: "bg-[#8A94A6]",
        },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#0D1117] border-r border-[#1E2635] flex flex-col justify-between select-none transition-all duration-200 z-30 shrink-0 ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      {/* Top Nav Sections */}
      <div className="py-3 overflow-y-auto overflow-x-hidden flex-1 space-y-5">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-4 py-1 text-[10px] font-mono font-bold tracking-wider text-[#4F596A]">
                {section.title}
              </div>
            )}
            <div className="space-y-0.5 px-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-2.5 py-2 text-xs font-mono transition-all group relative border ${
                      isActive
                        ? "bg-[#131822] text-white border-[#007AFF]/60 font-bold"
                        : "text-[#8A94A6] hover:text-[#F0F3F8] hover:bg-[#131822]/60 border-transparent"
                    } ${collapsed ? "justify-center" : "justify-between"}`}
                    title={collapsed ? `${item.label} (${item.shortcut})` : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-[#007AFF]" : "text-[#8A94A6] group-hover:text-white"
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate tracking-wide text-[12px]">{item.label}</span>
                      )}
                    </div>

                    {!collapsed && (
                      <span className="kbd-hint text-[9px] shrink-0 opacity-80 group-hover:opacity-100">
                        {item.shortcut}
                      </span>
                    )}

                    {/* Active Route Indicator Stripe */}
                    {isActive && (
                      <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#007AFF]"></span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer & Collapse Toggle */}
      <div className="p-2 border-t border-[#1E2635] bg-[#090C10] space-y-2">
        {!collapsed && (
          <div className="px-2 py-1 text-[10px] font-mono text-[#4F596A] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
              <span>CORE SYNCED</span>
            </span>
            <span className="mono-num text-[9px]">v1.0.4-PRO</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-1.5 text-xs font-mono text-[#8A94A6] hover:text-white hover:bg-[#131822] border border-transparent hover:border-[#1E2635] transition-all"
          title={collapsed ? "Expand Sidebar (Ctrl+[)" : "Collapse Sidebar (Ctrl+[)"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <div className="flex items-center justify-between w-full px-2 text-[11px]">
              <span className="text-[#4F596A]">COLLAPSE</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
