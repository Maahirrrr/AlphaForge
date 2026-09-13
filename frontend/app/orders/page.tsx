"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ListOrdered, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Download, 
  Filter, 
  RefreshCw, 
  SlidersHorizontal,
  ExternalLink,
  ShieldAlert,
  ArrowDownUp,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import { api } from "../../lib/api";
import { OrderRecord } from "../../lib/types";
import OrderDrawer from "../../components/ui/OrderDrawer";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"PAPER" | "LIVE">("PAPER");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sideFilter, setSideFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"timestamp" | "price" | "quantity">("timestamp");
  const [sortAsc, setSortAsc] = useState(false);

  const loadOrders = async () => {
    try {
      setIsRefreshing(true);
      const ords = await api.getOrders(activeTab);
      setOrders(ords);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 4000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const filled = orders.filter((o) => o.status === "FILLED").length;
    const rejected = orders.filter((o) => o.status === "REJECTED").length;
    const pending = orders.filter((o) => o.status === "PENDING" || o.status === "SUBMITTED").length;
    const fillRate = total > 0 ? (filled / total) * 100 : 0;
    const notionalVolume = orders
      .filter((o) => o.status === "FILLED")
      .reduce((sum, o) => sum + (o.price || 0) * o.quantity, 0);

    return { total, filled, rejected, pending, fillRate, notionalVolume };
  }, [orders]);

  // Filtered & sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesSearch =
          o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.symbol.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
        const matchesSide = sideFilter === "ALL" || o.side === sideFilter;
        return matchesSearch && matchesStatus && matchesSide;
      })
      .sort((a, b) => {
        if (sortField === "timestamp") {
          const tA = new Date(a.timestamp).getTime();
          const tB = new Date(b.timestamp).getTime();
          return sortAsc ? tA - tB : tB - tA;
        }
        if (sortField === "price") {
          const pA = a.price || 0;
          const pB = b.price || 0;
          return sortAsc ? pA - pB : pB - pA;
        }
        if (sortField === "quantity") {
          return sortAsc ? a.quantity - b.quantity : b.quantity - a.quantity;
        }
        return 0;
      });
  }, [orders, searchQuery, statusFilter, sideFilter, sortField, sortAsc]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ["Order ID", "Timestamp", "Symbol", "Side", "Quantity", "Price", "Notional", "Status", "Execution Mode", "Rejection Reason"];
    const rows = filteredOrders.map((o) => [
      o.order_id,
      o.timestamp,
      o.symbol,
      o.side,
      o.quantity,
      o.price || "",
      (o.price || 0) * o.quantity,
      o.status,
      o.execution_mode,
      `"${o.rejection_reason || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `alphaforge_${activeTab.toLowerCase()}_blotter_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Workstation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B0D11] border border-[#1E2635] text-xs">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#007AFF]/10 border border-[#007AFF]/30 text-[#38BDF8]">
            <ListOrdered className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold tracking-wider">ORDER MANAGEMENT SYSTEM & BLOTTER</span>
              <span className="text-[#3A4557]">|</span>
              <span className="text-[10px] text-[#8A94A6]">AUDITABLE OMS TICKETING ENGINE</span>
            </div>
            <p className="text-[10px] text-[#4F596A]">Strict cryptographic isolation between simulated and live broker execution pathways</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadOrders}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#131822] hover:bg-[#1A2230] border border-[#2E3A4E] text-[11px] text-[#8A94A6] hover:text-white transition-colors"
            title="Refresh Blotter"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin text-[#38BDF8]" : ""}`} />
            <span>SYNC</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#131822] hover:bg-[#1A2230] border border-[#2E3A4E] text-[11px] text-[#38BDF8] hover:text-white transition-colors"
          >
            <Download className="w-3 h-3" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </div>

      {/* Mode Isolation Tabs */}
      <div className="flex border-b border-[#1E2635] bg-[#0B0D11]/60 px-1 pt-1 gap-1">
        <button
          onClick={() => setActiveTab("PAPER")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wider transition-all border-b-2 ${
            activeTab === "PAPER"
              ? "border-[#38BDF8] text-[#38BDF8] bg-[#131822]"
              : "border-transparent text-[#4F596A] hover:text-[#8A94A6] hover:bg-[#0E1219]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${activeTab === "PAPER" ? "bg-[#38BDF8] shadow-[0_0_8px_#38BDF8]" : "bg-[#2E3A4E]"}`}></span>
          <span>PAPER BLOTTER (SIMULATED)</span>
          <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-[#007AFF]/20 text-[#38BDF8] border border-[#007AFF]/30">SAFE</span>
        </button>

        <button
          onClick={() => setActiveTab("LIVE")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold tracking-wider transition-all border-b-2 ${
            activeTab === "LIVE"
              ? "border-[#EF4444] text-[#EF4444] bg-[#131822]"
              : "border-transparent text-[#4F596A] hover:text-[#EF4444] hover:bg-[#0E1219]"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${activeTab === "LIVE" ? "bg-[#EF4444] animate-ping" : "bg-[#2E3A4E]"}`}></span>
          <span>LIVE BROKER BLOTTER</span>
          <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">REAL CAPITAL</span>
        </button>
      </div>

      {/* Warning if on Live Tab */}
      {activeTab === "LIVE" && (
        <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/60 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[#EF4444]">
            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
            <div>
              <span className="font-bold tracking-wider">LIVE EXECUTION AUDIT VIEW ACTIVE:</span>
              <span className="text-[#8A94A6] ml-2">All orders recorded in this ledger are transmitted directly to connected institutional brokers with real capital liability.</span>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-[#EF4444]/20 border border-[#EF4444]/40 text-[#EF4444] text-[10px] font-bold">STRICT_AUTH_REQUIRED</span>
        </div>
      )}

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="p-2.5 bg-[#0D1117] border border-[#1E2635]">
          <span className="text-[10px] text-[#4F596A] block">TOTAL ORDERS</span>
          <div className="text-lg font-bold text-white mono-num mt-0.5">{stats.total}</div>
          <span className="text-[9px] text-[#3A4557]">Across all symbols</span>
        </div>

        <div className="p-2.5 bg-[#0D1117] border border-[#1E2635]">
          <span className="text-[10px] text-[#22C55E] block">FILLED ORDERS</span>
          <div className="text-lg font-bold text-[#22C55E] mono-num mt-0.5">{stats.filled}</div>
          <span className="text-[9px] text-[#3A4557]">Successful fills</span>
        </div>

        <div className="p-2.5 bg-[#0D1117] border border-[#1E2635]">
          <span className="text-[10px] text-[#EF4444] block">REJECTED ORDERS</span>
          <div className="text-lg font-bold text-[#EF4444] mono-num mt-0.5">{stats.rejected}</div>
          <span className="text-[9px] text-[#3A4557]">Risk gate violations</span>
        </div>

        <div className="p-2.5 bg-[#0D1117] border border-[#1E2635]">
          <span className="text-[10px] text-[#F59E0B] block">OPEN / PENDING</span>
          <div className="text-lg font-bold text-[#F59E0B] mono-num mt-0.5">{stats.pending}</div>
          <span className="text-[9px] text-[#3A4557]">In-flight tickets</span>
        </div>

        <div className="p-2.5 bg-[#0D1117] border border-[#1E2635]">
          <span className="text-[10px] text-[#38BDF8] block">FILL RATE</span>
          <div className="text-lg font-bold text-[#38BDF8] mono-num mt-0.5">{stats.fillRate.toFixed(1)}%</div>
          <span className="text-[9px] text-[#3A4557]">Execution efficiency</span>
        </div>

        <div className="p-2.5 bg-[#0D1117] border border-[#1E2635]">
          <span className="text-[10px] text-[#8A94A6] block">NOTIONAL FILLED</span>
          <div className="text-base font-bold text-white mono-num mt-0.5 truncate">
            ₹{stats.notionalVolume >= 100000 
              ? `${(stats.notionalVolume / 100000).toFixed(2)}L` 
              : stats.notionalVolume.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <span className="text-[9px] text-[#3A4557]">Gross value executed</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3 bg-[#0D1117] border border-[#1E2635] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#4F596A] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by Order ID or Symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#08090B] border border-[#1E2635] focus:border-[#38BDF8] text-white text-xs outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#08090B] p-1 border border-[#1E2635]">
            <span className="text-[10px] text-[#4F596A] px-1 font-semibold">STATUS:</span>
            {["ALL", "FILLED", "REJECTED", "PENDING"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                  statusFilter === st
                    ? "bg-[#1E2635] text-white"
                    : "text-[#4F596A] hover:text-[#8A94A6]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Side Filter */}
          <div className="flex items-center gap-1 bg-[#08090B] p-1 border border-[#1E2635]">
            <span className="text-[10px] text-[#4F596A] px-1 font-semibold">SIDE:</span>
            {["ALL", "BUY", "SELL"].map((s) => (
              <button
                key={s}
                onClick={() => setSideFilter(s)}
                className={`px-2 py-0.5 text-[10px] font-bold transition-colors ${
                  sideFilter === s
                    ? "bg-[#1E2635] text-white"
                    : "text-[#4F596A] hover:text-[#8A94A6]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting controls */}
        <div className="flex items-center gap-2 text-[11px] text-[#4F596A]">
          <span>SORT BY:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as any)}
            className="bg-[#08090B] border border-[#1E2635] text-white px-2 py-1 text-xs outline-none"
          >
            <option value="timestamp">TIMESTAMP</option>
            <option value="price">PRICE</option>
            <option value="quantity">QUANTITY</option>
          </select>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="px-2 py-1 bg-[#08090B] border border-[#1E2635] text-white hover:border-[#38BDF8] text-[10px]"
          >
            {sortAsc ? "ASC ↑" : "DESC ↓"}
          </button>
        </div>
      </div>

      {/* Main Order Blotter Table */}
      <div className="bg-[#0D1117] border border-[#1E2635] overflow-hidden">
        <div className="p-3 border-b border-[#1E2635] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
            <span className="font-bold text-white tracking-wider">
              {activeTab === "PAPER" ? "SIMULATED PAPER BLOTTER ENTRIES" : "CONFIRMED BROKER DISPATCH ENTRIES"}
            </span>
          </div>
          <span className="text-[10px] text-[#4F596A] mono-num">
            SHOWING {filteredOrders.length} OF {orders.length} RECORDS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#4F596A] border-b border-[#1E2635] bg-[#08090B]/50 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">ORDER ID</th>
                <th className="py-2.5 px-3">SYMBOL</th>
                <th className="py-2.5 px-3">SIDE</th>
                <th className="py-2.5 px-3">TYPE</th>
                <th className="py-2.5 px-3 text-right">QTY</th>
                <th className="py-2.5 px-3 text-right">PRICE (₹)</th>
                <th className="py-2.5 px-3 text-right">NOTIONAL (₹)</th>
                <th className="py-2.5 px-3 text-center">STATUS</th>
                <th className="py-2.5 px-3">GATEWAY / REASON</th>
                <th className="py-2.5 px-3 text-right">AUDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2635]/40 text-xs">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => {
                  const notional = (o.price || 0) * o.quantity;
                  const isFilled = o.status === "FILLED";
                  const isRejected = o.status === "REJECTED";
                  const isPending = o.status === "PENDING" || o.status === "SUBMITTED";

                  return (
                    <tr
                      key={o.order_id}
                      onClick={() => setSelectedOrder(o)}
                      className="hover:bg-[#131822] cursor-pointer transition-colors group"
                    >
                      <td className="py-2.5 px-3 text-[#525C6C] whitespace-nowrap text-[11px] mono-num">
                        {o.timestamp ? o.timestamp.slice(0, 19).replace("T", " ") : "---"}
                      </td>
                      <td className="py-2.5 px-3 text-white font-mono font-medium group-hover:text-[#38BDF8] transition-colors">
                        {o.order_id}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 bg-[#1A2230] border border-[#2E3A4E] text-white font-bold text-[11px]">
                          {o.symbol}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold ${
                            o.side === "BUY"
                              ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30"
                              : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30"
                          }`}
                        >
                          {o.side}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[#8A94A6] text-[11px]">
                        MARKET
                      </td>
                      <td className="py-2.5 px-3 text-right text-white mono-num font-medium">
                        {o.quantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right text-white mono-num font-medium">
                        {o.price ? `₹${o.price.toFixed(2)}` : "---"}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#8A94A6] mono-num">
                        {notional > 0 ? `₹${notional.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "---"}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold border ${
                            isFilled
                              ? "bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]"
                              : isRejected
                              ? "bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]"
                              : "bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]"
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-full ${isFilled ? "bg-[#22C55E]" : isRejected ? "bg-[#EF4444]" : "bg-[#F59E0B]"}`}></span>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-[#525C6C] truncate max-w-[200px]">
                        {o.rejection_reason ? (
                          <span className="text-[#EF4444] flex items-center gap-1">
                            <XCircle className="w-3 h-3 shrink-0" />
                            <span className="truncate">{o.rejection_reason}</span>
                          </span>
                        ) : (
                          <span className="text-[#4F596A] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 shrink-0 text-[#22C55E]" />
                            <span>{o.execution_mode === "PAPER" ? "VIRTUAL_FILL_ENGINE" : "BROKER_DMA_ROUTE"}</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(o);
                          }}
                          className="px-2 py-1 bg-[#131822] hover:bg-[#1E2635] text-[10px] text-[#38BDF8] border border-[#2E3A4E] transition-colors"
                        >
                          INSPECT
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-[#4F596A]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ListOrdered className="w-6 h-6 text-[#2E3A4E]" />
                      <div className="text-xs text-[#8A94A6]">NO ORDERS FOUND IN {activeTab} LEDGER</div>
                      <div className="text-[10px] text-[#4F596A]">
                        {searchQuery ? "Try clearing search or active filters" : "Dispatch a ticket from Dashboard or Strategy Studio to record an order"}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Order Drawer */}
      <OrderDrawer order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
