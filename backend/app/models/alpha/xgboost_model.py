from typing import Dict, Any, Optional, Tuple, List
import numpy as np
import pandas as pd
import xgboost as xgb
from app.core.logging import logger

class XGBoostAlphaModel:
    """
    Supervised XGBoost model for quantitative alpha prediction.
    Predicts expected forward return: E[r_{t+h} | X_t] (Regression)
    or probability of positive return P(r > 0) (Classification).
    """

    def __init__(
        self,
        task: str = "regression",
        n_estimators: int = 150,
        max_depth: int = 4,
        learning_rate: float = 0.03,
        subsample: float = 0.8,
        colsample_bytree: float = 0.8,
        reg_alpha: float = 0.1,
        reg_lambda: float = 1.0,
        random_state: int = 42
    ):
        self.task = task
        self.params = {
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "learning_rate": learning_rate,
            "subsample": subsample,
            "colsample_bytree": colsample_bytree,
            "reg_alpha": reg_alpha,
            "reg_lambda": reg_lambda,
            "random_state": random_state,
            "n_jobs": -1
        }
        self.feature_names = []
        self.model = None
        self._init_estimator()

    def _init_estimator(self):
        if self.task == "classification":
            self.model = xgb.XGBClassifier(
                **self.params,
                eval_metric="logloss"
            )
        else:
            self.model = xgb.XGBRegressor(
                **self.params,
                eval_metric="rmse"
            )

    def fit(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series,
        eval_set: Optional[List[Tuple[pd.DataFrame, pd.Series]]] = None
    ):
        self.feature_names = list(X_train.columns)
        eval_pairs = None
        if eval_set:
            eval_pairs = [(es_x.values, es_y.values) for es_x, es_y in eval_set]

        self.model.fit(
            X_train.values,
            y_train.values,
            eval_set=eval_pairs,
            verbose=False
        )
        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        if self.model is None:
            raise ValueError("Model is not fitted yet.")
        X_aligned = X[self.feature_names].values
        if self.task == "classification":
            return self.model.predict_proba(X_aligned)[:, 1]
        return self.model.predict(X_aligned)

    def get_feature_importance(self) -> Dict[str, float]:
        if self.model is None:
            return {}
        scores = self.model.feature_importances_
        return {feat: float(score) for feat, score in zip(self.feature_names, scores)}
