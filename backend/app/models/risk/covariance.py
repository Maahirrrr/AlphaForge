from typing import Optional, Tuple
import numpy as np
import pandas as pd
from sklearn.covariance import LedoitWolf
from app.core.logging import logger

class CovarianceEstimator:
    """
    Robust covariance matrix estimators for portfolio optimization.
    Implements Ledoit-Wolf shrinkage, EWMA, and condition-number regularization
    to prevent inversion failures on singular/collinear matrices.
    """

    @staticmethod
    def ledoit_wolf_shrinkage(returns_df: pd.DataFrame) -> Tuple[np.ndarray, float]:
        """
        Computes the Ledoit-Wolf optimal shrinkage covariance matrix.
        Returns: (shrunk_cov_matrix, shrinkage_constant)
        """
        clean_ret = returns_df.dropna().values
        if clean_ret.shape[0] < 5:
            var_diag = np.var(clean_ret, axis=0) if clean_ret.shape[0] > 1 else np.ones(clean_ret.shape[1]) * 0.04
            return np.diag(var_diag), 1.0

        lw = LedoitWolf()
        lw.fit(clean_ret)
        cov = lw.covariance_
        shrinkage = float(lw.shrinkage_)
        
        cov = CovarianceEstimator.ensure_positive_definite(cov)
        return cov, shrinkage

    @staticmethod
    def ewma_covariance(returns_df: pd.DataFrame, halflife: int = 40) -> np.ndarray:
        """
        Computes Exponentially Weighted Moving Average (EWMA) covariance matrix.
        """
        decay = 0.5 ** (1.0 / halflife)
        clean_ret = returns_df.dropna()
        n, p = clean_ret.shape
        weights = np.array([decay ** (n - 1 - i) for i in range(n)])
        weights /= weights.sum()

        mean_w = np.average(clean_ret.values, axis=0, weights=weights)
        demeaned = clean_ret.values - mean_w
        weighted_demeaned = demeaned * np.sqrt(weights[:, np.newaxis])
        cov = np.dot(weighted_demeaned.T, weighted_demeaned)

        return CovarianceEstimator.ensure_positive_definite(cov)

    @staticmethod
    def ensure_positive_definite(cov: np.ndarray, min_eigenval: float = 1e-6) -> np.ndarray:
        """
        Guarantees matrix is symmetric positive definite (SPD) via eigenvalue clipping.
        """
        cov_sym = 0.5 * (cov + cov.T)
        eigvals, eigvecs = np.linalg.eigh(cov_sym)
        if np.any(eigvals < min_eigenval):
            clipped_eigvals = np.clip(eigvals, a_min=min_eigenval, a_max=None)
            cov_sym = eigvecs @ np.diag(clipped_eigvals) @ eigvecs.T
        return cov_sym
