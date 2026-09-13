"use client";

import React, { useState } from "react";
import { Play, Activity, Cpu, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api } from "../../lib/api";
import ShapWaterfall from "../../components/charts/ShapWaterfall";
import { ResearchTrainResult } from "../../lib/types";

export default function ResearchPage() {
  const [symbol, setSymbol] = useState("AAPL");
  const [horizon, setHorizon] = useState("5d");
  const [task, setTask] = useState("regression");
  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(4);
  const [loading, setLoading] = useState(false);
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
      setError(err.message || "Failed to train quantitative model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-[#0E1115] border border-[#1D232C] text-xs font-mono">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#007AFF]" />
          <span className="text-white font-bold">QUANTITATIVE ALPHA RESEARCH TERMINAL</span>
          <span className="text-[#525C6C]">|</span>
          <span className="text-[#8A94A6]">SUPERVISED ML & SHAP EXPLAINABILITY</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="terminal-card p-5">
        <h3 className="text-xs font-mono font-bold tracking-wider text-white mb-4 border-b border-[#1D232C] pb-2">
          RESEARCH SPECIFICATIONS & MODEL HYPERPARAMETERS
        </h3>

        <form onSubmit={handleTrain} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-xs font-mono">
          <div>
            <label className="text-[#8A94A6] block mb-1">ASSET</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            >
              <option value="AAPL">AAPL (Apple)</option>
              <option value="MSFT">MSFT (Microsoft)</option>
              <option value="NVDA">NVDA (Nvidia)</option>
              <option value="GOOGL">GOOGL (Alphabet)</option>
              <option value="AMZN">AMZN (Amazon)</option>
              <option value="RELIANCE.NS">RELIANCE.NS</option>
              <option value="TCS.NS">TCS.NS</option>
              <option value="INFY.NS">INFY.NS</option>
            </select>
          </div>

          <div>
            <label className="text-[#8A94A6] block mb-1">PREDICTION HORIZON</label>
            <select
              value={horizon}
              onChange={(e) => setHorizon(e.target.value)}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            >
              <option value="1d">1 Day Forward (h=1)</option>
              <option value="5d">5 Days Forward (h=5)</option>
              <option value="10d">10 Days Forward (h=10)</option>
              <option value="20d">20 Days Forward (h=20)</option>
            </select>
          </div>

          <div>
            <label className="text-[#8A94A6] block mb-1">MODEL TASK</label>
            <select
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            >
              <option value="regression">Expected Return (Regression)</option>
              <option value="classification">P(r &gt; 0) (Classification)</option>
            </select>
          </div>

          <div>
            <label className="text-[#8A94A6] block mb-1">TREES (ESTIMATORS)</label>
            <input
              type="number"
              value={nEstimators}
              onChange={(e) => setNEstimators(Number(e.target.value))}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            />
          </div>

          <div>
            <label className="text-[#8A94A6] block mb-1">MAX TREE DEPTH</label>
            <input
              type="number"
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="w-full bg-[#13171D] border border-[#1D232C] p-2 text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full p-2.5 bg-[#007AFF] text-white font-bold tracking-wider hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {loading ? "TRAINING..." : "RUN RESEARCH"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-[#FF3B30]/10 border border-[#FF3B30] text-[#FF3B30] text-xs font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Results Container */}
      {result && (
        <div className="space-y-6">
          {/* Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">MEAN RANK IC</span>
              <div className="text-lg font-bold mono-num text-[#34C759] mt-1">
                {result.walk_forward.mean_rank_ic}
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">SPEARMAN CORR</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">IC INFO RATIO (IC_IR)</span>
              <div className="text-lg font-bold mono-num text-white mt-1">
                {result.walk_forward.ic_information_ratio}
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">MEAN(IC) / STD(IC)</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">DIRECTIONAL ACCURACY</span>
              <div className="text-lg font-bold mono-num text-[#007AFF] mt-1">
                {(result.walk_forward.mean_directional_accuracy * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">SIGN HIT RATE</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">WALK-FORWARD FOLDS</span>
              <div className="text-lg font-bold mono-num text-white mt-1">
                {result.walk_forward.folds_count}
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">OUT-OF-SAMPLE</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">FEATURE COUNT</span>
              <div className="text-lg font-bold mono-num text-white mt-1">
                {result.features_count}
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">ENGINEERED</span>
            </div>

            <div className="terminal-card p-3">
              <span className="text-[10px] font-mono text-[#8A94A6]">MODEL DRIFT</span>
              <div
                className={`text-lg font-bold mono-num mt-1 ${
                  result.drift_report.drift_detected ? "text-[#FF3B30]" : "text-[#34C759]"
                }`}
              >
                {result.drift_report.status}
              </div>
              <span className="text-[10px] font-mono text-[#525C6C]">WASSERSTEIN DIST</span>
            </div>
          </div>

          {/* Explainability & Global Importance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ShapWaterfall
              topPositive={result.latest_prediction_explanation.top_positive}
              topNegative={result.latest_prediction_explanation.top_negative}
            />

            {/* Global Importance */}
            <div className="terminal-card p-4">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1D232C]">
                <h4 className="text-xs font-mono font-bold tracking-wider text-white">
                  GLOBAL FEATURE IMPORTANCE (SHAP VALUE MAGNITUDE)
                </h4>
                <span className="text-[10px] font-mono text-[#525C6C]">TOP CONTRIBUTORS</span>
              </div>

              <div className="space-y-2">
                {result.global_importance.slice(0, 8).map((f, i) => (
                  <div key={i} className="text-xs font-mono">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#F0F2F5]">{f.feature}</span>
                      <span className="text-[#007AFF]">{f.mean_abs_shap.toFixed(4)}</span>
                    </div>
                    <div className="w-full bg-[#13171D] h-1.5">
                      <div
                        className="bg-[#007AFF] h-1.5"
                        style={{
                          width: `${Math.min(
                            100,
                            (f.mean_abs_shap / result.global_importance[0].mean_abs_shap) * 100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Walk Forward Fold Breakdown Table */}
          <div className="terminal-card p-4">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#1D232C]">
              <h4 className="text-xs font-mono font-bold tracking-wider text-white">
                WALK-FORWARD SEQUENTIAL CROSS-VALIDATION BREAKDOWN
              </h4>
              <span className="text-[10px] font-mono text-[#525C6C]">STRICT OUT-OF-SAMPLE TEST BARS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[#525C6C] border-b border-[#1D232C]">
                    <th className="pb-2">FOLD</th>
                    <th className="pb-2">OOS TEST PERIOD</th>
                    <th className="pb-2">RANK IC</th>
                    <th className="pb-2">DIRECTIONAL ACCURACY</th>
                    <th className="pb-2 text-right">RMSE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1D232C]/50">
                  {result.walk_forward.fold_results.map((f) => (
                    <tr key={f.fold} className="hover:bg-[#13171D]">
                      <td className="py-2 text-[#525C6C]">Fold #{f.fold}</td>
                      <td className="py-2 text-white">
                        {f.test_start} → {f.test_end}
                      </td>
                      <td
                        className={`py-2 font-bold ${
                          f.rank_ic >= 0 ? "text-[#34C759]" : "text-[#FF3B30]"
                        }`}
                      >
                        {f.rank_ic > 0 ? "+" : ""}
                        {f.rank_ic.toFixed(4)}
                      </td>
                      <td className="py-2 text-[#007AFF]">
                        {(f.directional_accuracy * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 text-right text-[#8A94A6]">{f.rmse.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
