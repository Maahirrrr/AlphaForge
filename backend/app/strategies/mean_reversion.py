from typing import Dict, Any
from datetime import datetime
import pandas as pd
from app.strategies.base import BaseStrategy
from app.quant.optimization import PortfolioOptimizer

class MeanReversionStrategy(BaseStrategy):
    """
    Statistical Mean Reversion Strategy:
    Identifies oversold assets based on 20-day price Z-score and Bollinger %B.
    Buys temporarily depressed assets expecting regression to the rolling mean.
    """

    def __init__(self, name: str = "Mean Reversion", config: Dict[str, Any] = None):
        super().__init__(name, config or {})
        self.window = self.config.get("window", 20)
        self.entry_zscore = self.config.get("entry_zscore", -1.5)

    def generate_signals(
        self,
        current_time: datetime,
        historical_data: Dict[str, pd.DataFrame]
    ) -> Dict[str, Any]:
        scores = {}
        for sym, df in historical_data.items():
            if len(df) >= self.window:
                close = df["close"]
                sma = close.rolling(self.window).mean().iloc[-1]
                std = close.rolling(self.window).std().iloc[-1]
                if std > 0:
                    z = (close.iloc[-1] - sma) / std
                    if z <= self.entry_zscore:
                        # More oversold = higher mean-reversion expected return
                        scores[sym] = -float(z)

        if not scores:
            return {"target_weights": {}}

        # Allocate inverse to z-score (more oversold gets higher weight)
        total_score = sum(scores.values())
        weights = {s: round(sc / total_score, 4) for s, sc in scores.items()}

        return {"target_weights": weights, "reversion_scores": scores}
