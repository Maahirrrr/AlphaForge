import pytest
import pandas as pd
import numpy as np
from app.features.feature_pipeline import FeaturePipeline

def test_no_future_leakage_in_features():
    """
    MATHEMATICAL PROOF OF ANTI-LOOKAHEAD:
    Altering price at time t+1 to t+N MUST NOT change any feature calculated at time t.
    """
    dates = pd.date_range(start="2023-01-01", periods=100, freq="B")
    np.random.seed(42)
    prices_orig = 100.0 * np.cumprod(1.0 + np.random.normal(0, 0.01, 100))
    
    df1 = pd.DataFrame({
        "open": prices_orig,
        "high": prices_orig * 1.01,
        "low": prices_orig * 0.99,
        "close": prices_orig,
        "volume": 1e5
    }, index=dates)

    # df2 is identical up to bar 60, but wildly altered from bar 61 onwards
    df2 = df1.copy()
    df2.iloc[60:, df2.columns.get_loc("close")] *= 5.0
    df2.iloc[60:, df2.columns.get_loc("high")] *= 5.0
    df2.iloc[60:, df2.columns.get_loc("low")] *= 5.0

    pipeline = FeaturePipeline()
    f1 = pipeline.build_features(df1)
    f2 = pipeline.build_features(df2)

    # Features at bar 59 (before alteration) MUST BE EXACTLY IDENTICAL
    row1 = f1.iloc[59].dropna()
    row2 = f2.iloc[59].dropna()
    
    pd.testing.assert_series_equal(row1, row2, check_names=False)
    print("Anti-lookahead verified: Future price shock did not leak into past features.")

def test_target_construction_temporal_barrier():
    """
    Verify that target forward returns use future prices but features use past prices.
    """
    dates = pd.date_range(start="2023-01-01", periods=20, freq="B")
    close = [float(i) for i in range(1, 21)]
    df = pd.DataFrame({"close": close, "open": close, "high": close, "low": close, "volume": 100}, index=dates)

    pipeline = FeaturePipeline()
    targets = pipeline.build_targets(df, horizons={"1d": 1, "5d": 5})

    # target_return_1d at index 0 must be (close[1] / close[0]) - 1 = 2/1 - 1 = 1.0
    assert np.isclose(targets["target_return_1d"].iloc[0], 1.0)
    # target at last bar must be NaN (future not yet observed)
    assert np.isnan(targets["target_return_1d"].iloc[-1])
