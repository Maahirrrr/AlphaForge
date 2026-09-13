from typing import Dict, List, Optional
import numpy as np
import pandas as pd
from scipy.optimize import minimize
from app.models.risk.covariance import CovarianceEstimator
from app.core.logging import logger

class PortfolioOptimizer:
    """
    Portfolio construction & optimization engine.
    Supports:
    1. Mean-Variance Optimization (max w^T mu - lambda/2 * w^T Sigma w)
    2. Risk Parity (Equal Risk Contribution)
    3. Inverse Volatility
    4. Equal Weight
    """

    @staticmethod
    def equal_weight(symbols: List[str]) -> Dict[str, float]:
        n = len(symbols)
        if n == 0:
            return {}
        w = 1.0 / n
        return {s: round(w, 4) for s in symbols}

    @staticmethod
    def inverse_volatility(returns_df: pd.DataFrame) -> Dict[str, float]:
        symbols = list(returns_df.columns)
        vols = returns_df.std() * np.sqrt(252)
        inv_vols = 1.0 / vols.replace(0, np.nan)
        weights = inv_vols / inv_vols.sum()
        weights = weights.fillna(1.0 / len(symbols))
        return {s: round(float(weights[s]), 4) for s in symbols}

    @staticmethod
    def mean_variance(
        expected_returns: Dict[str, float],
        returns_df: pd.DataFrame,
        risk_aversion: float = 2.5,
        max_position_weight: float = 0.25,
        long_only: bool = True
    ) -> Dict[str, float]:
        """
        Mean-Variance Optimization via Quadratic Programming (SLSQP).
        Objective: minimize - (w^T mu - 0.5 * lambda * w^T Sigma w)
        Subject to: sum(w) = 1, 0 <= w_i <= max_weight
        """
        symbols = [s for s in expected_returns.keys() if s in returns_df.columns]
        n = len(symbols)
        if n == 0:
            return {}
        if n == 1:
            return {symbols[0]: 1.0}

        mu = np.array([expected_returns[s] for s in symbols])
        clean_ret = returns_df[symbols]
        cov_matrix, _ = CovarianceEstimator.ledoit_wolf_shrinkage(clean_ret)

        def objective(w):
            port_ret = np.dot(w, mu)
            port_var = np.dot(w, np.dot(cov_matrix, w))
            # Negative utility to minimize
            return -(port_ret - 0.5 * risk_aversion * port_var)

        def gradient(w):
            return -(mu - risk_aversion * np.dot(cov_matrix, w))

        # Constraints
        constraints = [{"type": "eq", "fun": lambda w: np.sum(w) - 1.0}]
        
        # Bounds
        if long_only:
            bounds = tuple((0.0, max_position_weight) for _ in range(n))
        else:
            bounds = tuple((-max_position_weight, max_position_weight) for _ in range(n))

        init_w = np.ones(n) / n
        try:
            res = minimize(
                objective,
                init_w,
                jac=gradient,
                method="SLSQP",
                bounds=bounds,
                constraints=constraints,
                options={"maxiter": 500, "ftol": 1e-7}
            )
            if res.success:
                opt_w = np.clip(res.x, 0.0 if long_only else -max_position_weight, max_position_weight)
                if np.sum(opt_w) > 0:
                    opt_w /= np.sum(opt_w)
                return {s: round(float(w), 4) for s, w in zip(symbols, opt_w)}
        except Exception as e:
            logger.warning(f"Mean-variance optimization failed: {e}. Falling back to inverse vol.")

        return PortfolioOptimizer.inverse_volatility(returns_df[symbols])

    @staticmethod
    def risk_parity(returns_df: pd.DataFrame) -> Dict[str, float]:
        """
        Equal Risk Contribution (ERC) optimization:
        Minimize sum_i sum_j (w_i (Sigma w)_i - w_j (Sigma w)_j)^2
        """
        symbols = list(returns_df.columns)
        n = len(symbols)
        if n == 0:
            return {}
        if n == 1:
            return {symbols[0]: 1.0}

        cov, _ = CovarianceEstimator.ledoit_wolf_shrinkage(returns_df)

        def erc_objective(w):
            port_var = np.dot(w, np.dot(cov, w))
            if port_var <= 0:
                return 1e6
            # Marginal risk contribution
            mrc = np.dot(cov, w)
            # Risk contribution
            rc = w * mrc
            target_rc = port_var / n
            return np.sum((rc - target_rc) ** 2)

        init_w = np.ones(n) / n
        bounds = tuple((0.01, 1.0) for _ in range(n))
        constraints = [{"type": "eq", "fun": lambda w: np.sum(w) - 1.0}]

        try:
            res = minimize(
                erc_objective,
                init_w,
                method="SLSQP",
                bounds=bounds,
                constraints=constraints
            )
            if res.success:
                opt_w = res.x / np.sum(res.x)
                return {s: round(float(w), 4) for s, w in zip(symbols, opt_w)}
        except Exception as e:
            logger.warning(f"Risk parity optimization failed: {e}.")

        return PortfolioOptimizer.equal_weight(symbols)
