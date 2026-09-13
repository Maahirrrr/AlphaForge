export interface AccountTelemetry {
  broker: string;
  execution_mode: "PAPER" | "LIVE";
  currency: string;
  cash: number;
  positions_value: number;
  total_equity: number;
  unrealized_pnl: number;
  total_pnl: number;
  total_pnl_pct: number;
  positions_count: number;
}

export interface PositionRecord {
  symbol: string;
  quantity: number;
  avg_price: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
}

export interface OrderRecord {
  order_id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price?: number;
  status: "PENDING" | "SUBMITTED" | "FILLED" | "REJECTED" | "CANCELLED";
  execution_mode: "PAPER" | "LIVE";
  rejection_reason?: string;
  timestamp: string;
}

export interface KillSwitchStatus {
  kill_switch_active: boolean;
  status: "NORMAL" | "HALTED";
  activated_at?: string;
  reason?: string;
  activated_by?: string;
}

export interface RegimeTelemetry {
  current_regime: "BULL_TREND" | "HIGH_VOLATILITY" | "SIDEWAYS";
  description: string;
  probabilities: {
    BULL_TREND: number;
    HIGH_VOLATILITY: number;
    SIDEWAYS: number;
  };
  transition_matrix?: Record<string, Record<string, number>>;
  timestamp?: string;
}

export interface BacktestMetrics {
  initial_equity: number;
  final_equity: number;
  total_return_pct: number;
  cagr_pct: number;
  annualized_volatility_pct: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  calmar_ratio: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  profit_factor: number;
  total_trades: number;
  avg_win: number;
  avg_loss: number;
  total_costs_paid: number;
  alpha: number;
  beta: number;
  information_ratio: number;
  var_95_daily_pct: number;
  cvar_95_daily_pct: number;
}

export interface BacktestResult {
  backtest_id?: string;
  strategy_name: string;
  universe: string[];
  start_date: string;
  end_date: string;
  initial_capital: number;
  final_equity: number;
  metrics: BacktestMetrics;
  equity_curve: { date: string; equity: number; benchmark: number; cash: number }[];
  trades: {
    timestamp: string;
    symbol: string;
    side: "BUY" | "SELL";
    quantity: number;
    price: number;
    slippage: number;
    commission: number;
    fees: number;
    pnl: number;
  }[];
}

export interface ResearchTrainResult {
  model_id: string;
  symbol: string;
  target_horizon: string;
  features_count: number;
  samples_count: number;
  walk_forward: {
    folds_count: number;
    mean_rank_ic: number;
    ic_std: number;
    ic_information_ratio: number;
    mean_directional_accuracy: number;
    mean_rmse: number;
    fold_results: {
      fold: number;
      test_start: string;
      test_end: string;
      rank_ic: number;
      directional_accuracy: number;
      rmse: number;
    }[];
    prediction_series: { date: string; predicted: number; realized: number }[];
  };
  global_importance: { feature: string; mean_abs_shap: number }[];
  latest_prediction_explanation: {
    top_positive: { feature: string; value: number; shap_impact: number }[];
    top_negative: { feature: string; value: number; shap_impact: number }[];
  };
  drift_report: {
    drift_detected: boolean;
    status: string;
    drifted_features_count: number;
    top_drifted_features: { feature: string; distance: number; severity: string }[];
  };
}
