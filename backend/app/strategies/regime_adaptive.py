from typing import Dict, Any
from datetime import datetime
import pandas as pd
from app.strategies.base import BaseStrategy
from app.strategies.momentum import MomentumStrategy
from app.strategies.mean_reversion import MeanReversionStrategy
from app.models.regime.hmm import MarketRegimeHMM

class RegimeAdaptiveStrategy(BaseStrategy):
    """
    Regime-Adaptive Dynamic Strategy:
    Uses a Hidden Markov Model (HMM) to detect market environment and switch behavior:
    - BULL TREND -> Momentum Strategy
    - SIDEWAYS -> Statistical Mean Reversion
    - HIGH VOLATILITY -> Reduce exposure (defensive risk posture / 50% cash)
    """

    def __init__(self, name: str = "Regime Adaptive", config: Dict[str, Any] = None):
        super().__init__(name, config or {})
        self.hmm = MarketRegimeHMM()
        self.momentum = MomentumStrategy()
        self.mean_reversion = MeanReversionStrategy()
        self.current_regime = "BULL_TREND"

    def generate_signals(
        self,
        current_time: datetime,
        historical_data: Dict[str, pd.DataFrame]
    ) -> Dict[str, Any]:
        # Fit or update HMM on index/first asset
        primary_sym = list(historical_data.keys())[0]
        df_primary = historical_data[primary_sym]

        if len(df_primary) >= 100:
            try:
                self.hmm.fit(df_primary)
                curr_info = self.hmm.get_current_regime(df_primary)
                self.current_regime = curr_info["current_regime"]
            except Exception:
                self.current_regime = "BULL_TREND"

        # Adaptive routing
        if self.current_regime == "BULL_TREND":
            base_signals = self.momentum.generate_signals(current_time, historical_data)
            weights = base_signals.get("target_weights", {})
        elif self.current_regime == "SIDEWAYS":
            base_signals = self.mean_reversion.generate_signals(current_time, historical_data)
            weights = base_signals.get("target_weights", {})
            if not weights:
                # Fallback to conservative momentum
                base_signals = self.momentum.generate_signals(current_time, historical_data)
                weights = {s: w * 0.7 for s, w in base_signals.get("target_weights", {}).items()}
        else: # HIGH_VOLATILITY: Cut exposure by 50%
            base_signals = self.momentum.generate_signals(current_time, historical_data)
            weights = {s: round(w * 0.4, 4) for s, w in base_signals.get("target_weights", {}).items()}

        return {
            "target_weights": weights,
            "regime": self.current_regime,
            "mode": f"Adaptive Mode: {self.current_regime}"
        }
