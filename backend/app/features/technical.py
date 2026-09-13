import pandas as pd
import numpy as np

def compute_technical_features(df: pd.DataFrame, price_col: str = "close") -> pd.DataFrame:
    """
    Computes classical technical indicators with strict anti-lookahead:
    - RSI (Relative Strength Index via Wilder smoothing)
    - MACD, MACD Signal, MACD Histogram
    - Bollinger Bands (%B and Bandwidth)
    - Stochastic Oscillator (%K, %D)
    """
    feats = pd.DataFrame(index=df.index)
    close = df[price_col]

    # RSI (14-period Wilder smoothing)
    delta = close.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1.0/14.0, min_periods=14, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0/14.0, min_periods=14, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, np.nan)
    feats["rsi_14d"] = 100.0 - (100.0 / (1.0 + rs))

    # MACD (12, 26, 9)
    ema_12 = close.ewm(span=12, adjust=False).mean()
    ema_26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema_12 - ema_26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    feats["macd"] = macd_line / close  # Normalized by price
    feats["macd_signal"] = signal_line / close
    feats["macd_hist"] = (macd_line - signal_line) / close

    # Bollinger Bands (20-period, 2-std)
    sma_20 = close.rolling(20).mean()
    std_20 = close.rolling(20).std()
    upper_band = sma_20 + (2.0 * std_20)
    lower_band = sma_20 - (2.0 * std_20)
    bandwidth = (upper_band - lower_band) / sma_20.replace(0, np.nan)
    pct_b = (close - lower_band) / (upper_band - lower_band).replace(0, np.nan)
    feats["bb_pct_b"] = pct_b
    feats["bb_bandwidth"] = bandwidth

    # Stochastic Oscillator (14-period %K, 3-period %D)
    if "high" in df.columns and "low" in df.columns:
        low_14 = df["low"].rolling(14).min()
        high_14 = df["high"].rolling(14).max()
        stoch_k = 100.0 * (close - low_14) / (high_14 - low_14).replace(0, np.nan)
        stoch_d = stoch_k.rolling(3).mean()
        feats["stoch_k_14d"] = stoch_k
        feats["stoch_d_3d"] = stoch_d

    return feats
