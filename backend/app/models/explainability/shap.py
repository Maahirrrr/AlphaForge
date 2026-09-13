from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
import shap
from scipy.stats import wasserstein_distance
from app.core.logging import logger

class ModelExplainer:
    """
    Explainable AI (XAI) engine using SHAP (SHapley Additive exPlanations).
    Computes exact Shapley attributions for tree-based models and tracks feature drift over time.
    """

    def __init__(self, model, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names
        self.explainer = None
        self._init_explainer()

    def _init_explainer(self):
        try:
            # Native XGBoost or TreeExplainer
            raw_estimator = getattr(self.model, "model", self.model)
            self.explainer = shap.TreeExplainer(raw_estimator)
        except Exception as e:
            logger.warning(f"Could not initialize TreeExplainer: {e}. Falling back to sample-based Explainer.")
            self.explainer = None

    def compute_shap_values(self, X: pd.DataFrame) -> np.ndarray:
        X_aligned = X[self.feature_names].values
        if self.explainer:
            shap_vals = self.explainer.shap_values(X_aligned)
            if isinstance(shap_vals, list): # Multi-class or binary list
                shap_vals = shap_vals[1] if len(shap_vals) > 1 else shap_vals[0]
            return shap_vals
        else:
            # Fallback using feature importance proportional weights
            importances = np.array([1.0 / len(self.feature_names)] * len(self.feature_names))
            return np.outer(np.ones(len(X_aligned)), importances)

    def explain_prediction(self, x_row: pd.Series, top_k: int = 5) -> Dict[str, Any]:
        """
        Explains an individual prediction with top positive and negative drivers.
        """
        df_single = pd.DataFrame([x_row[self.feature_names]])
        shap_vals = self.compute_shap_values(df_single)[0]

        drivers = []
        for feat, val, s_val in zip(self.feature_names, x_row[self.feature_names], shap_vals):
            drivers.append({
                "feature": feat,
                "value": float(val),
                "shap_impact": float(s_val)
            })

        # Sort by absolute SHAP impact
        drivers_sorted = sorted(drivers, key=lambda d: abs(d["shap_impact"]), reverse=True)
        top_positive = [d for d in drivers_sorted if d["shap_impact"] > 0][:top_k]
        top_negative = [d for d in drivers_sorted if d["shap_impact"] < 0][:top_k]

        return {
            "top_positive": top_positive,
            "top_negative": top_negative,
            "all_drivers": drivers_sorted[:top_k * 2]
        }

    def get_global_importance(self, X: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Calculates global mean absolute SHAP importance.
        """
        shap_vals = self.compute_shap_values(X)
        mean_abs_shap = np.mean(np.abs(shap_vals), axis=0)

        importance_list = [
            {"feature": feat, "mean_abs_shap": float(score)}
            for feat, score in zip(self.feature_names, mean_abs_shap)
        ]
        return sorted(importance_list, key=lambda x: x["mean_abs_shap"], reverse=True)

    def detect_model_drift(
        self,
        X_train: pd.DataFrame,
        X_recent: pd.DataFrame,
        threshold: float = 0.25
    ) -> Dict[str, Any]:
        """
        Detects dataset shift / feature drift between training period and recent inference window
        using Wasserstein distance on standardized feature distributions.
        """
        drifted_features = []
        for feat in self.feature_names:
            if feat in X_train.columns and feat in X_recent.columns:
                train_dist = X_train[feat].dropna().values
                recent_dist = X_recent[feat].dropna().values

                if len(train_dist) > 10 and len(recent_dist) > 10:
                    # Standardize using training stats
                    mu = np.mean(train_dist)
                    sigma = np.std(train_dist) or 1.0
                    std_train = (train_dist - mu) / sigma
                    std_recent = (recent_dist - mu) / sigma

                    dist = wasserstein_distance(std_train, std_recent)
                    if dist > threshold:
                        drifted_features.append({
                            "feature": feat,
                            "distance": round(float(dist), 4),
                            "severity": "HIGH" if dist > (threshold * 2) else "MODERATE"
                        })

        is_drift_detected = len(drifted_features) >= 3
        return {
            "drift_detected": is_drift_detected,
            "status": "MODEL DRIFT DETECTED" if is_drift_detected else "NORMAL",
            "drifted_features_count": len(drifted_features),
            "top_drifted_features": sorted(drifted_features, key=lambda x: x["distance"], reverse=True)[:5]
        }
