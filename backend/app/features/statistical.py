import pandas as pd
import numpy as np

def compute_statistical_features(df: pd.DataFrame, price_col: str = "close") -> pd.DataFrame:
    """
    Computes rolling z-scores, skewness, kurtosis, and autocorrelation.
    Z_t = (X_t - mu_t) / sigma_t
    """
    feats = pd.DataFrame(index=df.index)
    prices = df[price_col]
    ret_1d = prices.pct_change(1)

    # Z-score of price vs moving average (Mean-Reversion indicator)
    for window in [20, 60]:
        mean_p = prices.rolling(window).mean()
        std_p = prices.rolling(window).std()
        feats[f"zscore_price_{window}d"] = (prices - mean_p) / std_p.replace(0, np.nan)

    # Z-score of returns
    for window in [20, 60]:
        mean_r = ret_1d.rolling(window).mean()
        std_r = ret_1d.rolling(window).std()
        feats[f"zscore_ret_{window}d"] = (ret_1d - mean_r) / std_r.replace(0, np.nan)

    # Rolling Skewness and Kurtosis
    feats["skewness_60d"] = ret_1d.rolling(60).skew()
    feats["kurtosis_60d"] = ret_1d.rolling(60).kurt()

    # 1-lag rolling return autocorrelation (mean-reversion vs momentum persistence)
    def calc_autocorr(series):
        if len(series) < 5 or np.all(np.isnan(series)):
            return np.nan
        s1 = series[:-1]
        s2 = series[1:]
        std_s1 = np.std(s1)
        std_s2 = np.std(s2)
        if std_s1 == 0 or std_s2 == 0:
            return 0.0
        return np.corrcoef(s1, s2)[0, 1]

    feats["autocorr_20d"] = ret_1d.rolling(20).apply(calc_autocorr, raw=True)

    return feats
