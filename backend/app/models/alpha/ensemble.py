from typing import List, Dict, Any
import numpy as np
import pandas as pd
from app.models.alpha.xgboost_model import XGBoostAlphaModel
from app.models.alpha.baseline import BaselineAlphaModel

class EnsembleAlphaModel:
    """
    Blended ensemble model combining XGBoost nonlinear representations
    with regularized linear Ridge predictions and factor signals.
    """
    def __init__(self, xgb_weight: float = 0.70, ridge_weight: float = 0.30):
        self.xgb_model = XGBoostAlphaModel(task="regression")
        self.ridge_model = BaselineAlphaModel(alpha=2.0)
        self.xgb_weight = xgb_weight
        self.ridge_weight = ridge_weight
        self.feature_names = []

    def fit(self, X: pd.DataFrame, y: pd.Series):
        self.feature_names = list(X.columns)
        self.xgb_model.fit(X, y)
        self.ridge_model.fit(X, y)
        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        p_xgb = self.xgb_model.predict(X)
        p_ridge = self.ridge_model.predict(X)
        return (self.xgb_weight * p_xgb) + (self.ridge_weight * p_ridge)

    def get_feature_importance(self) -> Dict[str, float]:
        return self.xgb_model.get_feature_importance()
