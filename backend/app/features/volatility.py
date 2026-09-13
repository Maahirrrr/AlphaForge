import pandas as pd
import numpy as np

def compute_volatility_features(df: pd.DataFrame, price_col: str = "close") -> pd.DataFrame:
    """
    Computes realized volatility, EWMA vol, ATR, and vol-of-vol.
    Annualization factor: sqrt(252).
    """
    feats = pd.DataFrame(index=df.index)
    prices = df[price_col]
    ret_1d = prices.pct_change(1)

    # Rolling realized volatility (annualized)
    for window in [10, 20, 60]:
        rolling_std = ret_1d.rolling(window=window).std()
        feats[f"vol_{window}d"] = rolling_std * np.sqrt(252)

    # Exponentially weighted volatility (EWMA) with lambda=0.94 (RiskMetrics standard)
    feats["vol_ewma_span20"] = ret_1d.ewm(span=20).std() * np.sqrt(252)
    feats["vol_ewma_span60"] = ret_1d.ewm(span=60).std() * np.sqrt(252)

    # Volatility of volatility
    feats["vol_of_vol_20d"] = feats["vol_20d"].rolling(20).std()

    # Average True Range (ATR)
    if "high" in df.columns and "low" in df.columns:
        high = df["high"]
        low = df["low"]
        close_prev = prices.shift(1)
        tr1 = high - low
        tr2 = (high - close_prev).abs()
        tr3 = (low - close_prev).abs()
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        
        atr_14 = tr.rolling(14).mean()
        feats["atr_14d"] = atr_14
        feats["atr_ratio_14d"] = atr_14 / prices  # normalized by price

    return feats
