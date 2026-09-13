import pandas as pd
import numpy as np

def compute_momentum_features(df: pd.DataFrame, price_col: str = "close") -> pd.DataFrame:
    """
    Computes momentum features:
    - Rate of Change (ROC)
    - Moving Average Ratios: P_t / SMA_N - 1
    - Fast/Slow MA crossovers
    - Rolling linear trend slope
    """
    feats = pd.DataFrame(index=df.index)
    prices = df[price_col]

    # Moving average distances
    for window in [10, 20, 50, 200]:
        sma = prices.rolling(window=window).mean()
        feats[f"ma_ratio_{window}d"] = (prices / sma) - 1.0

    # Moving average convergence
    sma_20 = prices.rolling(20).mean()
    sma_50 = prices.rolling(50).mean()
    feats["ma_spread_20_50"] = (sma_20 / sma_50) - 1.0

    # Rate of change
    feats["roc_10d"] = (prices - prices.shift(10)) / prices.shift(10)
    feats["roc_20d"] = (prices - prices.shift(20)) / prices.shift(20)

    # Rolling linear trend slope over 20 days (normalized by price)
    def calc_slope(y):
        x = np.arange(len(y))
        if len(y) < 2 or np.all(np.isnan(y)):
            return np.nan
        cov = np.cov(x, y)[0, 1]
        var_x = np.var(x)
        return cov / var_x if var_x > 0 else 0.0

    slope_20 = prices.rolling(20).apply(calc_slope, raw=True)
    feats["trend_slope_20d"] = slope_20 / prices

    return feats
