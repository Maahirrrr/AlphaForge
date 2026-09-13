import pandas as pd
import numpy as np

def compute_microstructure_features(df: pd.DataFrame, price_col: str = "close", vol_col: str = "volume") -> pd.DataFrame:
    """
    Computes volume microstructure features:
    - Relative volume (RVOL)
    - Volume Z-score
    - Volume momentum
    - Price-Volume rolling correlation
    - Amihud Illiquidity proxy
    """
    feats = pd.DataFrame(index=df.index)
    if vol_col not in df.columns:
        return feats

    volume = df[vol_col].replace(0, np.nan)
    prices = df[price_col]
    ret_1d = prices.pct_change(1)

    # Relative Volume (RVOL)
    vol_sma_20 = volume.rolling(20).mean()
    feats["rvol_20d"] = volume / vol_sma_20

    # Volume Z-score
    vol_std_20 = volume.rolling(20).std()
    feats["zscore_vol_20d"] = (volume - vol_sma_20) / vol_std_20.replace(0, np.nan)

    # Volume momentum
    feats["vol_momentum_5d"] = volume.pct_change(5)
    feats["vol_momentum_20d"] = volume.pct_change(20)

    # Price-Volume Rolling Correlation (Institutional accumulation vs distribution)
    feats["corr_price_vol_20d"] = ret_1d.rolling(20).corr(volume.pct_change(1))

    # Amihud Illiquidity Proxy: |r_t| / Dollar Volume
    dollar_vol = (prices * volume).replace(0, np.nan)
    amihud = ret_1d.abs() / dollar_vol
    feats["amihud_illiquidity_20d"] = amihud.rolling(20).mean() * 1e6

    return feats
