from typing import Dict, Optional
import pandas as pd
import numpy as np

DEFAULT_FACTOR_WEIGHTS = {
    "momentum": 0.30,
    "low_volatility": 0.25,
    "quality": 0.20,
    "liquidity": 0.15,
    "mean_reversion": 0.10
}

def compute_raw_factors(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes raw factor signals for a single asset:
    - Momentum: 20-day return (or 12m - 1m if available)
    - Low Volatility: -1 * 60d annualized volatility
    - Quality: Sharpe-like ratio (return_60d / vol_60d)
    - Liquidity: log(volume * price)
    - Mean Reversion: -1 * zscore_price_20d
    """
    factors = pd.DataFrame(index=df.index)
    close = df["close"]
    ret_1d = close.pct_change(1)

    # Momentum Factor
    factors["factor_momentum"] = close.pct_change(20)

    # Low Volatility Factor (higher score = lower risk)
    vol_60 = ret_1d.rolling(60).std() * np.sqrt(252)
    factors["factor_low_volatility"] = -1.0 * vol_60

    # Quality / Return Stability
    ret_60 = close.pct_change(60)
    factors["factor_quality"] = ret_60 / vol_60.replace(0, np.nan)

    # Liquidity
    if "volume" in df.columns:
        dollar_vol = (close * df["volume"]).replace(0, np.nan)
        factors["factor_liquidity"] = np.log(dollar_vol)

    # Short-term Mean Reversion
    sma_20 = close.rolling(20).mean()
    std_20 = close.rolling(20).std()
    z_price = (close - sma_20) / std_20.replace(0, np.nan)
    factors["factor_mean_reversion"] = -1.0 * z_price

    return factors

def cross_sectional_factor_score(
    panel_factors: Dict[str, pd.DataFrame],
    weights: Optional[Dict[str, float]] = None
) -> Dict[str, pd.DataFrame]:
    """
    Performs cross-sectional standardization across assets at each timestamp t:
    Z_{i, t} = (F_{i, t} - mean(F_t)) / std(F_t)
    Then calculates composite multi-factor alpha score.
    """
    if weights is None:
        weights = DEFAULT_FACTOR_WEIGHTS

    symbols = list(panel_factors.keys())
    if not symbols:
        return {}

    # Find common date index
    common_index = panel_factors[symbols[0]].index
    for s in symbols[1:]:
        common_index = common_index.intersection(panel_factors[s].index)
    common_index = common_index.sort_values()

    factor_names = [f"factor_{k}" for k in weights.keys() if f"factor_{k}" in panel_factors[symbols[0]].columns]
    results = {s: pd.DataFrame(index=common_index) for s in symbols}

    for factor in factor_names:
        # Construct cross-sectional matrix for this factor: rows = dates, cols = symbols
        cs_mat = pd.DataFrame(index=common_index)
        for s in symbols:
            cs_mat[s] = panel_factors[s].loc[common_index, factor]

        # Cross-sectional mean and std per row
        cs_mean = cs_mat.mean(axis=1)
        cs_std = cs_mat.std(axis=1).replace(0, np.nan)

        # Compute cross-sectional Z-score
        cs_z = cs_mat.sub(cs_mean, axis=0).div(cs_std, axis=0).clip(-3.0, 3.0)

        for s in symbols:
            results[s][f"{factor}_zscore"] = cs_z[s]

    # Compute weighted composite score
    for s in symbols:
        composite = pd.Series(0.0, index=common_index)
        total_w = 0.0
        for k, w in weights.items():
            col = f"factor_{k}_zscore"
            if col in results[s].columns:
                composite += results[s][col].fillna(0.0) * w
                total_w += w
        if total_w > 0:
            results[s]["factor_composite_score"] = composite / total_w

    return results
