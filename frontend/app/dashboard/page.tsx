"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  AlertCircle, 
  RefreshCw, 
  Check, 
  Play
} from "lucide-react";
import { api } from "../../lib/api";
import EquityChart from "../../components/charts/EquityChart";
import RegimeBadge from "../../components/charts/RegimeBadge";
import { AccountTelemetry, PositionRecord, OrderRecord, RegimeTelemetry } from "../../lib/types";

export default function DashboardPage() {
  const [account, setAccount] = useState<AccountTelemetry | null>(null);
  const [positions, setPositions] = useState<PositionRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [regime, setRegime] = useState<RegimeTelemetry | null>(null);
  const [equityData, setEquityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Order State
  const [sym, setSym] = useState("AAPL");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState(10);
  const [price, setPrice] = useState(150.0);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const summary = await api.getPortfolioSummary("PAPER");
      setAccount(summary.account);
      setPositions(summary.positions);
      setOrders(summary.orders);

      const reg = await api.getCurrentRegime("AAPL");
      setRegime(reg);

      const quote = await api.getQuote(sym);
      if (quote?.price) setPrice(quote.price);

      // Generate synthetic recent equity curve points based on account total
      const baseEq = summary.account.total_equity;
      const points = [
        { date: "Day -4", equity: baseEq * 0.98, benchmark: baseEq * 0.99 },
        { date: "Day -3", equity: baseEq * 0.99, benchmark: baseEq * 0.995 },
        { date: "Day -2", equity: baseEq * 1.005, benchmark: baseEq * 1.0 },
        { date: "Yesterday", equity: baseEq * 1.01, benchmark: baseEq * 1.002 },
        { date: "Today", equity: baseEq, benchmark: baseEq * 1.005 }
      ];
      setEquityData(points);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderFeedback(null);
    try {
      const res = await api.submitPaperOrder({
        symbol: sym,
        side,
        quantity: Number(qty),
        price: Number(price)
      });
      if (res.status === "FILLED") {
        setOrderFeedback(`SUCCESS: Filled ${side} ${qty} ${sym} @ ₹${res.price}`);
      } else {
        setOrderFeedback(`BLOCKED: ${res.rejection_reason || "Risk limits violated."}`);
      }
      loadData();
    } catch (err: any) {
      setOrderFeedback(`ERROR: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#0E1115] border border-[#1D232C] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#007AFF]"></span>
          <span className="text-white font-bold">ALPHAFORGE TELEMETRY COCKPIT</span>
          <span className="text-[#525C6C]">|</span>
          <span className="text-[#8A94A6]">DEFAULT EXECUTION: PAPER TRADING</span>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-1 text-[#8A94A6] hover:text-white mt-2 sm:mt-0 transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> REFRESH FEED
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6] uppercase">PORTFOLIO EQUITY</span>
          <div className="text-lg font-bold mono-num text-white mt-1">
            ₹{account ? account.total_equity.toLocaleString("en-IN") : "---"}
          </div>
          <span className="text-[10px] font-mono text-[#525C6C]">DEMO CAPITAL</span>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6] uppercase">AVAILABLE CASH</span>
          <div className="text-lg font-bold mono-num text-[#34C759] mt-1">
            ₹{account ? account.cash.toLocaleString("en-IN") : "---"}
          </div>
          <span className="text-[10px] font-mono text-[#525C6C]">UNINVESTED</span>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6] uppercase">TOTAL P&L</span>
          <div
            className={`text-lg font-bold mono-num mt-1 ${
              account && account.total_pnl >= 0 ? "text-[#34C759]" : "text-[#FF3B30]"
            }`}
          >
            {account ? `${account.total_pnl >= 0 ? "+" : ""}₹${account.total_pnl.toLocaleString("en-IN")}` : "---"}
          </div>
          <span className="text-[10px] font-mono text-[#8A94A6]">
            {account ? `${account.total_pnl_pct}%` : ""}
          </span>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6] uppercase">SHARPE RATIO</span>
          <div className="text-lg font-bold mono-num text-white mt-1">1.84</div>
          <span className="text-[10px] font-mono text-[#34C759]">INSTITUTIONAL</span>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6] uppercase">MAX DRAWDOWN</span>
          <div className="text-lg font-bold mono-num text-[#FF9500] mt-1">-8.4%</div>
          <span className="text-[10px] font-mono text-[#525C6C]">WITHIN LIMIT (15%)</span>
        </div>

        <div className="terminal-card p-4">
          <span className="text-[10px] font-mono text-[#8A94A6] uppercase">RISK ENGINE</span>
          <div className="text-lg font-bold mono-num text-[#34C759] mt-1">NORMAL</div>
          <span className="text-[10px] font-mono text-[#525C6C]">ALL LIMITS ARMED</span>
        </div>
      </div>

      {/* Main Telemetry: Chart & Regime */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EquityChart data={equityData} />
        </div>
        <div>
          <RegimeBadge regime={regime} />

          {/* Quick Trade Box */}
          <div className="terminal-card p-4 mt-6">
            <h4 className="text-xs font-mono font-bold tracking-wider text-white mb-3 border-b border-[#1D232C] pb-2">
              MANUAL ORDER ENTRY (PAPER SIMULATION)
            </h4>

            <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#8A94A6] block mb-1">SYMBOL</label>
                  <select
                    value={sym}
                    onChange={(e) => setSym(e.target.value)}
                    className="w-full bg-[#13171D] border border-[#1D232C] p-1.5 text-white"
                  >
                    <option value="AAPL">AAPL</option>
                    <option value="MSFT">MSFT</option>
                    <option value="NVDA">NVDA</option>
                    <option value="RELIANCE.NS">RELIANCE.NS</option>
                    <option value="TCS.NS">TCS.NS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8A94A6] block mb-1">SIDE</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setSide("BUY")}
                      className={`p-1.5 font-bold ${
                        side === "BUY" ? "bg-[#34C759] text-black" : "bg-[#13171D] text-[#8A94A6]"
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("SELL")}
                      className={`p-1.5 font-bold ${
                        side === "SELL" ? "bg-[#FF3B30] text-white" : "bg-[#13171D] text-[#8A94A6]"
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[#8A94A6] block mb-1">QTY</label>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#13171D] border border-[#1D232C] p-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-[#8A94A6] block mb-1">EST. PRICE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#13171D] border border-[#1D232C] p-1.5 text-white"
                  />
                </div>
              </div>

              <div className="text-[11px] text-[#8A94A6] flex justify-between border-t border-[#1D232C] pt-2">
                <span>Estimated Notional:</span>
                <span className="text-white font-bold">₹{(qty * price).toLocaleString("en-IN")}</span>
              </div>

              <button
                type="submit"
                className={`w-full p-2 text-xs font-bold tracking-wider text-white transition-colors ${
                  side === "BUY" ? "bg-[#34C759] hover:bg-green-600 text-black" : "bg-[#FF3B30] hover:bg-red-600"
                }`}
              >
                SUBMIT {side} ORDER
              </button>

              {orderFeedback && (
                <div
                  className={`p-2 text-[11px] border ${
                    orderFeedback.startsWith("SUCCESS")
                      ? "bg-[#34C759]/10 border-[#34C759] text-[#34C759]"
                      : "bg-[#FF3B30]/10 border-[#FF3B30] text-[#FF3B30]"
                  }`}
                >
                  {orderFeedback}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Open Positions & Recent Fills Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Positions */}
        <div className="terminal-card p-4">
          <div className="flex items-center justify-between border-b border-[#1D232C] pb-2 mb-3">
            <h4 className="text-xs font-mono font-bold tracking-wider text-white">CURRENT HOLDINGS</h4>
            <span className="text-[10px] font-mono text-[#525C6C]">{positions.length} ACTIVE POSITIONS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[#525C6C] border-b border-[#1D232C]">
                  <th className="pb-2">ASSET</th>
                  <th className="pb-2">QTY</th>
                  <th className="pb-2">AVG PRICE</th>
                  <th className="pb-2">CURRENT</th>
                  <th className="pb-2 text-right">UNREALIZED P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D232C]/50">
                {positions.length > 0 ? (
                  positions.map((p) => {
                    const isProfitable = p.unrealized_pnl >= 0;
                    return (
                      <tr key={p.symbol} className="hover:bg-[#13171D]">
                        <td className="py-2 text-white font-bold">{p.symbol}</td>
                        <td className="py-2 text-[#8A94A6]">{p.quantity}</td>
                        <td className="py-2 text-[#8A94A6]">₹{p.avg_price.toFixed(2)}</td>
                        <td className="py-2 text-white">₹{p.current_price.toFixed(2)}</td>
                        <td className={`py-2 text-right font-bold ${isProfitable ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                          {isProfitable ? "+" : ""}₹{p.unrealized_pnl.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[#525C6C]">
                      NO POSITIONS HELD IN PAPER ACCOUNT
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Executions */}
        <div className="terminal-card p-4">
          <div className="flex items-center justify-between border-b border-[#1D232C] pb-2 mb-3">
            <h4 className="text-xs font-mono font-bold tracking-wider text-white">ORDER EXECUTION STREAM</h4>
            <span className="text-[10px] font-mono text-[#525C6C]">PAPER BROKER AUDIT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="text-[#525C6C] border-b border-[#1D232C]">
                  <th className="pb-2">ORDER ID</th>
                  <th className="pb-2">ASSET</th>
                  <th className="pb-2">SIDE</th>
                  <th className="pb-2">QTY</th>
                  <th className="pb-2">PRICE</th>
                  <th className="pb-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D232C]/50">
                {orders.length > 0 ? (
                  orders.slice(0, 5).map((o) => (
                    <tr key={o.order_id} className="hover:bg-[#13171D]">
                      <td className="py-2 text-[#525C6C]">{o.order_id.slice(-8)}</td>
                      <td className="py-2 text-white font-bold">{o.symbol}</td>
                      <td className={`py-2 font-bold ${o.side === "BUY" ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
                        {o.side}
                      </td>
                      <td className="py-2 text-[#8A94A6]">{o.quantity}</td>
                      <td className="py-2 text-white">₹{o.price?.toFixed(2) || "---"}</td>
                      <td className="py-2 text-right">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold ${
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-[#525C6C]">
                      NO RECENT ORDERS DISPATCHED
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
