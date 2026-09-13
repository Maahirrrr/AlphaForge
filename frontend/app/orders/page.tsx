"use client";

import React, { useState, useEffect } from "react";
import { ListOrdered, CheckCircle2, XCircle, Clock } from "lucide-react";
import { api } from "../../lib/api";
import { OrderRecord } from "../../lib/types";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"PAPER" | "LIVE">("PAPER");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const ords = await api.getOrders(activeTab);
      setOrders(ords);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[#0E1115] border border-[#1D232C] text-xs font-mono">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-[#007AFF]" />
          <span className="text-white font-bold">ORDER MANAGEMENT SYSTEM & BLOTTER</span>
          <span className="text-[#525C6C]">|</span>
          <span className="text-[#8A94A6]">STRICT ISOLATION OF SIMULATED & REAL ORDER FLOW</span>
        </div>
      </div>

      {/* Mode Isolation Tabs */}
      <div className="flex border-b border-[#1D232C] gap-2">
        <button
          onClick={() => setActiveTab("PAPER")}
          className={`px-5 py-2.5 text-xs font-mono font-bold tracking-wider border-b-2 transition-colors ${
            activeTab === "PAPER"
              ? "border-[#007AFF] text-[#007AFF] bg-[#0E1115]"
              : "border-transparent text-[#525C6C] hover:text-white"
          }`}
        >
          [ PAPER ORDERS (DEFAULT) ]
        </button>

        <button
          onClick={() => setActiveTab("LIVE")}
          className={`px-5 py-2.5 text-xs font-mono font-bold tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "LIVE"
              ? "border-[#FF3B30] text-[#FF3B30] bg-[#0E1115]"
              : "border-transparent text-[#525C6C] hover:text-[#FF3B30]"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#FF3B30]"></span>
          [ LIVE ORDERS (REAL MONEY) ]
        </button>
      </div>

      {/* Warning if on Live Tab */}
      {activeTab === "LIVE" && (
        <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30] text-[#FF3B30] text-xs font-mono">
          WARNING: Viewing live order blotter. Live execution requires verified broker authorization.
        </div>
      )}

      {/* Order Blotter Table */}
      <div className="terminal-card p-4">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1D232C]">
          <h4 className="text-xs font-mono font-bold tracking-wider text-white">
            {activeTab === "PAPER" ? "SIMULATED PAPER BLOTTER" : "LIVE BROKER BLOTTER"}
          </h4>
          <span className="text-[10px] font-mono text-[#525C6C]">{orders.length} RECORDS LOADED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-[#525C6C] border-b border-[#1D232C]">
                <th className="pb-2">TIMESTAMP</th>
                <th className="pb-2">ORDER ID</th>
                <th className="pb-2">SYMBOL</th>
                <th className="pb-2">SIDE</th>
                <th className="pb-2">QTY</th>
                <th className="pb-2">PRICE</th>
                <th className="pb-2">STATUS</th>
                <th className="pb-2 text-right">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D232C]/50">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr key={o.order_id} className="hover:bg-[#13171D]">
                    <td className="py-2.5 text-[#525C6C]">{o.timestamp.slice(0, 19).replace("T", " ")}</td>
                    <td className="py-2.5 text-white font-mono">{o.order_id}</td>
                    <td className="py-2.5 text-white font-bold">{o.symbol}</td>
                    <td
                      className={`py-2.5 font-bold ${
                        o.side === "BUY" ? "text-[#34C759]" : "text-[#FF3B30]"
                      }`}
                    >
                      {o.side}
                    </td>
                    <td className="py-2.5 text-[#8A94A6]">{o.quantity}</td>
                    <td className="py-2.5 text-white">?{o.price?.toFixed(2) || "---"}</td>
                    <td className="py-2.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold ${
                          o.status === "FILLED"
                            ? "bg-[#34C759]/20 text-[#34C759]"
                            : o.status === "REJECTED"
                            ? "bg-[#FF3B30]/20 text-[#FF3B30]"
                            : "bg-[#13171D] text-[#8A94A6]"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-[11px] text-[#525C6C]">
                      {o.rejection_reason || `Executed via ${o.execution_mode}`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-[#525C6C]">
                    NO ORDERS RECORDED IN {activeTab} BLOTTER
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
