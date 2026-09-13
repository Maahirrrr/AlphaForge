from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timezone
from app.features.feature_pipeline import FeaturePipeline
from app.models.alpha.xgboost_model import XGBoostAlphaModel
from app.models.explainability.shap import ModelExplainer
from app.backtest.walk_forward import WalkForwardValidator
from app.data.providers.csv import CSVDataProvider
from app.database.session import SessionLocal
from app.database.models import ModelRegistry
from app.core.logging import logger

class ResearchService:
    def __init__(self):
        self.pipeline = FeaturePipeline()
        self.data_provider = CSVDataProvider()

    def train_model(
        self,
        symbol: str = "AAPL",
        target_horizon: str = "5d",
        task: str = "regression",
        n_estimators: int = 100,
        max_depth: int = 4,
        learning_rate: float = 0.03
    ) -> Dict[str, Any]:
        df = self.data_provider.get_historical_prices(symbol, "2021-01-01", "")
        if df.empty:
            raise ValueError(f"No market data available for symbol {symbol}")

        X, y, clean_df = self.pipeline.prepare_dataset(
            df,
            target_horizon=target_horizon,
            target_type="return" if task == "regression" else "binary"
        )

        model = XGBoostAlphaModel(
            task=task,
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=learning_rate
        )
        model.fit(X, y)

        # Walk forward validation
        validator = WalkForwardValidator(train_window=500, test_window=100, step_size=50)
        val_results = validator.validate(
            X, y,
            model_cls=XGBoostAlphaModel,
            model_params={"task": task, "n_estimators": n_estimators, "max_depth": max_depth}
        )

        # SHAP explainability
        explainer = ModelExplainer(model, feature_names=list(X.columns))
        global_importance = explainer.get_global_importance(X.iloc[-200:])
        latest_explanation = explainer.explain_prediction(X.iloc[-1])

        # Drift detection
        drift_report = explainer.detect_model_drift(X.iloc[:500], X.iloc[-150:])

        model_id = f"MODEL-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        
        # Save to DB
        db = SessionLocal()
        try:
            reg_entry = ModelRegistry(
                model_id=model_id,
                name=f"XGBoost Alpha ({symbol} {target_horizon})",
                model_type="xgboost",
                target=f"forward_return_{target_horizon}",
                horizon=target_horizon,
                status="RESEARCH",
                features=list(X.columns),
                hyperparameters={
                    "task": task,
                    "n_estimators": n_estimators,
                    "max_depth": max_depth,
                    "learning_rate": learning_rate
                },
                metrics={
                    "mean_rank_ic": val_results["mean_rank_ic"],
                    "ic_ir": val_results["ic_information_ratio"],
                    "directional_acc": val_results["mean_directional_accuracy"],
                    "rmse": val_results["mean_rmse"]
                },
                dataset_version=f"{symbol}_2021_2026"
            )
            db.add(reg_entry)
            db.commit()
        finally:
            db.close()

        return {
            "model_id": model_id,
            "symbol": symbol,
            "target_horizon": target_horizon,
            "features_count": len(X.columns),
            "samples_count": len(X),
            "walk_forward": val_results,
            "global_importance": global_importance[:15],
            "latest_prediction_explanation": latest_explanation,
            "drift_report": drift_report
        }

    def explain_latest(self, symbol: str = "AAPL") -> Dict[str, Any]:
        df = self.data_provider.get_historical_prices(symbol, "2023-01-01", "")
        X, y, clean_df = self.pipeline.prepare_dataset(df, target_horizon="5d")
        model = XGBoostAlphaModel(n_estimators=80, max_depth=3)
        model.fit(X, y)
        explainer = ModelExplainer(model, list(X.columns))
        return explainer.explain_prediction(X.iloc[-1])
