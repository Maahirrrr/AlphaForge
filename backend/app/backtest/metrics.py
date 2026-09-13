from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

def calculate_backtest_metrics(
    equity_series: pd.Series,
    trades: List[Dict[str, Any]],
    benchmark_series: Optional[pd.Series] = None,
    risk_free_rate: float = 0.05 # 5% risk free rate
) -> Dict[str, Any]:
    """
    Computes professional quantitative performance and risk metrics.
    """
    if equity_series.empty or len(equity_series) < 2:
        return {}

    initial_equity = float(equity_series.iloc[0])
    final_equity = float(equity_series.iloc[-1])
    total_return = (final_equity - initial_equity) / initial_equity

    # Daily returns
    daily_returns = equity_series.pct_change().dropna()
    n_days = len(daily_returns)
    years = max(n_days / 252.0, 1.0 / 252.0)

    # CAGR
    cagr = (final_equity / initial_equity) ** (1.0 / years) - 1.0 if final_equity > 0 else -1.0

    # Annualized Volatility
    ann_vol = float(daily_returns.std() * np.sqrt(252))

    # Sharpe Ratio
    rf_daily = risk_free_rate / 252.0
    excess_returns = daily_returns - rf_daily
    sharpe = float(excess_returns.mean() / (daily_returns.std() or 1e-6) * np.sqrt(252))

    # Sortino Ratio (Downside deviation only)
    downside_returns = daily_returns[daily_returns < 0]
    downside_std = float(downside_returns.std() * np.sqrt(252)) or 1e-6
    sortino = float((cagr - risk_free_rate) / downside_std)

    # Drawdowns
    running_max = equity_series.cummax()
    drawdowns = (equity_series - running_max) / running_max
    max_drawdown = float(drawdowns.min()) # Negative number

    # Calmar Ratio
    calmar = float(cagr / abs(max_drawdown)) if max_drawdown < 0 else 0.0

    # Trade Statistics
    total_trades = len(trades)
    winning_trades = [t for t in trades if t.get("pnl", 0.0) > 0]
    losing_trades = [t for t in trades if t.get("pnl", 0.0) < 0]
    win_rate = len(winning_trades) / total_trades if total_trades > 0 else 0.0

    gross_profit = sum(t.get("pnl", 0.0) for t in winning_trades)
    gross_loss = abs(sum(t.get("pnl", 0.0) for t in losing_trades))
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else (gross_profit if gross_profit > 0 else 1.0)

    avg_win = float(np.mean([t["pnl"] for t in winning_trades])) if winning_trades else 0.0
    avg_loss = float(np.mean([t["pnl"] for t in losing_trades])) if losing_trades else 0.0

    total_costs = sum(t.get("commission", 0.0) + t.get("fees", 0.0) for t in trades)

    # Benchmark comparison
    alpha = 0.0
    beta = 1.0
    information_ratio = 0.0
    if benchmark_series is not None and not benchmark_series.empty:
        bm_aligned = benchmark_series.reindex(equity_series.index).ffill()
        bm_returns = bm_aligned.pct_change().dropna()
        common_idx = daily_returns.index.intersection(bm_returns.index)
        
        if len(common_idx) > 10:
            r_strat = daily_returns.loc[common_idx]
            r_bm = bm_returns.loc[common_idx]
            cov = np.cov(r_strat, r_bm)[0, 1]
            var_bm = np.var(r_bm)
            beta = float(cov / var_bm) if var_bm > 0 else 1.0
            
            cagr_bm = (bm_aligned.iloc[-1] / bm_aligned.iloc[0]) ** (1.0 / years) - 1.0
            alpha = float(cagr - (risk_free_rate + beta * (cagr_bm - risk_free_rate)))

            active_ret = r_strat - r_bm
            tracking_error = float(active_ret.std() * np.sqrt(252)) or 1e-6
            information_ratio = float(active_ret.mean() * np.sqrt(252) / tracking_error)

    # 95% 1-day VaR and CVaR
    var_95 = float(np.percentile(daily_returns, 5.0)) if len(daily_returns) > 20 else 0.0
    tail_losses = daily_returns[daily_returns <= var_95]
    cvar_95 = float(tail_losses.mean()) if not tail_losses.empty else var_95

    return {
        "initial_equity": round(initial_equity, 2),
        "final_equity": round(final_equity, 2),
        "total_return_pct": round(total_return * 100.0, 2),
        "cagr_pct": round(cagr * 100.0, 2),
        "annualized_volatility_pct": round(ann_vol * 100.0, 2),
        "sharpe_ratio": round(sharpe, 2),
        "sortino_ratio": round(sortino, 2),
        "calmar_ratio": round(calmar, 2),
        "max_drawdown_pct": round(max_drawdown * 100.0, 2),
        "win_rate_pct": round(win_rate * 100.0, 2),
        "profit_factor": round(profit_factor, 2),
        "total_trades": total_trades,
        "avg_win": round(avg_win, 2),
        "avg_loss": round(avg_loss, 2),
        "total_costs_paid": round(total_costs, 2),
        "alpha": round(alpha, 4),
        "beta": round(beta, 2),
        "information_ratio": round(information_ratio, 2),
        "var_95_daily_pct": round(abs(var_95) * 100.0, 2),
        "cvar_95_daily_pct": round(abs(cvar_95) * 100.0, 2)
    }
