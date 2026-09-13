from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from hmmlearn.hmm import GaussianHMM
from app.core.logging import logger

REGIME_LABELS = {
    "BULL_TREND": "Bull Trend (Low Vol)",
    "HIGH_VOLATILITY": "High Volatility (Bearish/Correction)",
    "SIDEWAYS": "Sideways / Mean Reverting"
}

class MarketRegimeHMM:
    """
    Hidden Markov Model for market regime detection.
    Fits a 3-state Gaussian HMM on market return, realized volatility, and volume dynamics.
    Dynamically sorts states based on mean return and variance.
    """

    def __init__(self, n_states: int = 3, random_state: int = 42):
        self.n_states = n_states
        self.random_state = random_state
        self.hmm = GaussianHMM(
            n_components=n_states,
            covariance_type="full",
            n_iter=200,
            random_state=random_state
        )
        self.state_mapping = {} # maps raw HMM hidden state index -> canonical regime label
        self.is_fitted = False

    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        features = pd.DataFrame(index=df.index)
        close = df["close"]
        ret_1d = close.pct_change(1)

        features["return"] = ret_1d
        features["volatility"] = ret_1d.rolling(20).std() * np.sqrt(252)
        features["vol_change"] = features["volatility"].pct_change(5)
        
        if "volume" in df.columns:
            vol_sma = df["volume"].rolling(20).mean()
            features["volume_ratio"] = df["volume"] / vol_sma.replace(0, np.nan)
        else:
            features["volume_ratio"] = 1.0

        return features.dropna()

    def fit(self, df: pd.DataFrame):
        X = self._prepare_features(df)
        if len(X) < 100:
            raise ValueError(f"Insufficient history for HMM regime fit ({len(X)} bars).")

        self.hmm.fit(X.values)
        self.is_fitted = True

        # Heuristic labeling based on mean return and mean volatility of each component
        means = self.hmm.means_ # shape: (n_components, n_features)
        
        # Feature 0 is return, feature 1 is volatility
        state_stats = []
        for state_idx in range(self.n_states):
            mean_ret = means[state_idx, 0]
            mean_vol = means[state_idx, 1]
            state_stats.append((state_idx, mean_ret, mean_vol))

        # Highest volatility is HIGH_VOLATILITY
        sorted_by_vol = sorted(state_stats, key=lambda x: x[2], reverse=True)
        high_vol_state = sorted_by_vol[0][0]

        remaining = [s for s in state_stats if s[0] != high_vol_state]
        # Of remaining, higher return is BULL_TREND, other is SIDEWAYS
        sorted_by_ret = sorted(remaining, key=lambda x: x[1], reverse=True)
        bull_state = sorted_by_ret[0][0]
        sideways_state = sorted_by_ret[1][0]

        self.state_mapping = {
            bull_state: "BULL_TREND",
            high_vol_state: "HIGH_VOLATILITY",
            sideways_state: "SIDEWAYS"
        }
        logger.info(f"HMM Regime model fitted. State mapping: {self.state_mapping}")
        return self

    def predict_regimes(self, df: pd.DataFrame) -> pd.DataFrame:
        if not self.is_fitted:
            raise ValueError("HMM model must be fitted first.")

        X = self._prepare_features(df)
        hidden_states = self.hmm.predict(X.values)
        posteriors = self.hmm.predict_proba(X.values)

        result_df = pd.DataFrame(index=X.index)
        result_df["raw_state"] = hidden_states
        result_df["regime"] = [self.state_mapping.get(s, "SIDEWAYS") for s in hidden_states]

        # Extract probability for each canonical regime
        for raw_state, label in self.state_mapping.items():
            result_df[f"prob_{label}"] = posteriors[:, raw_state]

        return result_df

    def get_current_regime(self, df: pd.DataFrame) -> Dict[str, Any]:
        regimes_df = self.predict_regimes(df)
        latest = regimes_df.iloc[-1]
        
        # Transition matrix mapped to canonical labels
        trans_mat = {}
        for src_raw, src_label in self.state_mapping.items():
            trans_mat[src_label] = {}
            for dst_raw, dst_label in self.state_mapping.items():
                trans_mat[src_label][dst_label] = round(float(self.hmm.transmat_[src_raw, dst_raw]), 4)

        return {
            "current_regime": latest["regime"],
            "description": REGIME_LABELS.get(latest["regime"], latest["regime"]),
            "probabilities": {
                "BULL_TREND": round(float(latest.get("prob_BULL_TREND", 0.0)), 4),
                "HIGH_VOLATILITY": round(float(latest.get("prob_HIGH_VOLATILITY", 0.0)), 4),
                "SIDEWAYS": round(float(latest.get("prob_SIDEWAYS", 0.0)), 4),
            },
            "transition_matrix": trans_mat,
            "timestamp": str(regimes_df.index[-1])
        }
