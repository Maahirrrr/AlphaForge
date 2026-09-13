from typing import Dict, Any
from datetime import datetime
import pandas as pd
from app.strategies.base import BaseStrategy
from app.quant.optimization import PortfolioOptimizer

class MomentumStrategy(BaseStrategy):
    """
    Quantitative Momentum Strategy:
    Ranks universe by 20-day rate of change and trend strength.
    Allocates to top momentum deciles using inverse-volatility sizing.
    """

    def __init__(self, name: str = "Momentum Alpha", config: Dict[str, Any] = None):
        super().__init__(name, config or {})
        self.lookback = self.config.get("lookback", 20)
        self.top_k = self.config.get("top_k", 3)

    def generate_signals(
        self,
        current_time: datetime,
        historical_data: Dict[str, pd.DataFrame]
    ) -> Dict[str, Any]:
        scores = {}
        returns_dict = {}

        for sym, df in historical_data.items():
            if len(df) > self.lookback:
                close = df["close"]
                ret = (close.iloc[-1] / close.iloc[-self.lookback]) - 1.0
                sma_50 = close.rolling(min(len(df), 50)).mean().iloc[-1]
                trend_filter = close.iloc[-1] > sma_50 # Trend confirmation

                if trend_filter:
                    scores[sym] = float(ret)
                returns_dict[sym] = close.pct_change().dropna()

        sorted_assets = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        top_symbols = [s[0] for s in sorted_assets[:self.top_k] if s[1] > 0]

        if not top_symbols:
            return {"target_weights": {}}

        ret_df = pd.DataFrame({s: returns_dict[s] for s in top_symbols if s in returns_dict}).dropna()
        if not ret_df.empty:
            weights = PortfolioOptimizer.inverse_volatility(ret_df)
        else:
            weights = PortfolioOptimizer.equal_weight(top_symbols)

        return {"target_weights": weights, "momentum_scores": scores}
