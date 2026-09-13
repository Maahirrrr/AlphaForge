from typing import Dict, Any
from datetime import datetime
import pandas as pd
import numpy as np
from app.strategies.base import BaseStrategy
from app.features.feature_pipeline import FeaturePipeline
from app.models.alpha.xgboost_model import XGBoostAlphaModel
from app.quant.optimization import PortfolioOptimizer
from app.core.logging import logger

class MLCrossSectionalStrategy(BaseStrategy):
    """
    Supervised Machine Learning Cross-Sectional Alpha Strategy.
    Extracts features, scores universe with XGBoost forward return model,
    and constructs Mean-Variance optimal weights.
    Features are cached for high-performance backtest execution.
    """

    def __init__(self, name: str = "ML Cross Sectional", config: Dict[str, Any] = None):
        super().__init__(name, config or {})
        self.pipeline = FeaturePipeline()
        self.model = None
        self.target_horizon = self.config.get("horizon", "5d")
        self.top_k = self.config.get("top_k", 3)
        self.max_weight = self.config.get("max_weight", 0.35)
        self._cached_features = {}

    def _train_model_if_needed(self, historical_data: Dict[str, pd.DataFrame]):
        if self.model is not None:
            return

        all_X, all_y = [], []
        for sym, df in historical_data.items():
            if len(df) > 100:
                X, y, _ = self.pipeline.prepare_dataset(df, target_horizon=self.target_horizon)
                if not X.empty:
                    self._cached_features[sym] = X
                    all_X.append(X)
                    all_y.append(y)

        if all_X:
            combined_X = pd.concat(all_X, axis=0)
            combined_y = pd.concat(all_y, axis=0)
            self.model = XGBoostAlphaModel(task="regression", n_estimators=80, max_depth=3)
            self.model.fit(combined_X, combined_y)
            logger.info("MLCrossSectionalStrategy: Model trained and feature cache initialized.")

    def generate_signals(
        self,
        current_time: datetime,
        historical_data: Dict[str, pd.DataFrame]
    ) -> Dict[str, Any]:
        self._train_model_if_needed(historical_data)

        predictions = {}
        returns_dict = {}

        for sym, df in historical_data.items():
            if sym in self._cached_features and current_time in self._cached_features[sym].index:
                feat_row = self._cached_features[sym].loc[[current_time]]
            else:
                feats = self.pipeline.build_features(df)
                feat_row = feats.iloc[[-1]] if not feats.empty else pd.DataFrame()

            if not feat_row.empty and self.model:
                pred = self.model.predict(feat_row)[0]
                predictions[sym] = float(pred)
                returns_dict[sym] = df["close"].pct_change().dropna()

        if not predictions:
            symbols = list(historical_data.keys())
            return {"target_weights": PortfolioOptimizer.equal_weight(symbols)}

        # Sort and select top K assets
        sorted_symbols = sorted(predictions.items(), key=lambda x: x[1], reverse=True)
        top_symbols = [s[0] for s in sorted_symbols[:self.top_k] if s[1] > 0]
        if not top_symbols:
            top_symbols = [sorted_symbols[0][0]]

        ret_df = pd.DataFrame({s: returns_dict[s] for s in top_symbols if s in returns_dict}).dropna()
        if not ret_df.empty and len(ret_df) > 20:
            top_preds = {s: predictions[s] for s in top_symbols}
            weights = PortfolioOptimizer.mean_variance(
                expected_returns=top_preds,
                returns_df=ret_df,
                max_position_weight=self.max_weight
            )
        else:
            weights = PortfolioOptimizer.equal_weight(top_symbols)

        return {
            "target_weights": weights,
            "predictions": predictions,
            "top_assets": top_symbols
        }
