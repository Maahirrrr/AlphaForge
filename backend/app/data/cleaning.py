import pandas as pd
import numpy as np
from app.core.logging import logger

def clean_market_data(df: pd.DataFrame, symbol: str = "UNKNOWN") -> pd.DataFrame:
    """
    Cleans raw market data:
    1. Deduplicates timestamps
    2. Drops non-positive price rows
    3. Handles zero/negative volumes
    4. Computes split adjustment ratio if adjusted_close is provided
    5. Flags excessive missing date gaps
    """
    if df.empty:
        return df

    initial_len = len(df)
    # Deduplicate index
    df = df[~df.index.duplicated(keep="last")].sort_index()

    # Drop non-positive prices
    valid_mask = (df["open"] > 0) & (df["high"] > 0) & (df["low"] > 0) & (df["close"] > 0)
    df = df[valid_mask]

    # Clean volume
    if "volume" in df.columns:
        df["volume"] = df["volume"].apply(lambda v: max(0.0, float(v)) if pd.notnull(v) else 0.0)

    # Adjusted pricing
    if "adjusted_close" in df.columns and "close" in df.columns:
        adj_ratio = df["adjusted_close"] / df["close"]
        adj_ratio = adj_ratio.replace([np.inf, -np.inf], 1.0).fillna(1.0)
        # Apply adjustment factor to OHLC
        df["adj_open"] = df["open"] * adj_ratio
        df["adj_high"] = df["high"] * adj_ratio
        df["adj_low"] = df["low"] * adj_ratio
    else:
        df["adjusted_close"] = df["close"]
        df["adj_open"] = df["open"]
        df["adj_high"] = df["high"]
        df["adj_low"] = df["low"]

    # Check for long gaps (excluding standard weekends)
    if len(df) > 1:
        date_diffs = df.index.to_series().diff().dt.days
        abnormal_gaps = date_diffs[date_diffs > 5]
        if not abnormal_gaps.empty:
            logger.warning(
                f"[{symbol}] Detected {len(abnormal_gaps)} large market data gap(s) > 5 days. "
                f"Never forward-filling without explicit market holiday records."
            )

    logger.info(f"[{symbol}] Cleaned market data: {initial_len} -> {len(df)} rows.")
    return df
