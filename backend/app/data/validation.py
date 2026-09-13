from typing import Dict, Any
import pandas as pd
import numpy as np

def validate_market_data(df: pd.DataFrame, symbol: str = "UNKNOWN") -> Dict[str, Any]:
    """
    Validates data integrity and computes data health metrics.
    """
    report = {
        "symbol": symbol,
        "is_valid": True,
        "row_count": len(df),
        "start_date": str(df.index[0]) if not df.empty else None,
        "end_date": str(df.index[-1]) if not df.empty else None,
        "warnings": [],
        "errors": []
    }

    if df.empty:
        report["is_valid"] = False
        report["errors"].append("Dataset is empty.")
        return report

    if len(df) < 50:
        report["warnings"].append(f"Insufficient history ({len(df)} bars). Recommended >= 252 bars.")

    # Check for NaNs
    nan_counts = df.isna().sum().to_dict()
    if any(v > 0 for v in nan_counts.values()):
        report["warnings"].append(f"Missing values detected: {nan_counts}")

    # Check price spikes (> 40% intraday or interday return)
    returns = df["close"].pct_change().dropna()
    extreme_moves = returns[returns.abs() > 0.40]
    if not extreme_moves.empty:
        spikes = [f"{str(d)[:10]}: {r:.1%}" for d, r in list(extreme_moves.items())[:3]]
        report["warnings"].append(f"Detected {len(extreme_moves)} potential price spike(s) > 40%: {spikes}")

    # Check High >= Low sanity
    invalid_hl = int((df["high"] < df["low"]).sum())
    if invalid_hl > 0:
        report["is_valid"] = False
        report["errors"].append(f"Found {invalid_hl} rows where High < Low.")

    return report
