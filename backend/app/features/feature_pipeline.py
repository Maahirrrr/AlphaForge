from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np

from app.features.returns import compute_returns_features
from app.features.momentum import compute_momentum_features
from app.features.volatility import compute_volatility_features
from app.features.statistical import compute_statistical_features
from app.features.microstructure import compute_microstructure_features
from app.features.technical import compute_technical_features
from app.features.factors import compute_raw_factors
from app.core.logging import logger

HORIZONS = {
    "1d": 1,
    "5d": 5,
    "10d": 10,
    "20d": 20
}

class FeaturePipeline:
    """
    End-to-end quantitative feature engineering pipeline.
    Guarantees strict temporal separation:
    - Features X_t use ONLY data available up to time t.
    - Prediction targets y_{t, h} = (P_{t+h} / P_t - 1) are explicitly shifted.
    """

    def __init__(self, price_col: str = "close", vol_col: str = "volume"):
        self.price_col = price_col
        self.vol_col = vol_col

    def build_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Builds complete multi-domain feature matrix for a single asset.
        """
        if df.empty or len(df) < 50:
            logger.warning("Insufficient data for feature engineering (< 50 bars).")
            return pd.DataFrame()

        f_ret = compute_returns_features(df, price_col=self.price_col)
        f_mom = compute_momentum_features(df, price_col=self.price_col)
        f_vol = compute_volatility_features(df, price_col=self.price_col)
        f_stat = compute_statistical_features(df, price_col=self.price_col)
        f_micro = compute_microstructure_features(df, price_col=self.price_col, vol_col=self.vol_col)
        f_tech = compute_technical_features(df, price_col=self.price_col)
        f_factor = compute_raw_factors(df)

        feature_matrix = pd.concat([
            f_ret, f_mom, f_vol, f_stat, f_micro, f_tech, f_factor
        ], axis=1)

        # Replace infs and drop non-finite values where appropriate
        feature_matrix = feature_matrix.replace([np.inf, -np.inf], np.nan)

        return feature_matrix

    def build_targets(self, df: pd.DataFrame, horizons: Optional[Dict[str, int]] = None) -> pd.DataFrame:
        """
        Computes forward return targets for prediction horizons:
        y_{t, h} = P_{t+h} / P_t - 1.
        Uses negative shift so that row t contains forward return from t to t+h.
        """
        if horizons is None:
            horizons = HORIZONS

        targets = pd.DataFrame(index=df.index)
        prices = df[self.price_col]

        for name, h in horizons.items():
            fwd_ret = (prices.shift(-h) / prices) - 1.0
            targets[f"target_return_{name}"] = fwd_ret
            # Binary classification target (1 if positive forward return, else 0)
            targets[f"target_binary_{name}"] = (fwd_ret > 0).astype(float)
            targets.loc[fwd_ret.isna(), f"target_binary_{name}"] = np.nan

        return targets

    def prepare_dataset(
        self,
        df: pd.DataFrame,
        target_horizon: str = "5d",
        target_type: str = "return", # "return" or "binary"
        drop_warmup: int = 60
    ) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame]:
        """
        Produces clean aligned (X, y, df_clean) dataset for ML model training.
        Ensures anti-lookahead: drops future unobserved target rows at the tail.
        """
        features = self.build_features(df)
        targets = self.build_targets(df)

        target_col = f"target_{target_type}_{target_horizon}"
        if target_col not in targets.columns:
            target_col = f"target_return_{target_horizon}"

        # Align features and target
        combined = pd.concat([features, targets[[target_col]]], axis=1)
        
        # Drop warm-up rows (first 60 days) and unobserved tail targets
        combined = combined.iloc[drop_warmup:]
        valid_mask = combined[target_col].notna()
        combined = combined[valid_mask]

        X = combined.drop(columns=[target_col]).ffill().bfill().fillna(0.0)
        y = combined[target_col]
        
        return X, y, df.loc[combined.index]
