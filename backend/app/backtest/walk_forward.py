from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from app.models.alpha.xgboost_model import XGBoostAlphaModel
from app.core.logging import logger

class WalkForwardValidator:
    """
    Time-series Walk-Forward Validation engine.
    Strictly avoids lookahead bias by validating sequentially on out-of-sample test windows.
    Tracks Spearman Rank Information Coefficient (IC), IC_IR, directional accuracy, and RMSE.
    """

    def __init__(
        self,
        train_window: int = 504, # ~2 years
        test_window: int = 126,   # ~6 months
        step_size: int = 63      # ~3 months step
    ):
        self.train_window = train_window
        self.test_window = test_window
        self.step_size = step_size

    def validate(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        model_cls=XGBoostAlphaModel,
        model_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes rolling/expanding walk-forward cross-validation.
        """
        if model_params is None:
            model_params = {}

        n_samples = len(X)
        if n_samples < (self.train_window + self.test_window):
            # Scale down windows if dataset is shorter
            train_w = int(n_samples * 0.65)
            test_w = n_samples - train_w
            step_w = max(20, int(test_w / 2))
        else:
            train_w = self.train_window
            test_w = self.test_window
            step_w = self.step_size

        splits = []
        start_idx = 0
        while (start_idx + train_w + test_w) <= n_samples:
            train_end = start_idx + train_w
            test_end = train_end + test_w
            splits.append((start_idx, train_end, test_end))
            start_idx += step_w

        if not splits:
            splits.append((0, int(n_samples * 0.7), n_samples))

        logger.info(f"WalkForwardValidator: Generated {len(splits)} sequential walk-forward fold(s).")

        fold_metrics = []
        all_oos_predictions = []
        all_oos_realized = []
        ic_time_series = []

        for fold_idx, (tr_s, tr_e, te_e) in enumerate(splits):
            X_tr, y_tr = X.iloc[tr_s:tr_e], y.iloc[tr_s:tr_e]
            X_te, y_te = X.iloc[tr_e:te_e], y.iloc[tr_e:te_e]

            model = model_cls(**model_params)
            model.fit(X_tr, y_tr)

            preds = model.predict(X_te)
            y_real = y_te.values

            # Spearman Rank Information Coefficient (IC)
            if len(np.unique(preds)) > 1 and len(np.unique(y_real)) > 1:
                ic_val, _ = spearmanr(preds, y_real)
                if np.isnan(ic_val):
                    ic_val = 0.0
            else:
                ic_val = 0.0

            # Directional accuracy
            dir_acc = float(np.mean(np.sign(preds) == np.sign(y_real)))
            rmse = float(np.sqrt(np.mean((preds - y_real) ** 2)))
            mae = float(np.mean(np.abs(preds - y_real)))

            fold_record = {
                "fold": fold_idx + 1,
                "train_start": str(X.index[tr_s])[:10],
                "train_end": str(X.index[tr_e - 1])[:10],
                "test_start": str(X.index[tr_e])[:10],
                "test_end": str(X.index[te_e - 1])[:10],
                "test_samples": len(X_te),
                "rank_ic": round(float(ic_val), 4),
                "directional_accuracy": round(dir_acc, 4),
                "rmse": round(rmse, 4),
                "mae": round(mae, 4)
            }
            fold_metrics.append(fold_record)

            for dt, p, r in zip(X_te.index, preds, y_real):
                all_oos_predictions.append(float(p))
                all_oos_realized.append(float(r))
                ic_time_series.append({
                    "date": str(dt)[:10],
                    "predicted": round(float(p), 4),
                    "realized": round(float(r), 4)
                })

        # Summary statistics across folds
        ic_list = [f["rank_ic"] for f in fold_metrics]
        mean_ic = float(np.mean(ic_list))
        std_ic = float(np.std(ic_list)) or 1e-6
        ic_ir = mean_ic / std_ic

        return {
            "folds_count": len(splits),
            "mean_rank_ic": round(mean_ic, 4),
            "ic_std": round(std_ic, 4),
            "ic_information_ratio": round(ic_ir, 4),
            "mean_directional_accuracy": round(float(np.mean([f["directional_accuracy"] for f in fold_metrics])), 4),
            "mean_rmse": round(float(np.mean([f["rmse"] for f in fold_metrics])), 4),
            "fold_results": fold_metrics,
            "prediction_series": ic_time_series[-100:] # Recent 100 out-of-sample predictions
        }
