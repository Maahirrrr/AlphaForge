from typing import Dict, Any, List, Optional
import pandas as pd
import uuid
from datetime import datetime, timezone
from app.backtest.engine import EventDrivenBacktestEngine
from app.strategies.ml_cross_sectional import MLCrossSectionalStrategy
from app.strategies.momentum import MomentumStrategy
from app.strategies.mean_reversion import MeanReversionStrategy
from app.strategies.regime_adaptive import RegimeAdaptiveStrategy
from app.data.providers.csv import CSVDataProvider
from app.database.session import SessionLocal
from app.database.models import BacktestRun
from app.core.logging import logger

STRATEGY_REGISTRY = {
    "ML_CROSS_SECTIONAL": MLCrossSectionalStrategy,
    "MOMENTUM": MomentumStrategy,
    "MEAN_REVERSION": MeanReversionStrategy,
    "REGIME_ADAPTIVE": RegimeAdaptiveStrategy
}

class BacktestService:
    def __init__(self):
        self.provider = CSVDataProvider()

    def run_backtest(
        self,
        strategy_type: str = "ML_CROSS_SECTIONAL",
        universe: Optional[List[str]] = None,
        initial_capital: float = 1000000.0,
        slippage_bps: float = 5.0,
        commission_bps: float = 3.0,
        tax_bps: float = 10.0,
        rebalance_freq_days: int = 5,
        start_date: str = "2021-01-01",
        end_date: str = ""
    ) -> Dict[str, Any]:
        if not universe:
            universe = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN"]

        panel = {}
        for sym in universe:
            df = self.provider.get_historical_prices(sym, start_date, end_date)
            if not df.empty:
                panel[sym] = df

        if not panel or len(panel) < 1:
            raise ValueError(f"No market data found for universe {universe}")

        strat_cls = STRATEGY_REGISTRY.get(strategy_type.upper(), MLCrossSectionalStrategy)
        strategy = strat_cls()

        engine = EventDrivenBacktestEngine(
            strategy=strategy,
            universe=list(panel.keys()),
            price_panel=panel,
            initial_capital=initial_capital,
            slippage_bps=slippage_bps,
            commission_bps=commission_bps,
            tax_bps=tax_bps,
            rebalance_freq_days=rebalance_freq_days
        )
        result = engine.run()

        backtest_id = f"BT-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        result["backtest_id"] = backtest_id

        # Save to DB
        db = SessionLocal()
        try:
            bt_record = BacktestRun(
                backtest_id=backtest_id,
                strategy_name=strategy.name,
                universe=list(panel.keys()),
                start_date=result["start_date"],
                end_date=result["end_date"],
                initial_capital=initial_capital,
                final_equity=result["final_equity"],
                metrics=result["metrics"],
                equity_curve=result["equity_curve"][-100:], # Sample curve
                trades=result["trades"]
            )
            db.add(bt_record)
            db.commit()
        finally:
            db.close()

        return result

    def compare_strategies(self, universe: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Runs side-by-side backtest comparison across all strategies.
        """
        if not universe:
            universe = ["AAPL", "MSFT", "NVDA"]

        comparison = []
        for strat_key, strat_cls in STRATEGY_REGISTRY.items():
            try:
                res = self.run_backtest(strategy_type=strat_key, universe=universe, rebalance_freq_days=10)
                comparison.append({
                    "strategy_key": strat_key,
                    "strategy_name": res["strategy_name"],
                    "total_return_pct": res["metrics"].get("total_return_pct", 0.0),
                    "cagr_pct": res["metrics"].get("cagr_pct", 0.0),
                    "sharpe_ratio": res["metrics"].get("sharpe_ratio", 0.0),
                    "sortino_ratio": res["metrics"].get("sortino_ratio", 0.0),
                    "max_drawdown_pct": res["metrics"].get("max_drawdown_pct", 0.0),
                    "win_rate_pct": res["metrics"].get("win_rate_pct", 0.0),
                    "total_trades": res["metrics"].get("total_trades", 0)
                })
            except Exception as e:
                logger.error(f"Failed to run comparison for {strat_key}: {e}")

        return comparison
