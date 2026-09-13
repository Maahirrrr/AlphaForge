from typing import Dict
import numpy as np
import pandas as pd

class PositionSizer:
    """
    Position sizing methodologies:
    - Volatility Targeting
    - Fractional Kelly
    - Position Caps
    """

    @staticmethod
    def apply_volatility_target(
        weights: Dict[str, float],
        returns_df: pd.DataFrame,
        target_vol: float = 0.10, # 10% annualized target vol
        max_leverage: float = 1.0
    ) -> Dict[str, float]:
        """
        Scales portfolio weights so total expected annualized portfolio volatility matches target_vol.
        """
        symbols = [s for s in weights.keys() if s in returns_df.columns]
        if not symbols:
            return weights

        w_vec = np.array([weights[s] for s in symbols])
        clean_ret = returns_df[symbols].dropna()
        if len(clean_ret) < 10:
            return weights

        cov = clean_ret.cov().values * 252.0
        port_vol = np.sqrt(np.dot(w_vec, np.dot(cov, w_vec)))
        if port_vol <= 0:
            return weights

        scale_factor = target_vol / port_vol
        scale_factor = min(scale_factor, max_leverage)

        scaled_weights = {s: round(float(weights[s] * scale_factor), 4) for s in symbols}
        return scaled_weights

    @staticmethod
    def fractional_kelly(
        expected_return: float,
        volatility: float,
        fraction: float = 0.25, # Quarter Kelly for risk safety
        max_position: float = 0.20
    ) -> float:
        """
        Calculates Fractional Kelly position size: f* = fraction * (E[r] / sigma^2)
        Strictly enforces max_position bounds. Never allows unrestricted Kelly sizing.
        """
        if volatility <= 0:
            return 0.0
        full_kelly = expected_return / (volatility ** 2)
        sized = full_kelly * fraction
        return float(np.clip(sized, 0.0, max_position))
