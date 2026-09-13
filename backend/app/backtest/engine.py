from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from datetime import datetime
from app.backtest.events import MarketEvent, SignalEvent, OrderEvent, FillEvent
from app.backtest.broker_simulator import SimulatedBroker
from app.backtest.metrics import calculate_backtest_metrics
from app.risk.risk_engine import RiskEngine
from app.risk.limits import RiskLimits
from app.core.logging import logger

class EventDrivenBacktestEngine:
    """
    Event-driven backtesting engine.
    Strictly sequences events:
    MarketEvent -> Strategy Signal -> RiskEngine -> Order Sizing -> Simulated Fill -> Portfolio Mark-to-Market.
    Guarantees no look-ahead bias and simulates transaction costs and slippage accurately.
    """

    def __init__(
        self,
        strategy,
        universe: List[str],
        price_panel: Dict[str, pd.DataFrame],
        initial_capital: float = 1000000.0,
        slippage_bps: float = 5.0,
        commission_bps: float = 3.0,
        tax_bps: float = 10.0,
        rebalance_freq_days: int = 5,
        risk_limits: Optional[RiskLimits] = None
    ):
        self.strategy = strategy
        self.universe = universe
        self.price_panel = price_panel
        self.initial_capital = initial_capital
        self.rebalance_freq_days = rebalance_freq_days

        self.broker = SimulatedBroker(
            initial_capital=initial_capital,
            slippage_bps=slippage_bps,
            commission_bps=commission_bps,
            tax_bps=tax_bps
        )
        limits = risk_limits or RiskLimits(
            max_position_weight=0.35,
            max_order_value=initial_capital * 0.40,
            max_daily_loss_pct=0.05,
            max_drawdown_pct=0.25
        )
        self.risk_engine = RiskEngine(limits=limits)

    def run(self) -> Dict[str, Any]:
        logger.info(f"Starting event-driven backtest for {self.strategy.name} across {len(self.universe)} symbols.")
        
        common_dates = self.price_panel[self.universe[0]].index
        for s in self.universe[1:]:
            common_dates = common_dates.intersection(self.price_panel[s].index)
        common_dates = common_dates.sort_values()

        if len(common_dates) < 20:
            raise ValueError("Insufficient date overlap across universe for backtest.")

        daily_equity = []
        equity_records = []
        bm_base = None

        for bar_idx, current_date in enumerate(common_dates):
            current_bar_data = {}
            bm_price_sum = 0.0
            for sym in self.universe:
                row = self.price_panel[sym].loc[current_date]
                close_p = float(row["close"])
                self.broker.update_market_price(sym, close_p)
                current_bar_data[sym] = {
                    "open": float(row["open"]),
                    "high": float(row["high"]),
                    "low": float(row["low"]),
                    "close": close_p,
                    "volume": float(row.get("volume", 1e6))
                }
                bm_price_sum += close_p

            if bm_base is None:
                bm_base = bm_price_sum
            benchmark_val = self.initial_capital * (bm_price_sum / bm_base)

            if bar_idx >= 60 and (bar_idx % self.rebalance_freq_days == 0):
                historical_slice = {
                    sym: self.price_panel[sym].loc[:current_date]
                    for sym in self.universe
                }
                
                signals = self.strategy.generate_signals(current_date, historical_slice)
                target_weights = signals.get("target_weights", {})

                current_equity = self.broker.get_equity()
                for sym, target_w in target_weights.items():
                    target_notional = current_equity * target_w
                    current_price = current_bar_data[sym]["close"]
                    current_qty = self.broker.positions.get(sym, 0.0)
                    current_val = current_qty * current_price

                    diff_val = target_notional - current_val
                    if abs(diff_val) > (current_equity * 0.01):
                        side = "BUY" if diff_val > 0 else "SELL"
                        # Limit to max order value if necessary
                        clamped_notional = min(abs(diff_val), self.risk_engine.limits.max_order_value)
                        trade_qty = clamped_notional / current_price

                        allowed, status = self.risk_engine.validate_order(
                            symbol=sym,
                            side=side,
                            quantity=trade_qty,
                            price=current_price,
                            current_equity=current_equity,
                            current_positions={
                                s: {"quantity": q, "market_value": q * current_bar_data[s]["close"]}
                                for s, q in self.broker.positions.items()
                            }
                        )

                        if allowed:
                            order = OrderEvent(
                                timestamp=current_date,
                                order_id=f"BT-ORD-{bar_idx}-{sym}",
                                symbol=sym,
                                side=side,
                                quantity=trade_qty,
                                price=current_price
                            )
                            self.broker.execute_order(
                                order,
                                market_volume=current_bar_data[sym].get("volume")
                            )

            day_equity = self.broker.get_equity()
            daily_equity.append((current_date, day_equity))
            equity_records.append({
                "date": str(current_date)[:10],
                "equity": round(day_equity, 2),
                "benchmark": round(benchmark_val, 2),
                "cash": round(self.broker.cash, 2)
            })

        eq_series = pd.Series([e[1] for e in daily_equity], index=[e[0] for e in daily_equity])
        bm_series = pd.Series([e["benchmark"] for e in equity_records], index=eq_series.index)
        metrics = calculate_backtest_metrics(
            equity_series=eq_series,
            trades=self.broker.trade_history,
            benchmark_series=bm_series
        )

        return {
            "strategy_name": self.strategy.name,
            "universe": self.universe,
            "start_date": str(common_dates[0])[:10],
            "end_date": str(common_dates[-1])[:10],
            "initial_capital": self.initial_capital,
            "final_equity": round(eq_series.iloc[-1], 2),
            "metrics": metrics,
            "equity_curve": equity_records,
            "trades": self.broker.trade_history[-200:]
        }
