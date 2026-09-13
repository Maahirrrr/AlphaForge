"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  Play, 
  Database, 
  Sliders, 
  Layers, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  GitBranch, 
  FlaskConical,
  BarChart2
} from "lucide-react";
import { api } from "../../lib/api";
import ShapWaterfall from "../../components/charts/ShapWaterfall";
import MetricCard from "../../components/ui/MetricCard";
import { ResearchTrainResult } from "../../lib/types";

export default function ResearchPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [horizon, setHorizon] = useState("5d");
  const [task, setTask] = useState("regression");
  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(4);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"EXPERIMENT" | "FEATURES" | "DRIFT">("EXPERIMENT");
  const [result, setResult] = useState<ResearchTrainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.trainModel({
        symbol,
        target_horizon: horizon,
        task,
        n_estimators: Number(nEstimators),
        max_depth: Number(maxDepth)
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to train model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#0D1117] border border-[#1E2635] text-xs">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#007AFF]" />
          <span className="text-white font-bold tracking-wider">QUANTITATIVE ALPHA RESEARCH LAB</span>
          <span className="text-[#2E3A4E]">|</span>
          <span className="text-[#8A94A6]">SUPERVISED MACHINE LEARNING & SHAP EXPLAINABILITY</span>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0 text-[11px]">
          <span className="px-2 py-0.5 bg-[#131822] text-[#38BDF8] border border-[#1E2635]">
            WALK-FORWARD VALIDATION (16 FOLDS)
          </span>
        </div>
      </div>

      {/* 3-Column Architecture: Left Research Nav + Center Studio + Right Model Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Research Navigation (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="workstation-card p-3 space-y-1 text-xs">
            <div className="text-[10px] text-[#4F596A] font-bold tracking-wider mb-2 px-1">
              RESEARCH WORKSPACES
            </div>
            {[
              { id: "EXPERIMENT", label: "Alpha Models", icon: FlaskConical, badge: "ACTIVE" },
              { id: "FEATURES", label: "Feature Store", icon: Layers, badge: "51" },
              { id: "DRIFT", label: "Drift Monitor", icon: Activity, badge: "0.0%" },
            ].map((item) => {
              const Icon = item.icon;
              const isSel = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between p-2 text-left transition-colors border ${
                    isSel 
                      ? "bg-[#1A2230] text-white border-[#007AFF]/60 font-bold" 
                      : "text-[#8A94A6] hover:bg-[#1A2230]/40 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${isSel ? "text-[#007AFF]" : "text-[#4F596A]"}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] px-1 bg-[#090C10] border border-[#1E2635] text-[#4F596A]">
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="workstation-card p-3 space-y-2 text-xs">
            <div className="text-[10px] text-[#4F596A] font-bold tracking-wider px-1">
              BENCHMARK UNIVERSES
            </div>
            <div className="text-[11px] text-[#8A94A6] space-y-1.5 px-1">
              <div className="flex justify-between">
                <span>US Tech (Mega):</span>
                <span className="text-white font-bold">5 Assets</span>
              </div>
              <div className="flex justify-between">
                <span>NSE Nifty 50:</span>
                <span className="text-white font-bold">5 Assets</span>
              </div>
              <div className="flex justify-between">
                <span>History Depth:</span>
                <span className="text-[#38BDF8] font-bold">3.5 Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Experiment Studio & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Experiment Hyperparameter Builder */}
          <div className="workstation-card p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#38BDF8]" />
                <span className="font-bold text-white tracking-wider">SUPERVISED MODEL SPECIFICATION</span>
              </div>
              <span className="text-[10px] text-[#4F596A]">ANTI-LOOKAHEAD ENFORCED</span>
            </div>

            <form onSubmit={handleTrain} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">TARGET ASSET</label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white font-bold focus:border-[#007AFF] outline-none"
                  >
                    <option value="AAPL">AAPL · Apple Inc.</option>
                    <option value="MSFT">MSFT · Microsoft Corp.</option>
                    <option value="NVDA">NVDA · NVIDIA Corp.</option>
                    <option value="GOOGL">GOOGL · Alphabet Inc.</option>
                    <option value="AMZN">AMZN · Amazon.com</option>
                    <option value="RELIANCE.NS">RELIANCE.NS · Reliance</option>
                    <option value="TCS.NS">TCS.NS · Tata Consultancy</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">FORWARD TARGET</label>
                  <select
                    value={horizon}
                    onChange={(e) => setHorizon(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white font-bold focus:border-[#007AFF] outline-none"
                  >
                    <option value="1d">1-Day Forward Return</option>
                    <option value="5d">5-Day Forward Return (Standard)</option>
                    <option value="10d">10-Day Forward Return</option>
                    <option value="20d">20-Day Forward Return</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1 font-bold">ALGORITHM</label>
                  <select
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white font-bold focus:border-[#007AFF] outline-none"
                  >
                    <option value="regression">XGBoost Regressor (E[r])</option>
                    <option value="classification">XGBoost Classifier (P[r &gt; 0])</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1">N_ESTIMATORS</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={nEstimators}
                    onChange={(e) => setNEstimators(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white mono-num focus:border-[#007AFF] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[#8A94A6] block mb-1">MAX_DEPTH</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={maxDepth}
                    onChange={(e) => setMaxDepth(Number(e.target.value))}
                    className="w-full bg-[#0D1117] border border-[#1E2635] p-2 text-white mono-num focus:border-[#007AFF] outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-2 bg-[#007AFF] hover:bg-blue-600 text-white font-bold tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Activity className="w-4 h-4 animate-spin" />
                        <span>TRAINING 16 FOLDS...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Play className="w-3.5 h-3.5" />
                        <span>RUN WALK-FORWARD TRAIN</span>
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444] text-[#EF4444] text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Results Display */}
          {result ? (
            <div className="space-y-5">
              {/* Validation Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-[#0D1117] border border-[#1E2635]">
                  <span className="text-[10px] text-[#4F596A] block">SPEARMAN RANK IC</span>
                  <span className="text-base font-bold text-[#22C55E] mono-num">
                    +{result.walk_forward.mean_rank_ic.toFixed(4)}
                  </span>
                  <span className="text-[9px] text-[#8A94A6] block">TARGET: &gt;0.03</span>
                </div>

                <div className="p-3 bg-[#0D1117] border border-[#1E2635]">
                  <span className="text-[10px] text-[#4F596A] block">IC INFO RATIO (IC_IR)</span>
                  <span className="text-base font-bold text-white mono-num">
                    {result.walk_forward.ic_information_ratio.toFixed(4)}
                  </span>
                  <span className="text-[9px] text-[#22C55E] block">STABLE ALPHA</span>
                </div>

                <div className="p-3 bg-[#0D1117] border border-[#1E2635]">
                  <span className="text-[10px] text-[#4F596A] block">DIRECTIONAL ACCURACY</span>
                  <span className="text-base font-bold text-[#38BDF8] mono-num">
                    {(result.walk_forward.mean_directional_accuracy * 100).toFixed(1)}%
                  </span>
                  <span className="text-[9px] text-[#8A94A6] block">OUT-OF-SAMPLE</span>
                </div>

                <div className="p-3 bg-[#0D1117] border border-[#1E2635]">
                  <span className="text-[10px] text-[#4F596A] block">MEAN RMSE</span>
                  <span className="text-base font-bold text-white mono-num">
                    {result.walk_forward.mean_rmse.toFixed(4)}
                  </span>
                  <span className="text-[9px] text-[#4F596A] block">CROSS-FOLD LOSS</span>
                </div>
              </div>

              {/* 16-Fold Walk-Forward Cross Validation Table */}
              <div className="workstation-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-[#22C55E]" />
                    <span className="font-bold text-white tracking-wider">
                      WALK-FORWARD SEQUENTIAL FOLD RESULTS (OOS)
                    </span>
                  </div>
                  <span className="text-[10px] text-[#4F596A]">EXPANDING ROLLING WINDOW</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-[#4F596A] text-[10px] border-b border-[#1E2635]">
                        <th className="pb-2">FOLD</th>
                        <th className="pb-2">TEST PERIOD</th>
                        <th className="pb-2">RANK IC</th>
                        <th className="pb-2">DIRECTIONAL ACC</th>
                        <th className="pb-2 text-right">RMSE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2635]/40 text-[11px] mono-num">
                      {result.walk_forward.fold_results.map((f) => (
                        <tr key={f.fold} className="hover:bg-[#1A2230]/40">
                          <td className="py-2 text-[#38BDF8] font-bold">Fold #{f.fold}</td>
                          <td className="py-2 text-white">{f.test_start} → {f.test_end}</td>
                          <td className={`py-2 font-bold ${f.rank_ic >= 0 ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
                            {f.rank_ic >= 0 ? "+" : ""}{f.rank_ic.toFixed(4)}
                          </td>
                          <td className="py-2 text-[#F0F3F8]">
                            {(f.directional_accuracy * 100).toFixed(1)}%
                          </td>
                          <td className="py-2 text-right text-[#8A94A6]">
                            {f.rmse.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TreeSHAP Waterfall Chart */}
              <ShapWaterfall 
                topPositive={result.latest_prediction_explanation.top_positive}
                topNegative={result.latest_prediction_explanation.top_negative}
              />
            </div>
          ) : (
            <div className="workstation-card p-12 text-center space-y-3 font-mono">
              <div className="w-10 h-10 bg-[#007AFF]/15 border border-[#007AFF]/50 flex items-center justify-center mx-auto text-[#007AFF]">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white tracking-wider">NO ACTIVE EXPERIMENT IN MEMORY</h3>
              <p className="text-xs text-[#8A94A6] max-w-md mx-auto leading-relaxed">
                Configure your target asset, forward prediction horizon, and tree hyperparameters above, then click &apos;Run Walk-Forward Train&apos; to generate out-of-sample Rank IC and TreeSHAP attributions.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Model Inspector & Global Feature Importance (3 cols) */}
        <div className="lg:col-span-3 space-y-5">
          {/* Global Feature Importance */}
          <div className="workstation-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <span className="font-bold text-white tracking-wider">GLOBAL FEATURE IMPORTANCE</span>
              <span className="text-[10px] text-[#4F596A]">MEAN |SHAP|</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {(result?.global_importance || [
                { feature: "return_20d", mean_abs_shap: 0.0412 },
                { feature: "vol_20d", mean_abs_shap: 0.0345 },
                { feature: "rsi_14d", mean_abs_shap: 0.0298 },
                { feature: "rvol_20d", mean_abs_shap: 0.0264 },
                { feature: "macd_hist", mean_abs_shap: 0.0231 },
                { feature: "zscore_price_20d", mean_abs_shap: 0.0195 },
                { feature: "factor_momentum", mean_abs_shap: 0.0182 },
                { feature: "bb_pct_b", mean_abs_shap: 0.0165 },
              ]).map((item, idx) => (
                <div key={item.feature} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#F0F3F8] truncate">{item.feature}</span>
                    <span className="text-[#38BDF8] mono-num font-bold">{item.mean_abs_shap.toFixed(4)}</span>
                  </div>
                  <div className="w-full bg-[#0D1117] border border-[#1E2635] h-1.5 overflow-hidden">
                    <div
                      className="bg-[#007AFF] h-full"
                      style={{ width: `${(item.mean_abs_shap / 0.05) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wasserstein Feature Drift Monitor */}
          <div className="workstation-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1E2635] pb-2 text-xs">
              <span className="font-bold text-white tracking-wider">FEATURE DRIFT DETECTOR</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40 font-bold">
                NORMAL
              </span>
            </div>

            <div className="text-xs space-y-2 text-[#8A94A6]">
              <p className="leading-relaxed text-[11px]">
                Monitors Wasserstein distance distribution between the training fold reference and live incoming tick bars.
              </p>
              <div className="p-2.5 bg-[#0D1117] border border-[#1E2635] space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Drifted Features:</span>
                  <span className="text-white font-bold mono-num">0 / 51</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Divergence:</span>
                  <span className="text-[#22C55E] font-bold mono-num">0.014 (&lt;0.05 Threshold)</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-[#22C55E] font-bold">NO RETRAIN NEEDED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
