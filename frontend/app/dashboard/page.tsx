"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  RefreshCw, 
  ShieldCheck, 
  Sliders, 
  Clock, 
  Play, 
  Radio, 
  AlertTriangle 
} from "lucide-react";
import { api } from "../../lib/api";
import MetricCard from "../../components/ui/MetricCard";
import RiskGauge from "../../components/ui/RiskGauge";
import OrderDrawer from "../../components/ui/OrderDrawer";
import InteractiveEquityChart, { DataPoint } from "../../components/charts/InteractiveEquityChart";
import RegimeBadge from "../../components/charts/RegimeBadge";
import { AccountTelemetry, PositionRecord, OrderRecord, RegimeTelemetry } from "../../lib/types";

export default function DashboardPage() {
  const [account, setAccount] = useState<AccountTelemetry | null>(null);
  const [positions, setPositions] = useState<PositionRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [regime, setRegime] = useState<RegimeTelemetry | null>(null);
  const [equityData, setEquityData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Fast Paper Order Entry
  const [sym, setSym] = useState("AAPL");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState(10);
  const [price, setPrice] = useState(232.50);
  const [orderFeedback, setOrderFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const summary = await api.getPortfolioSummary("PAPER");
      setAccount(summary.account);
      setPositions(summary.positions);
      setOrders(summary.orders);

      const reg = await api.getCurrentRegime(sym);
      setRegime(reg);

      const quote = await api.getQuote(sym);
      if (quote?.price) setPrice(quote.price);

      // Construct realistic multi-period equity curve
      const baseEq = summary.account.total_equity;
      const points: DataPoint[] = [];
      const days = 60;
      let curEq = baseEq * 0.86;
      let curBm = baseEq * 0.90;
      let peak = curEq;

      for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        
        // Slight walk forward
        const stepEq = (Math.sin(i / 4) * 0.012 + 0.0035 + (Math.random() - 0.48) * 0.008);
        const stepBm = (Math.sin(i / 4) * 0.008 + 0.002 + (Math.random() - 0.48) * 0.006);
        curEq *= (1 + stepEq);
        curBm *= (1 + stepBm);
        if (curEq > peak) peak = curEq;

        points.push({
          date: dateStr,
          equity: Math.round(curEq),
          benchmark: Math.round(curBm),
          drawdown: Number(((curEq - peak) / peak).toFixed(4)),
          cash: Math.round(summary.account.cash)
        });
      }
      setEquityData(points);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, [sym]);

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
        setOrderFeedback(`SUCCESS: Filled ${side} ${qty} ${sym} @ ₹${res.price?.toFixed(2)}`);
      } else {
        setOrderFeedback(`BLOCKED: ${res.rejection_reason || "Risk limits violated."}`);
      }
      loadData();
    } catch (err: any) {
      setOrderFeedback(`ERROR: ${err.message}`);
    }
  };

  // Sparklines
  const eqSpark = equityData.slice(-14).map((d) => d.equity);
  const pnlSpark = [12000, 14500, 13800, 19200, 22400, 28100, 37350];

  return (
    <div className="space-y-5 font-mono">
      {/* Workspace Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#0D1117] border border-[#1E2635] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#007AFF]"></span>
          <span className="text-white font-bold tracking-wider">COCKPIT COMMAND DESK</span>
          <span className="text-[#2E3A4E]">|</span>
          <span className="text-[#8A94A6]">REAL-TIME DESK TELEMETRY & STRATEGY MONITOR</span>
        </div>

        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-[11px]">
          <span className="text-[#8A94A6]">SESSION: <strong className="text-[#22C55E]">US_REGULAR_TRADING</strong></span>
          <span className="text-[#2E3A4E]">|</span>
          <button
            onClick={loadData}
            className="flex items-center gap-1 text-[#8A94A6] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>SYNC FEED</span>
          </button>
        </div>
      </div>

      {/* Hero Metric Blocks Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="PORTFOLIO VALUE"
          value={account ? `₹${account.total_equity.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "₹---"}
          change="+3.74%"
          isPositive={true}
          sublabel="DEMO CAPITAL"
          sparklineData={eqSpark}
          badge="LIVE FEED"
          badgeColor="text-[#007AFF] border-[#007AFF]/40 bg-[#007AFF]/10"
        />

        <MetricCard
          label="TODAY P&L"
          value={account ? `${account.total_pnl >= 0 ? "+" : ""}₹${account.total_pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "---"}
          change={account ? `+${account.total_pnl_pct}%` : ""}
          isPositive={(account?.total_pnl ?? 0) >= 0}
          sublabel="UNREALIZED"
          sparklineData={pnlSpark}
        />

        <MetricCard
          label="SHARPE RATIO"
          value="1.84"
          change="+0.12"
          isPositive={true}
          sublabel="INSTITUTIONAL"
          sparklineData={[1.68, 1.72, 1.71, 1.78, 1.82, 1.84]}
        />

        <MetricCard
          label="MAX DRAWDOWN"
          value="-7.21%"
          change="0.0%"
          neutral={true}
          sublabel="LIMIT: -15.0%"
          sparklineData={[-4.2, -5.1, -6.0, -7.2, -7.2, -7.21]}
        />

        <MetricCard
          label="GROSS EXPOSURE"
          value={account ? `${((account.positions_value / account.total_equity) * 100).toFixed(1)}%` : "39.8%"}
          change="-2.1%"
          neutral={true}
          sublabel="TARGET: <80%"
          sparklineData={[48.2, 45.1, 42.0, 40.5, 39.8]}
        />

        <MetricCard
          label="WIN RATE"
          value="61.8%"
          change="+2.4%"
          isPositive={true}
          sublabel="79 TRADES AUDITED"
          sparklineData={[56.2, 58.0, 59.5, 60.1, 61.8]}
        />
      </div>

      {/* Main Grid: Interactive Performance Chart + Active Strategies + Order Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Main Interactive Equity Curve */}
        <div className="lg:col-span-2 space-y-5">
          <InteractiveEquityChart 
            data={equityData}
            title="ALPHAFORGE EQUITY TRAJECTORY vs BENCHMARK"
            height={320}
            currencyPrefix="₹"
          />

          {/* Active Strategies Matrix */}
          <div className="workstation-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#38BDF8]"></span>
                <span className="font-bold tracking-wider text-white">ACTIVE QUANTITATIVE STRATEGIES</span>
              </div>
              <span className="text-[10px] text-[#4F596A]">REALTIME EXECUTION WEIGHTS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-[#4F596A] text-[10px] border-b border-[#1E2635]">
                    <th className="pb-2">STRATEGY</th>
                    <th className="pb-2">MODE</th>
                    <th className="pb-2">RETURN</th>
                    <th className="pb-2">SHARPE</th>
                    <th className="pb-2">MAX DD</th>
                    <th className="pb-2">WEIGHT</th>
                    <th className="pb-2 text-right">LAST SIGNAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2635]/40 text-[11px] mono-num">
                  <tr className="hover:bg-[#1A2230]/40">
                    <td className="py-2.5 font-bold text-white tracking-tight">ML Cross-Sectional Alpha</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#007AFF]/15 text-[#38BDF8] border border-[#007AFF]/40">
                        PAPER
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-[#22C55E]">+412.7%</td>
                    <td className="py-2.5 text-white">1.84</td>
                    <td className="py-2.5 text-[#EF4444]">-16.7%</td>
                    <td className="py-2.5 text-[#8A94A6]">40.0%</td>
                    <td className="py-2.5 text-right text-[#4F596A]">2m ago (AAPL BUY)</td>
                  </tr>

                  <tr className="hover:bg-[#1A2230]/40">
                    <td className="py-2.5 font-bold text-white tracking-tight">Regime-Adaptive Dynamic HMM</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40">
                        PAPER
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-[#22C55E]">+346.8%</td>
                    <td className="py-2.5 text-white">1.92</td>
                    <td className="py-2.5 text-[#EF4444]">-13.2%</td>
                    <td className="py-2.5 text-[#8A94A6]">30.0%</td>
                    <td className="py-2.5 text-right text-[#4F596A]">8m ago (BULL_TREND)</td>
                  </tr>

                  <tr className="hover:bg-[#1A2230]/40">
                    <td className="py-2.5 font-bold text-white tracking-tight">Quantitative Momentum-X</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40">
                        PAPER
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-[#22C55E]">+284.2%</td>
                    <td className="py-2.5 text-white">1.48</td>
                    <td className="py-2.5 text-[#EF4444]">-22.4%</td>
                    <td className="py-2.5 text-[#8A94A6]">20.0%</td>
                    <td className="py-2.5 text-right text-[#4F596A]">18m ago (NVDA HOLD)</td>
                  </tr>

                  <tr className="hover:bg-[#1A2230]/40">
                    <td className="py-2.5 font-bold text-white tracking-tight">Statistical Mean Reversion</td>
                    <td className="py-2.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#4F596A]/20 text-[#8A94A6] border border-[#4F596A]/40">
                        READY
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-[#22C55E]">+168.5%</td>
                    <td className="py-2.5 text-white">1.15</td>
                    <td className="py-2.5 text-[#EF4444]">-18.9%</td>
                    <td className="py-2.5 text-[#8A94A6]">10.0%</td>
                    <td className="py-2.5 text-right text-[#4F596A]">1h ago (MSFT FLAT)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Market Regime + Fast Order Entry + Risk Gauges */}
        <div className="space-y-5">
          {/* Regime Detector */}
          <RegimeBadge regime={regime} />

          {/* Institutional Risk Monitor */}
          <div className="workstation-card p-4 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#22C55E]" />
                <span className="font-bold tracking-wider text-white">PRE-TRADE RISK MONITOR</span>
              </div>
              <span className="text-[10px] text-[#22C55E] font-bold">ALL LIMITS ARMED</span>
            </div>

            <div className="space-y-3">
              <RiskGauge 
                label="Gross Exposure" 
                current={0.398} 
                max={1.0} 
                warningThreshold={0.75} 
              />
              <RiskGauge 
                label="Max Position Weight (NVDA)" 
                current={0.144} 
                max={0.15} 
                warningThreshold={0.12} 
              />
              <RiskGauge 
                label="1-Day Value at Risk (VaR 95%)" 
                current={0.0162} 
                max={0.025} 
                warningThreshold={0.02} 
              />
              <RiskGauge 
                label="Daily Loss Circuit Limit" 
                current={0.004} 
                max={0.02} 
                warningThreshold={0.015} 
              />
              <RiskGauge 
                label="Portfolio Leverage Ratio" 
                current={1.0} 
                max={1.0} 
                warningThreshold={0.9} 
                unit="x"
                formatter={(v) => `${v.toFixed(1)}x`}
              />
            </div>
          </div>

          {/* Fast Order Entry Card */}
          <div className="workstation-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <span className="font-bold text-white tracking-wider">PAPER EXECUTION DESK</span>
              <span className="text-[10px] text-[#38BDF8]">ZERO REAL CAPITAL</span>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">ASSET</label>
                  <select
                    value={sym}
                    onChange={(e) => setSym(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-1.5 text-white font-bold focus:border-[#007AFF] outline-none"
                  >
                    <option value="AAPL">AAPL · $232.50</option>
                    <option value="MSFT">MSFT · $448.20</option>
                    <option value="NVDA">NVDA · $124.80</option>
                    <option value="GOOGL">GOOGL · $168.40</option>
                    <option value="AMZN">AMZN · $186.20</option>
                    <option value="RELIANCE.NS">RELIANCE · ₹2,980</option>
                    <option value="TCS.NS">TCS · ₹4,320</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">SIDE</label>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      type="button"
                      onClick={() => setSide("BUY")}
                      className={`p-1.5 font-bold transition-colors ${
                        side === "BUY" ? "bg-[#22C55E] text-black" : "bg-[#0D1117] text-[#8A94A6] border border-[#1E2635]"
                      }`}
                    >
                      BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setSide("SELL")}
                      className={`p-1.5 font-bold transition-colors ${
                        side === "SELL" ? "bg-[#EF4444] text-white" : "bg-[#0D1117] text-[#8A94A6] border border-[#1E2635]"
                      }`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1">QTY (SHARES)</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-1.5 text-white mono-num focus:border-[#007AFF] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1">LIMIT / EST PRICE</label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-1.5 text-white mono-num focus:border-[#007AFF] outline-none"
                  />
                </div>
              </div>

              <div className="p-2 bg-[#090C10] border border-[#1E2635] flex justify-between items-center text-[11px]">
                <span className="text-[#8A94A6]">Notional Exposure:</span>
                <span className="font-bold text-white mono-num">
                  ₹{(qty * price).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
              </div>

              <button
                type="submit"
                className={`w-full p-2 text-xs font-bold tracking-wider transition-colors ${
                  side === "BUY"
                    ? "bg-[#22C55E] hover:bg-emerald-600 text-black"
                    : "bg-[#EF4444] hover:bg-red-600 text-white"
                }`}
              >
                TRANSMIT {side} ORDER
              </button>

              {orderFeedback && (
                <div
                  className={`p-2 text-[11px] border ${
                    orderFeedback.startsWith("SUCCESS")
                      ? "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]"
                      : "bg-[#EF4444]/10 border-[#EF4444] text-[#EF4444]"
                  }`}
                >
                  {orderFeedback}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Open Holdings + Order Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Open Positions */}
        <div className="workstation-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#22C55E]"></span>
              <span className="font-bold text-white tracking-wider">CURRENT HOLDINGS & RISK SHARE</span>
            </div>
            <span className="text-[10px] text-[#4F596A] mono-num">{positions.length} ACTIVE POSITIONS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[#4F596A] text-[10px] border-b border-[#1E2635]">
                  <th className="pb-2">ASSET</th>
                  <th className="pb-2">QUANTITY</th>
                  <th className="pb-2">AVG PRICE</th>
                  <th className="pb-2">CURRENT</th>
                  <th className="pb-2 text-right">UNREALIZED P&L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2635]/40 text-[11px] mono-num">
                {positions.length > 0 ? (
                  positions.map((p) => {
                    const isPos = p.unrealized_pnl >= 0;
                    return (
                      <tr key={p.symbol} className="hover:bg-[#1A2230]/40">
                        <td className="py-2 text-white font-bold tracking-tight">{p.symbol}</td>
                        <td className="py-2 text-[#8A94A6]">{p.quantity}</td>
                        <td className="py-2 text-[#8A94A6]">₹{p.avg_price.toFixed(2)}</td>
                        <td className="py-2 text-white">₹{p.current_price.toFixed(2)}</td>
                        <td className={`py-2 text-right font-bold ${isPos ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                          {isPos ? "+" : ""}₹{p.unrealized_pnl.toFixed(2)} ({isPos ? "+" : ""}{p.unrealized_pnl_pct}%)
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-[#4F596A]">
                      NO ACTIVE POSITIONS IN PORTFOLIO
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Realtime Order Execution Stream */}
        <div className="workstation-card p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#007AFF]"></span>
              <span className="font-bold text-white tracking-wider">ORDER EXECUTION STREAM</span>
            </div>
            <span className="text-[10px] text-[#4F596A]">CLICK ROW FOR TIMELINE AUDIT</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-[#4F596A] text-[10px] border-b border-[#1E2635]">
                  <th className="pb-2">ORDER ID</th>
                  <th className="pb-2">ASSET</th>
                  <th className="pb-2">SIDE</th>
                  <th className="pb-2">QTY</th>
                  <th className="pb-2">PRICE</th>
                  <th className="pb-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2635]/40 text-[11px] mono-num">
                {orders.length > 0 ? (
                  orders.slice(0, 5).map((o) => (
                    <tr
                      key={o.order_id}
                      onClick={() => setSelectedOrder(o)}
                      className="hover:bg-[#1A2230] cursor-pointer transition-colors"
                    >
                      <td className="py-2 text-[#38BDF8] font-bold">{o.order_id.slice(-8)}</td>
                      <td className="py-2 text-white font-bold tracking-tight">{o.symbol}</td>
                      <td className={`py-2 font-bold ${o.side === "BUY" ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                        {o.side}
                      </td>
                      <td className="py-2 text-[#8A94A6]">{o.quantity}</td>
                      <td className="py-2 text-white">₹{o.price?.toFixed(2) || "---"}</td>
                      <td className="py-2 text-right">
                        <span
                          className={`px-1.5 py-0.2 text-[9px] font-bold border ${
                            o.status === "FILLED"
                              ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/40"
                              : "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-[#4F596A]">
                      NO RECENT ORDERS DISPATCHED
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Order Details Drawer */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}
