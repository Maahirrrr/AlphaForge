import pandas as pd
import numpy as np

def compute_returns_features(df: pd.DataFrame, price_col: str = "close") -> pd.DataFrame:
    """
    Computes simple and log returns across key trading horizons:
    1d, 5d, 10d, 20d, 60d, 120d.
    All features strictly use past information: P_t / P_{t-k} - 1.
    """
    feats = pd.DataFrame(index=df.index)
    prices = df[price_col]

    # Simple returns
    feats["return_1d"] = prices.pct_change(1)
    feats["return_5d"] = prices.pct_change(5)
    feats["return_10d"] = prices.pct_change(10)
    feats["return_20d"] = prices.pct_change(20)
    feats["return_60d"] = prices.pct_change(60)
    feats["return_120d"] = prices.pct_change(120)

    # Log returns
    log_p = np.log(prices.replace(0, np.nan))
    feats["log_return_1d"] = log_p.diff(1)
    feats["log_return_5d"] = log_p.diff(5)
    feats["log_return_20d"] = log_p.diff(20)

    return feats
