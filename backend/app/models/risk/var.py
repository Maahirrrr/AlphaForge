from typing import Dict, Any
import numpy as np
import pandas as pd
from scipy.stats import norm

class ValueAtRiskCalculator:
    """
    Computes portfolio Value at Risk (VaR) and Conditional VaR (CVaR / Expected Shortfall)
    across Historical, Parametric Gaussian, and Cornish-Fisher methodologies.
    """

    @staticmethod
    def calculate_metrics(returns: pd.Series, confidence_level: float = 0.95) -> Dict[str, float]:
        clean_ret = returns.dropna()
        if len(clean_ret) < 10:
            return {"var_historical": 0.0, "cvar_historical": 0.0, "var_parametric": 0.0}

        alpha = 1.0 - confidence_level

        # Historical VaR and CVaR
        var_hist = -float(np.percentile(clean_ret, alpha * 100.0))
        losses_beyond_var = clean_ret[clean_ret <= -var_hist]
        cvar_hist = -float(losses_beyond_var.mean()) if not losses_beyond_var.empty else var_hist

        # Parametric Gaussian VaR
        mu = float(clean_ret.mean())
        sigma = float(clean_ret.std())
        z_score = norm.ppf(confidence_level)
        var_param = -(mu - z_score * sigma)

        # Cornish-Fisher VaR (adjusts for skewness and kurtosis)
        skew = float(clean_ret.skew()) if len(clean_ret) > 20 else 0.0
        kurt = float(clean_ret.kurt()) if len(clean_ret) > 20 else 0.0
        
        # Cornish-Fisher expansion quantile
        z_cf = (
            z_score +
            (1.0 / 6.0) * (z_score**2 - 1.0) * skew +
            (1.0 / 24.0) * (z_score**3 - 3.0 * z_score) * kurt -
            (1.0 / 36.0) * (2.0 * z_score**3 - 5.0 * z_score) * (skew**2)
        )
        var_cf = -(mu - z_cf * sigma)

        return {
            "confidence_level": confidence_level,
            "var_historical_1d": round(max(0.0, var_hist), 4),
            "cvar_historical_1d": round(max(0.0, cvar_hist), 4),
            "var_parametric_1d": round(max(0.0, var_param), 4),
            "var_cornish_fisher_1d": round(max(0.0, var_cf), 4),
        }
