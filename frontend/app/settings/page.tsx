"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Shield, 
  DollarSign, 
  Database, 
  Server, 
  Sliders, 
  Cpu, 
  Layers, 
  Lock, 
  Check, 
  RotateCcw, 
  Save, 
  HardDrive, 
  Wifi, 
  AlertCircle,
  Activity,
  Zap,
  Eye,
  EyeOff
} from "lucide-react";
import { api } from "../../lib/api";

type SettingsTab = "GENERAL" | "MARKET_DATA" | "EXECUTION" | "RISK_LIMITS" | "MODELS" | "APIS";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("RISK_LIMITS");
  const [isSaved, setIsSaved] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  // Configuration state
  const [config, setConfig] = useState({
    // General
    deskName: "ALPHA-QUANT-DESK-01",
    baseCurrency: "INR",
    timezone: "Asia/Kolkata",
    refreshInterval: 4,
    soundAlerts: false,

    // Market Data
    primaryProvider: "NSE_DMA_YAHOO",
    tickResolution: "1m",
    fallbackFeeds: true,
    splitAdjustment: true,
    cacheTtlSeconds: 300,

    // Execution & Slippage
    slippageModel: "SQUARE_ROOT_IMPACT",
    fixedSlippageBps: 5.0,
    brokerCommissionBps: 3.0,
    exchangeTurnoverBps: 0.35,
    sttTaxBps: 10.0,
    autoCancelTimeoutSec: 60,

    // Pre-Trade Risk Limits
    maxPortfolioExposurePct: 100,
    maxPositionWeightPct: 15,
    maxDailyLossPct: 2.0,
    maxDrawdownPct: 15.0,
    maxOrderValue: 200000,
    maxOpenPositions: 10,
    orderThrottlePerSec: 5,

    // Model & Research
    defaultModel: "LIGHTGBM",
    walkForwardFolds: 16,
    lookbackHorizonDays: 252,
    minIcThreshold: 0.05,
    shapExplanationSampling: 200,

    // System & Broker APIs
    brokerType: "ZERODHA_KITE",
    apiKeyMasked: "kite_live_94a8fbc127d84a",
    apiSecretMasked: "sec_live_9823f98a27d19e",
    databaseEngine: "DUCKDB_LOCAL",
    logVerbosity: "VERBOSE"
  });

  useEffect(() => {
    // Load initial risk settings from API if available
    const load = async () => {
      try {
        const r = await api.getRiskStatus();
        if (r?.limits) {
          setConfig((prev) => ({
            ...prev,
            maxPortfolioExposurePct: r.limits.max_portfolio_exposure * 100,
            maxPositionWeightPct: r.limits.max_position_weight * 100,
            maxDailyLossPct: r.limits.max_daily_loss_pct * 100,
            maxDrawdownPct: r.limits.max_drawdown_pct * 100,
            maxOrderValue: r.limits.max_order_value || 200000,
            maxOpenPositions: r.limits.max_open_positions || 10
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all workstation parameters to institutional quant defaults?")) {
      setConfig({
        deskName: "ALPHA-QUANT-DESK-01",
        baseCurrency: "INR",
        timezone: "Asia/Kolkata",
        refreshInterval: 4,
        soundAlerts: false,
        primaryProvider: "NSE_DMA_YAHOO",
        tickResolution: "1m",
        fallbackFeeds: true,
        splitAdjustment: true,
        cacheTtlSeconds: 300,
        slippageModel: "SQUARE_ROOT_IMPACT",
        fixedSlippageBps: 5.0,
        brokerCommissionBps: 3.0,
        exchangeTurnoverBps: 0.35,
        sttTaxBps: 10.0,
        autoCancelTimeoutSec: 60,
        maxPortfolioExposurePct: 100,
        maxPositionWeightPct: 15,
        maxDailyLossPct: 2.0,
        maxDrawdownPct: 15.0,
        maxOrderValue: 200000,
        maxOpenPositions: 10,
        orderThrottlePerSec: 5,
        defaultModel: "LIGHTGBM",
        walkForwardFolds: 16,
        lookbackHorizonDays: 252,
        minIcThreshold: 0.05,
        shapExplanationSampling: 200,
        brokerType: "ZERODHA_KITE",
        apiKeyMasked: "kite_live_94a8fbc127d84a",
        apiSecretMasked: "sec_live_9823f98a27d19e",
        databaseEngine: "DUCKDB_LOCAL",
        logVerbosity: "VERBOSE"
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-4 font-mono select-none">
      {/* Workstation Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0B0D11] border border-[#1E2635] text-xs">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#007AFF]/10 border border-[#007AFF]/30 text-[#38BDF8]">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold tracking-wider">SYSTEM CONFIGURATION & PARAMETERS</span>
              <span className="text-[#3A4557]">|</span>
              <span className="text-[10px] text-[#8A94A6]">GOVERNANCE & ENGINE SPECIFICATION</span>
            </div>
            <p className="text-[10px] text-[#4F596A]">Pre-trade risk ceilings, cost models, execution slippage curves, and local broker adapters</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-[#22C55E]/15 border border-[#22C55E]/40 text-[#22C55E] text-[11px] font-bold">
              <Check className="w-3 h-3" />
              <span>PARAMETERS APPLIED</span>
            </div>
          )}
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#131822] hover:bg-[#1A2230] border border-[#2E3A4E] text-[11px] text-[#8A94A6] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET DEFAULTS</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white text-[11px] font-bold tracking-wider transition-colors shadow-md"
          >
            <Save className="w-3 h-3" />
            <span>SAVE CONFIGURATION</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Strip */}
      <div className="flex border-b border-[#1E2635] bg-[#0B0D11]/60 px-1 pt-1 gap-1 overflow-x-auto">
        {[
          { id: "RISK_LIMITS", label: "RISK LIMITS", icon: Shield },
          { id: "EXECUTION", label: "EXECUTION & COSTS", icon: DollarSign },
          { id: "MARKET_DATA", label: "MARKET DATA", icon: Wifi },
          { id: "MODELS", label: "MODELS & ALPHA", icon: Cpu },
          { id: "APIS", label: "BROKER & SYSTEM", icon: Server },
          { id: "GENERAL", label: "GENERAL", icon: Sliders }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wider transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-[#38BDF8] text-[#38BDF8] bg-[#131822]"
                  : "border-transparent text-[#4F596A] hover:text-[#8A94A6] hover:bg-[#0E1219]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-[#0D1117] border border-[#1E2635] p-5">
        {/* TAB 1: RISK LIMITS */}
        {activeTab === "RISK_LIMITS" && (
          <div className="space-y-5">
            <div className="border-b border-[#1E2635] pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#22C55E]" />
                  PRE-TRADE RISK LIMITS & CIRCUIT BREAKERS
                </h3>
                <p className="text-[10px] text-[#4F596A] mt-0.5">Enforced at milliseconds latency prior to DMA ticket dispatch</p>
              </div>
              <span className="text-[10px] bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] px-2 py-0.5 font-bold">
                POLICY: HARD REJECT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Max Exposure */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">MAX PORTFOLIO GROSS EXPOSURE</label>
                  <span className="text-[#38BDF8] font-bold">{config.maxPortfolioExposurePct}%</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Ceiling on aggregate equity investment relative to net capital</p>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={config.maxPortfolioExposurePct}
                  onChange={(e) => setConfig({ ...config, maxPortfolioExposurePct: Number(e.target.value) })}
                  className="w-full accent-[#007AFF]"
                />
              </div>

              {/* Max Position Weight */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">MAX SINGLE POSITION WEIGHT</label>
                  <span className="text-[#38BDF8] font-bold">{config.maxPositionWeightPct}%</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Hard cap on single asset allocation to prevent concentration risk</p>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={config.maxPositionWeightPct}
                  onChange={(e) => setConfig({ ...config, maxPositionWeightPct: Number(e.target.value) })}
                  className="w-full accent-[#007AFF]"
                />
              </div>

              {/* Max Daily Loss */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">MAX DAILY LOSS THRESHOLD</label>
                  <span className="text-[#EF4444] font-bold">-{config.maxDailyLossPct.toFixed(1)}%</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Intraday NAV stop-loss that trips the automated execution kill switch</p>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={config.maxDailyLossPct}
                  onChange={(e) => setConfig({ ...config, maxDailyLossPct: Number(e.target.value) })}
                  className="w-full accent-[#EF4444]"
                />
              </div>

              {/* Max Drawdown */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">MAX PEAK-TO-TROUGH DRAWDOWN</label>
                  <span className="text-[#EF4444] font-bold">-{config.maxDrawdownPct.toFixed(1)}%</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Absolute drawdown limit requiring emergency manager review to resume</p>
                <input
                  type="range"
                  min="5.0"
                  max="30.0"
                  step="0.5"
                  value={config.maxDrawdownPct}
                  onChange={(e) => setConfig({ ...config, maxDrawdownPct: Number(e.target.value) })}
                  className="w-full accent-[#EF4444]"
                />
              </div>

              {/* Max Order Value */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">MAX SINGLE ORDER NOTIONAL (₹)</label>
                  <span className="text-white font-bold mono-num">₹{config.maxOrderValue.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Fat-finger prevention ceiling for discretionary & algorithmic tickets</p>
                <input
                  type="number"
                  step="10000"
                  value={config.maxOrderValue}
                  onChange={(e) => setConfig({ ...config, maxOrderValue: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#131822] border border-[#1E2635] focus:border-[#38BDF8] text-white text-xs outline-none"
                />
              </div>

              {/* Order Throttle */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">ORDER RATE THROTTLE (BURST CAP)</label>
                  <span className="text-[#38BDF8] font-bold">{config.orderThrottlePerSec} req/sec</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Prevents accidental runaway API looping into exchange rate limit penalties</p>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={config.orderThrottlePerSec}
                  onChange={(e) => setConfig({ ...config, orderThrottlePerSec: Number(e.target.value) })}
                  className="w-full accent-[#007AFF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXECUTION & COSTS */}
        {activeTab === "EXECUTION" && (
          <div className="space-y-5">
            <div className="border-b border-[#1E2635] pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#F59E0B]" />
                  TRANSACTION COSTS, SLIPPAGE & TAX SCHEDULE
                </h3>
                <p className="text-[10px] text-[#4F596A] mt-0.5">Realistic institutional friction modeling for backtests and paper execution</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Slippage Model */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-2">
                <label className="text-white font-bold block">SLIPPAGE & MARKET IMPACT MODEL</label>
                <select
                  value={config.slippageModel}
                  onChange={(e) => setConfig({ ...config, slippageModel: e.target.value })}
                  className="w-full p-2 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                >
                  <option value="SQUARE_ROOT_IMPACT">Almgren-Chriss Square-Root Market Impact</option>
                  <option value="FIXED_BPS">Fixed Basis Points (Flat Friction)</option>
                  <option value="ZERO_SLIPPAGE">Zero Slippage (Idealized Frictionless)</option>
                </select>
                <p className="text-[10px] text-[#8A94A6]">
                  Square-root model scales slippage non-linearly with order size relative to 20-day Average Daily Volume (ADV).
                </p>
              </div>

              {/* Fixed Slippage bps */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">DEFAULT SLIPPAGE SPREAD</label>
                  <span className="text-[#38BDF8] font-bold">{config.fixedSlippageBps} bps (0.05%)</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Expected bid-ask half-spread crossing cost</p>
                <input
                  type="number"
                  step="0.5"
                  value={config.fixedSlippageBps}
                  onChange={(e) => setConfig({ ...config, fixedSlippageBps: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                />
              </div>

              {/* Broker Commission */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">BROKERAGE COMMISSION</label>
                  <span className="text-white font-bold">{config.brokerCommissionBps} bps</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Per-trade execution charge levied by broker (e.g. 0.03%)</p>
                <input
                  type="number"
                  step="0.5"
                  value={config.brokerCommissionBps}
                  onChange={(e) => setConfig({ ...config, brokerCommissionBps: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                />
              </div>

              {/* Securities Transaction Tax */}
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">SECURITIES TRANSACTION TAX (STT)</label>
                  <span className="text-white font-bold">{config.sttTaxBps} bps</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Statutory exchange levy on delivery turnover (10.0 bps / 0.10%)</p>
                <input
                  type="number"
                  step="1.0"
                  value={config.sttTaxBps}
                  onChange={(e) => setConfig({ ...config, sttTaxBps: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MARKET DATA */}
        {activeTab === "MARKET_DATA" && (
          <div className="space-y-5">
            <div className="border-b border-[#1E2635] pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#38BDF8]" />
                  FEED PROVIDERS & INGESTION TELEMETRY
                </h3>
                <p className="text-[10px] text-[#4F596A] mt-0.5">Tick stream aggregation, dividend adjustments, and cache policies</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-2">
                <label className="text-white font-bold block">PRIMARY MARKET DATA FEED</label>
                <select
                  value={config.primaryProvider}
                  onChange={(e) => setConfig({ ...config, primaryProvider: e.target.value })}
                  className="w-full p-2 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                >
                  <option value="NSE_DMA_YAHOO">Yahoo Finance Live + NSE Feed Hybrid</option>
                  <option value="ZERODHA_WEBSOCKET">Zerodha Kite Ticker (Direct Binary WS)</option>
                  <option value="POLYGON_IO">Polygon.io Institutional REST/WS</option>
                  <option value="ALPHA_VANTAGE">Alpha Vantage Premium Stream</option>
                </select>
                <p className="text-[10px] text-[#8A94A6]">
                  Hybrid feed delivers sub-50ms quotes for US Big Tech and Indian Nifty benchmarks.
                </p>
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-2">
                <label className="text-white font-bold block">BASE TICK RESOLUTION</label>
                <select
                  value={config.tickResolution}
                  onChange={(e) => setConfig({ ...config, tickResolution: e.target.value })}
                  className="w-full p-2 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                >
                  <option value="1m">1-Minute OHLCV Bars (Intraday Alpha)</option>
                  <option value="5m">5-Minute OHLCV Bars (Trend Following)</option>
                  <option value="1d">Daily EOD Closes (Multi-Day Rebalance)</option>
                </select>
                <p className="text-[10px] text-[#8A94A6]">Resolution for real-time feature computation and signal updates</p>
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">AUTOMATIC SPLIT & DIVIDEND CLEANING</span>
                  <span className="text-[10px] text-[#8A94A6]">Back-adjust historical prices to eliminate artificial price jumps</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.splitAdjustment}
                  onChange={(e) => setConfig({ ...config, splitAdjustment: e.target.checked })}
                  className="w-4 h-4 accent-[#007AFF]"
                />
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] flex items-center justify-between">
                <div>
                  <span className="text-white font-bold block">FALLBACK HIGH-AVAILABILITY FEED</span>
                  <span className="text-[10px] text-[#8A94A6]">Automatically failover to secondary provider if packet drop &gt; 2%</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.fallbackFeeds}
                  onChange={(e) => setConfig({ ...config, fallbackFeeds: e.target.checked })}
                  className="w-4 h-4 accent-[#007AFF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MODELS & ALPHA */}
        {activeTab === "MODELS" && (
          <div className="space-y-5">
            <div className="border-b border-[#1E2635] pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#A855F7]" />
                  QUANTITATIVE RESEARCH & ML ENGINE PARAMETERS
                </h3>
                <p className="text-[10px] text-[#4F596A] mt-0.5">Walk-forward cross-validation folds, feature windows, and TreeSHAP explainability</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-2">
                <label className="text-white font-bold block">DEFAULT ALPHA PREDICTOR</label>
                <select
                  value={config.defaultModel}
                  onChange={(e) => setConfig({ ...config, defaultModel: e.target.value })}
                  className="w-full p-2 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                >
                  <option value="LIGHTGBM">LightGBM Gradient Boosted Decision Trees</option>
                  <option value="RIDGE">L2 Regularized Ridge Regression</option>
                  <option value="RANDOM_FOREST">Random Forest Ensemble (500 Trees)</option>
                  <option value="HMM_REGIME">3-State Hidden Markov Regime Filter</option>
                </select>
                <p className="text-[10px] text-[#8A94A6]">Gradient boosting delivers optimal rank Information Coefficient (IC)</p>
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">WALK-FORWARD VALIDATION FOLDS</label>
                  <span className="text-[#38BDF8] font-bold">{config.walkForwardFolds} Folds</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Purged and embargoed temporal splits to eliminate lookahead bias</p>
                <input
                  type="range"
                  min="4"
                  max="24"
                  step="2"
                  value={config.walkForwardFolds}
                  onChange={(e) => setConfig({ ...config, walkForwardFolds: Number(e.target.value) })}
                  className="w-full accent-[#007AFF]"
                />
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">LOOKBACK TRAINING HORIZON</label>
                  <span className="text-white font-bold">{config.lookbackHorizonDays} Days (1 Year)</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Rolling feature observation window for model refits</p>
                <input
                  type="number"
                  step="30"
                  value={config.lookbackHorizonDays}
                  onChange={(e) => setConfig({ ...config, lookbackHorizonDays: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                />
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">MINIMUM INFORMATION COEFFICIENT (IC)</label>
                  <span className="text-[#22C55E] font-bold">{config.minIcThreshold.toFixed(3)}</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Validation threshold below which model is rejected from deployment</p>
                <input
                  type="number"
                  step="0.01"
                  value={config.minIcThreshold}
                  onChange={(e) => setConfig({ ...config, minIcThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BROKER & SYSTEM APIS */}
        {activeTab === "APIS" && (
          <div className="space-y-5">
            <div className="border-b border-[#1E2635] pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#38BDF8]" />
                  INSTITUTIONAL BROKER CONNECTORS & LOCAL ENCRYPTED VAULT
                </h3>
                <p className="text-[10px] text-[#4F596A] mt-0.5">Local machine secrets are never shared or transmitted externally</p>
              </div>
              <button
                onClick={() => setShowSecrets(!showSecrets)}
                className="flex items-center gap-1.5 text-[10px] text-[#8A94A6] hover:text-white px-2 py-1 bg-[#131822] border border-[#2E3A4E]"
              >
                {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showSecrets ? "MASK SECRETS" : "REVEAL SECRETS"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-2">
                <label className="text-white font-bold block">TARGET BROKER INTEGRATION</label>
                <select
                  value={config.brokerType}
                  onChange={(e) => setConfig({ ...config, brokerType: e.target.value })}
                  className="w-full p-2 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                >
                  <option value="ZERODHA_KITE">Zerodha Kite Connect (India Equities/F&O)</option>
                  <option value="INTERACTIVE_BROKERS">Interactive Brokers TWS / Gateway (Global)</option>
                  <option value="ALPACA">Alpaca Markets DMA (US Equities & Crypto)</option>
                  <option value="SIMULATED_PAPER">Local Memory Paper Broker Simulator</option>
                </select>
                <p className="text-[10px] text-[#8A94A6]">Direct Market Access connector for live order routing</p>
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-2">
                <label className="text-white font-bold block">DATABASE BACKEND ENGINE</label>
                <select
                  value={config.databaseEngine}
                  onChange={(e) => setConfig({ ...config, databaseEngine: e.target.value })}
                  className="w-full p-2 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                >
                  <option value="DUCKDB_LOCAL">DuckDB In-Process OLAP (Sub-millisecond analytical queries)</option>
                  <option value="SQLITE">SQLite3 Embedded (Relational state & orders)</option>
                  <option value="TIMESCALE">TimescaleDB / PostgreSQL (Enterprise Cluster)</option>
                </select>
                <p className="text-[10px] text-[#8A94A6]">Embedded high-performance analytical storage</p>
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <label className="text-white font-bold block">BROKER API KEY</label>
                <div className="relative">
                  <input
                    type={showSecrets ? "text" : "password"}
                    value={config.apiKeyMasked}
                    onChange={(e) => setConfig({ ...config, apiKeyMasked: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#4F596A] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-[#525C6C]">Loaded from local `.env` as `BROKER_API_KEY`</span>
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <label className="text-white font-bold block">BROKER API SECRET</label>
                <div className="relative">
                  <input
                    type={showSecrets ? "text" : "password"}
                    value={config.apiSecretMasked}
                    onChange={(e) => setConfig({ ...config, apiSecretMasked: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                  />
                  <Lock className="w-3.5 h-3.5 text-[#4F596A] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-[#525C6C]">Loaded from local `.env` as `BROKER_API_SECRET`</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: GENERAL DESK PREFERENCES */}
        {activeTab === "GENERAL" && (
          <div className="space-y-5">
            <div className="border-b border-[#1E2635] pb-2 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold text-white tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#38BDF8]" />
                  WORKSTATION ENVIRONMENT & LOCAL PREFERENCES
                </h3>
                <p className="text-[10px] text-[#4F596A] mt-0.5">Regional market clocks, telemetry refresh frequencies, and desk naming</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <label className="text-white font-bold block">DESK IDENTIFIER</label>
                <input
                  type="text"
                  value={config.deskName}
                  onChange={(e) => setConfig({ ...config, deskName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                />
                <span className="text-[10px] text-[#8A94A6]">Appears in order blotter audit trails</span>
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <label className="text-white font-bold block">BASE PORTFOLIO CURRENCY</label>
                <select
                  value={config.baseCurrency}
                  onChange={(e) => setConfig({ ...config, baseCurrency: e.target.value })}
                  className="w-full p-2 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ United States Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                </select>
                <span className="text-[10px] text-[#8A94A6]">Used for equity curves and P&L aggregations</span>
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <label className="text-white font-bold block">PRIMARY TIMEZONE</label>
                <select
                  value={config.timezone}
                  onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                  className="w-full p-2 bg-[#131822] border border-[#1E2635] text-white text-xs outline-none"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST: UTC+5:30)</option>
                  <option value="America/New_York">America/New_York (EST: UTC-5:00)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                </select>
                <span className="text-[10px] text-[#8A94A6]">Determines session market open/close badges</span>
              </div>

              <div className="p-3 bg-[#08090B] border border-[#1E2635] space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-white font-bold">TELEMETRY POLLING INTERVAL</label>
                  <span className="text-[#38BDF8] font-bold">{config.refreshInterval}s</span>
                </div>
                <p className="text-[10px] text-[#8A94A6]">Background heartbeat polling rate for order blotter and portfolio metrics</p>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={config.refreshInterval}
                  onChange={(e) => setConfig({ ...config, refreshInterval: Number(e.target.value) })}
                  className="w-full accent-[#007AFF]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
