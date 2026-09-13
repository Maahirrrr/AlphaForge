import pytest
import pandas as pd
import numpy as np
from app.features.returns import compute_returns_features
from app.features.momentum import compute_momentum_features
from app.features.volatility import compute_volatility_features
from app.features.statistical import compute_statistical_features
from app.features.technical import compute_technical_features
from app.features.feature_pipeline import FeaturePipeline

@pytest.fixture
def sample_ohlcv():
    dates = pd.date_range(start="2023-01-01", periods=100, freq="B")
    np.random.seed(42)
    close = 100.0 * np.cumprod(1.0 + np.random.normal(0, 0.01, 100))
    high = close * 1.01
    low = close * 0.99
    open_p = (high + low) / 2.0
    volume = np.random.uniform(1e5, 1e6, 100)

    return pd.DataFrame({
        "open": open_p,
        "high": high,
        "low": low,
        "close": close,
        "volume": volume
    }, index=dates)

def test_returns_features(sample_ohlcv):
    f = compute_returns_features(sample_ohlcv)
    assert "return_1d" in f.columns
    assert "return_5d" in f.columns
    assert "log_return_1d" in f.columns
    assert np.isclose(f["return_1d"].iloc[1], (sample_ohlcv["close"].iloc[1] / sample_ohlcv["close"].iloc[0]) - 1.0)

def test_volatility_annualization(sample_ohlcv):
    f = compute_volatility_features(sample_ohlcv)
    assert "vol_20d" in f.columns
    assert "vol_ewma_span20" in f.columns
    assert (f["vol_20d"].dropna() >= 0).all()

def test_technical_indicators(sample_ohlcv):
    f = compute_technical_features(sample_ohlcv)
    assert "rsi_14d" in f.columns
    assert "macd" in f.columns
    assert "bb_pct_b" in f.columns
    # RSI bounded [0, 100]
    valid_rsi = f["rsi_14d"].dropna()
    assert (valid_rsi >= 0.0).all() and (valid_rsi <= 100.0).all()

def test_feature_pipeline_prepare(sample_ohlcv):
    pipeline = FeaturePipeline()
    X, y, df_clean = pipeline.prepare_dataset(sample_ohlcv, target_horizon="5d")
    assert not X.empty
    assert len(X) == len(y)
    assert not X.isna().any().any()
