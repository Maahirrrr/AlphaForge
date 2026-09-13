import {
  AccountTelemetry,
  PositionRecord,
  OrderRecord,
  KillSwitchStatus,
  RegimeTelemetry,
  BacktestResult,
  ResearchTrainResult
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// In-browser mock state for standalone GitHub Pages demo
let mockKillSwitch: KillSwitchStatus = {
  kill_switch_active: false,
  status: 'NORMAL'
};

let mockAccount: AccountTelemetry = {
  broker: 'PAPER_SIMULATOR',
  execution_mode: 'PAPER',
  currency: 'INR',
  cash: 624500.0,
  positions_value: 412850.0,
  total_equity: 1037350.0,
  unrealized_pnl: 37350.0,
  total_pnl: 37350.0,
  total_pnl_pct: 3.74,
  positions_count: 3
};

let mockPositions: PositionRecord[] = [
  { symbol: 'AAPL', quantity: 50, avg_price: 218.40, current_price: 232.50, market_value: 116250.0, unrealized_pnl: 7050.0, unrealized_pnl_pct: 6.46 },
  { symbol: 'NVDA', quantity: 120, avg_price: 112.10, current_price: 124.80, market_value: 149760.0, unrealized_pnl: 15240.0, unrealized_pnl_pct: 11.33 },
  { symbol: 'MSFT', quantity: 30, avg_price: 432.00, current_price: 448.20, market_value: 134460.0, unrealized_pnl: 4860.0, unrealized_pnl_pct: 3.75 }
];

let mockOrders: OrderRecord[] = [
  { order_id: 'PAPER-ORD-9A1F4C', symbol: 'NVDA', side: 'BUY', quantity: 120, price: 112.10, status: 'FILLED', execution_mode: 'PAPER', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { order_id: 'PAPER-ORD-4E8B2A', symbol: 'AAPL', side: 'BUY', quantity: 50, price: 218.40, status: 'FILLED', execution_mode: 'PAPER', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { order_id: 'PAPER-ORD-1C7D9E', symbol: 'MSFT', side: 'BUY', quantity: 30, price: 432.00, status: 'FILLED', execution_mode: 'PAPER', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() }
];

async function fetchWithFallback<T>(endpoint: string, options: RequestInit | undefined, fallbackData: () => T): Promise<T> {
  const url = API_BASE + endpoint;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      return fallbackData();
    }
    return await res.json();
  } catch (err) {
    // Backend unreachable (e.g. GitHub Pages static demo)
    return fallbackData();
  }
}

export const api = {
  getHealth: () =>
    fetchWithFallback('/api/health', undefined, () => ({
      status: 'HEALTHY',
      mode: 'PAPER',
      currency: 'INR',
      initial_capital: 1000000.0,
      database: 'CONNECTED',
      live_trading_enabled: false
    })),

  getBrokerStatus: () =>
    fetchWithFallback('/api/broker/status', undefined, () => ({
      execution_mode: 'PAPER',
      is_live_enabled: false,
      broker_type: 'PAPER_SIMULATOR',
      api_key_configured: false,
      api_key_masked: '<NOT CONFIGURED>',
      live_confirmed_flag: false,
      warning: 'PAPER TRADING IS ACTIVE. Live mode requires explicit dual confirmation and broker credentials.'
    })),

  getUniverse: () =>
    fetchWithFallback('/api/market/universe', undefined, () => ({
      categories: {
        US_TECH: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN'],
        INDIA_NIFTY: ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS']
      },
      available_symbols: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS']
    })),

  getQuote: (symbol: string) =>
    fetchWithFallback('/api/market/quote?symbol=' + encodeURIComponent(symbol), undefined, () => {
      const prices: Record<string, number> = {
        AAPL: 232.50, MSFT: 448.20, NVDA: 124.80, GOOGL: 168.40, AMZN: 186.20,
        'RELIANCE.NS': 2980.0, 'TCS.NS': 4320.0, 'INFY.NS': 1880.0, 'HDFCBANK.NS': 1640.0, 'ICICIBANK.NS': 1220.0
      };
      const p = prices[symbol] || 150.0;
      return {
        symbol,
        price: p,
        change: p * 0.012,
        change_pct: 1.2,
        volume: 45000000,
        timestamp: new Date().toISOString()
      };
    }),

  getHistory: (symbol: string, start_date = '2023-01-01') =>
    fetchWithFallback('/api/market/history?symbol=' + encodeURIComponent(symbol) + '&start_date=' + encodeURIComponent(start_date), undefined, () => ({
      symbol,
      bars_count: 100,
      bars: []
    })),

  getPortfolioSummary: (mode = 'PAPER') =>
    fetchWithFallback('/api/portfolio/summary?mode=' + encodeURIComponent(mode), undefined, () => ({
      account: mockAccount,
      positions: mockPositions,
      orders: mockOrders,
      kill_switch: mockKillSwitch
    })),

  getOrders: (mode = 'PAPER'): Promise<OrderRecord[]> =>
    fetchWithFallback('/api/orders?mode=' + encodeURIComponent(mode), undefined, () => {
      return mockOrders.filter(o => o.execution_mode === mode);
    }),

  getAttribution: (mode = 'PAPER') =>
    fetchWithFallback('/api/portfolio/attribution?mode=' + encodeURIComponent(mode), undefined, () => ({
      account: mockAccount,
      positions: mockPositions,
      sector_allocation: {
        Technology: 52.4,
        Semiconductors: 36.2,
        Communication: 11.4
      },
      factor_exposures: {
        Momentum: 0.85,
        'Low Volatility': -0.15,
        Quality: 1.10,
        Liquidity: 1.45,
        Value: -0.40
      },
      risk_contribution: [
        { symbol: 'AAPL', risk_share_pct: 28.2 },
        { symbol: 'NVDA', risk_share_pct: 42.6 },
        { symbol: 'MSFT', risk_share_pct: 29.2 }
      ]
    })),

  resetPortfolio: (capital = 1000000) =>
    fetchWithFallback('/api/portfolio/reset', { method: 'POST' }, () => {
      mockAccount = {
        broker: 'PAPER_SIMULATOR',
        execution_mode: 'PAPER',
        currency: 'INR',
        cash: capital,
        positions_value: 0.0,
        total_equity: capital,
        unrealized_pnl: 0.0,
        total_pnl: 0.0,
        total_pnl_pct: 0.0,
        positions_count: 0
      };
      mockPositions = [];
      mockOrders = [];
      return { status: 'RESET_SUCCESS', capital };
    }),

  submitPaperOrder: (order: { symbol: string; side: string; quantity: number; price: number }) =>
    fetchWithFallback('/api/orders/paper', { method: 'POST', body: JSON.stringify(order) }, () => {
      const orderId = 'PAPER-ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const notional = order.quantity * order.price;
      const costs = notional * 0.001335;

      if (mockKillSwitch.kill_switch_active) {
        const rejected: OrderRecord = {
          order_id: orderId,
          symbol: order.symbol,
          side: order.side.toUpperCase() as any,
          quantity: order.quantity,
          price: order.price,
          status: 'REJECTED',
          execution_mode: 'PAPER',
          rejection_reason: 'ORDER BLOCKED: Global Kill Switch is ACTIVE',
          timestamp: new Date().toISOString()
        };
        mockOrders.unshift(rejected);
        return rejected;
      }

      const filled: OrderRecord = {
        order_id: orderId,
        symbol: order.symbol,
        side: order.side.toUpperCase() as any,
        quantity: order.quantity,
        price: order.price,
        status: 'FILLED',
        execution_mode: 'PAPER',
        timestamp: new Date().toISOString()
      };

      if (order.side.toUpperCase() === 'BUY') {
        mockAccount.cash -= (notional + costs);
        const existing = mockPositions.find(p => p.symbol === order.symbol);
        if (existing) {
          const totalQ = existing.quantity + order.quantity;
          existing.avg_price = ((existing.quantity * existing.avg_price) + notional) / totalQ;
          existing.quantity = totalQ;
          existing.market_value = totalQ * order.price;
        } else {
          mockPositions.push({
            symbol: order.symbol,
            quantity: order.quantity,
            avg_price: order.price,
            current_price: order.price,
            market_value: notional,
            unrealized_pnl: 0,
            unrealized_pnl_pct: 0
          });
        }
      } else {
        mockAccount.cash += (notional - costs);
        mockPositions = mockPositions.filter(p => p.symbol !== order.symbol);
      }

      mockAccount.positions_value = mockPositions.reduce((acc, p) => acc + p.market_value, 0);
      mockAccount.total_equity = mockAccount.cash + mockAccount.positions_value;
      mockAccount.total_pnl = mockAccount.total_equity - 1000000.0;
      mockAccount.total_pnl_pct = Number(((mockAccount.total_pnl / 1000000.0) * 100).toFixed(2));
      mockOrders.unshift(filled);
      return filled;
    }),

  submitLiveOrder: (order: { symbol: string; side: string; quantity: number; price: number; confirmation_token: string }) =>
    fetchWithFallback('/api/orders/live', { method: 'POST', body: JSON.stringify(order) }, () => ({
      status: 'REJECTED',
      execution_mode: 'LIVE',
      rejection_reason: 'LIVE ORDER BLOCKED: System running in client demo mode. Live broker not linked.'
    })),

  getRiskStatus: () =>
    fetchWithFallback('/api/risk/status', undefined, () => ({
      kill_switch: mockKillSwitch,
      limits: {
        max_portfolio_exposure: 1.0,
        max_position_weight: 0.15,
        max_daily_loss_pct: 0.02,
        max_drawdown_pct: 0.15,
        max_leverage: 1.0,
        max_order_value: 200000.0,
        max_open_positions: 10
      }
    })),

  triggerKillSwitch: (reason = 'Manual Emergency Halt') =>
    fetchWithFallback('/api/risk/kill-switch', { method: 'POST', body: JSON.stringify({ reason }) }, () => {
      mockKillSwitch = {
        kill_switch_active: true,
        status: 'HALTED',
        activated_at: new Date().toISOString(),
        reason,
        activated_by: 'TERMINAL_OPERATOR'
      };
      return mockKillSwitch;
    }),

  resetKillSwitch: (token: string) =>
    fetchWithFallback('/api/risk/kill-switch/reset', { method: 'POST', body: JSON.stringify({ token }) }, () => {
      mockKillSwitch = {
        kill_switch_active: false,
        status: 'NORMAL'
      };
      return mockKillSwitch;
    }),

  trainModel: (params: { symbol: string; target_horizon: string; task: string; n_estimators: number; max_depth: number }) =>
    fetchWithFallback('/api/research/train', { method: 'POST', body: JSON.stringify(params) }, () => ({
      model_id: 'MODEL-' + Date.now().toString(36).toUpperCase() + '-XGB74',
      symbol: params.symbol,
      target_horizon: params.target_horizon,
      features_count: 51,
      samples_count: 1412,
      walk_forward: {
        folds_count: 16,
        mean_rank_ic: 0.0413,
        ic_std: 0.1466,
        ic_information_ratio: 0.2816,
        mean_directional_accuracy: 0.548,
        mean_rmse: 0.0382,
        fold_results: [
          { fold: 1, test_start: '2023-01-03', test_end: '2023-05-30', rank_ic: 0.0521, directional_accuracy: 0.562, rmse: 0.0341 },
          { fold: 2, test_start: '2023-06-01', test_end: '2023-10-31', rank_ic: 0.0485, directional_accuracy: 0.551, rmse: 0.0362 },
          { fold: 3, test_start: '2023-11-01', test_end: '2024-03-30', rank_ic: 0.0392, directional_accuracy: 0.539, rmse: 0.0412 },
          { fold: 4, test_start: '2024-04-01', test_end: '2024-08-31', rank_ic: 0.0441, directional_accuracy: 0.558, rmse: 0.0378 }
        ],
        prediction_series: []
      },
      global_importance: [
        { feature: 'return_20d', mean_abs_shap: 0.0412 },
        { feature: 'vol_20d', mean_abs_shap: 0.0345 },
        { feature: 'rsi_14d', mean_abs_shap: 0.0298 },
        { feature: 'rvol_20d', mean_abs_shap: 0.0264 },
        { feature: 'macd_hist', mean_abs_shap: 0.0231 },
        { feature: 'zscore_price_20d', mean_abs_shap: 0.0195 },
        { feature: 'factor_momentum', mean_abs_shap: 0.0182 },
        { feature: 'bb_pct_b', mean_abs_shap: 0.0165 }
      ],
      latest_prediction_explanation: {
        top_positive: [
          { feature: 'return_20d', value: 0.048, shap_impact: 0.0142 },
          { feature: 'rvol_20d', value: 1.34, shap_impact: 0.0095 },
          { feature: 'rsi_14d', value: 58.2, shap_impact: 0.0061 }
        ],
        top_negative: [
          { feature: 'vol_20d', value: 0.285, shap_impact: -0.0078 },
          { feature: 'zscore_price_20d', value: 1.62, shap_impact: -0.0042 }
        ]
      },
      drift_report: {
        drift_detected: false,
        status: 'NORMAL (NO DRIFT)',
        drifted_features_count: 0,
        top_drifted_features: []
      }
    })),

  getExplanation: (symbol = 'AAPL') =>
    fetchWithFallback('/api/research/explain?symbol=' + encodeURIComponent(symbol), undefined, () => ({
      top_positive: [
        { feature: 'return_20d', value: 0.048, shap_impact: 0.0142 },
        { feature: 'rvol_20d', value: 1.34, shap_impact: 0.0095 }
      ],
      top_negative: [
        { feature: 'vol_20d', value: 0.285, shap_impact: -0.0078 }
      ]
    })),

  runBacktest: (params: { strategy_type: string; universe: string[]; initial_capital: number; slippage_bps: number; rebalance_freq_days: number }) =>
    fetchWithFallback('/api/backtests/run', { method: 'POST', body: JSON.stringify(params) }, () => {
      const cap = params.initial_capital || 1000000;
      const points = [];
      let eq = cap;
      let bm = cap;
      const now = new Date();
      for (let i = 60; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 86400000 * 5);
        eq *= (1 + (Math.sin(i / 5) * 0.025 + 0.008));
        bm *= (1 + (Math.sin(i / 5) * 0.015 + 0.004));
        points.push({
          date: d.toISOString().slice(0, 10),
          equity: Math.round(eq),
          benchmark: Math.round(bm),
          cash: Math.round(cap * 0.3)
        });
      }

      return {
        strategy_name: params.strategy_type.replace(/_/g, ' '),
        universe: params.universe || ['AAPL', 'MSFT', 'NVDA'],
        start_date: points[0].date,
        end_date: points[points.length - 1].date,
        initial_capital: cap,
        final_equity: points[points.length - 1].equity,
        metrics: {
          initial_equity: cap,
          final_equity: points[points.length - 1].equity,
          total_return_pct: Number((((points[points.length - 1].equity - cap) / cap) * 100).toFixed(1)),
          cagr_pct: 38.6,
          annualized_volatility_pct: 18.2,
          sharpe_ratio: 1.84,
          sortino_ratio: 2.42,
          calmar_ratio: 2.31,
          max_drawdown_pct: -16.7,
          win_rate_pct: 58.2,
          profit_factor: 1.92,
          total_trades: 79,
          avg_win: 24500,
          avg_loss: 12800,
          total_costs_paid: 14850,
          alpha: 0.142,
          beta: 0.88,
          information_ratio: 1.45,
          var_95_daily_pct: 1.62,
          cvar_95_daily_pct: 2.41
        },
        equity_curve: points,
        trades: [
          { timestamp: '2026-08-20', symbol: 'NVDA', side: 'BUY' as const, quantity: 120, price: 114.20, slippage: 0.0571, commission: 41.1, fees: 137.0, pnl: 0 },
          { timestamp: '2026-08-10', symbol: 'AAPL', side: 'SELL' as const, quantity: 40, price: 234.80, slippage: 0.1174, commission: 28.1, fees: 93.9, pnl: 4820.0 },
          { timestamp: '2026-07-25', symbol: 'MSFT', side: 'BUY' as const, quantity: 35, price: 442.10, slippage: 0.2210, commission: 46.4, fees: 154.7, pnl: 0 },
          { timestamp: '2026-07-15', symbol: 'GOOGL', side: 'SELL' as const, quantity: 50, price: 172.40, slippage: 0.0862, commission: 25.8, fees: 86.2, pnl: 3120.0 }
        ]
      };
    }),

  compareStrategies: () =>
    fetchWithFallback('/api/backtests/compare', undefined, () => [
      { strategy_key: 'ML_CROSS_SECTIONAL', strategy_name: 'ML Cross-Sectional Alpha', total_return_pct: 412.7, cagr_pct: 38.6, sharpe_ratio: 1.84, sortino_ratio: 2.42, max_drawdown_pct: -16.7, win_rate_pct: 58.2, total_trades: 79 },
      { strategy_key: 'MOMENTUM', strategy_name: 'Quantitative Momentum', total_return_pct: 284.2, cagr_pct: 29.4, sharpe_ratio: 1.48, sortino_ratio: 1.95, max_drawdown_pct: -22.4, win_rate_pct: 52.8, total_trades: 112 },
      { strategy_key: 'REGIME_ADAPTIVE', strategy_name: 'Regime-Adaptive Dynamic Strategy', total_return_pct: 346.8, cagr_pct: 34.1, sharpe_ratio: 1.92, sortino_ratio: 2.65, max_drawdown_pct: -13.2, win_rate_pct: 61.4, total_trades: 94 },
      { strategy_key: 'MEAN_REVERSION', strategy_name: 'Statistical Mean Reversion', total_return_pct: 168.5, cagr_pct: 19.8, sharpe_ratio: 1.15, sortino_ratio: 1.38, max_drawdown_pct: -18.9, win_rate_pct: 54.1, total_trades: 164 }
    ]),

  getCurrentRegime: (symbol = 'AAPL'): Promise<RegimeTelemetry> =>
    fetchWithFallback('/api/regime/current?symbol=' + encodeURIComponent(symbol), undefined, () => ({
      current_regime: 'BULL_TREND' as const,
      description: 'Bull Trend (Low Vol)',
      probabilities: {
        BULL_TREND: 0.724,
        HIGH_VOLATILITY: 0.191,
        SIDEWAYS: 0.085
      },
      transition_matrix: {
        BULL_TREND: { BULL_TREND: 0.942, HIGH_VOLATILITY: 0.035, SIDEWAYS: 0.023 },
        HIGH_VOLATILITY: { BULL_TREND: 0.116, HIGH_VOLATILITY: 0.822, SIDEWAYS: 0.062 },
        SIDEWAYS: { BULL_TREND: 0.082, HIGH_VOLATILITY: 0.037, SIDEWAYS: 0.881 }
      },
      timestamp: new Date().toISOString()
    })),

  getStrategies: () =>
    fetchWithFallback('/api/strategies', undefined, () => [
      { key: 'ML_CROSS_SECTIONAL', name: 'ML Cross-Sectional Alpha', description: 'Supervised XGBoost return prediction with Mean-Variance quadratic optimization.', category: 'Machine Learning', rebalance: 'Weekly', status: 'READY' },
      { key: 'MOMENTUM', name: 'Quantitative Momentum', description: '20-day rate of change ranking with inverse-volatility risk budgeting.', category: 'Factor Quant', rebalance: 'Weekly', status: 'READY' },
      { key: 'MEAN_REVERSION', name: 'Statistical Mean Reversion', description: 'Rolling 20-day price Z-score & Bollinger oversold detection.', category: 'Statistical', rebalance: 'Daily', status: 'READY' },
      { key: 'REGIME_ADAPTIVE', name: 'Regime-Adaptive Dynamic Strategy', description: 'Hidden Markov Model regime detection: switches Momentum in Bull Trends to Mean Reversion in Sideways markets, and hedges during high volatility.', category: 'Adaptive HMM', rebalance: 'Weekly', status: 'READY' }
    ]),

  getModels: () =>
    fetchWithFallback('/api/models', undefined, () => [
      { model_id: 'MODEL-2026-XGB01', name: 'XGBoost Alpha (AAPL 5d)', model_type: 'xgboost', target: 'forward_return_5d', horizon: '5d', status: 'PAPER', metrics: { mean_rank_ic: 0.0413, ic_ir: 0.2816, directional_acc: 0.548 }, created_at: new Date().toISOString() }
    ])
};
