from fastapi import APIRouter
from app.services.backtest_service import STRATEGY_REGISTRY

router = APIRouter(prefix="/api/strategies", tags=["Strategies"])

@router.get("")
def list_strategies():
    return [
        {
            "key": "ML_CROSS_SECTIONAL",
            "name": "ML Cross-Sectional Alpha",
            "description": "Supervised XGBoost return prediction with Mean-Variance quadratic optimization.",
            "category": "Machine Learning",
            "rebalance": "Weekly",
            "status": "READY"
        },
        {
            "key": "MOMENTUM",
            "name": "Quantitative Momentum",
            "description": "20-day rate of change ranking with inverse-volatility risk budgeting.",
            "category": "Factor Quant",
            "rebalance": "Weekly",
            "status": "READY"
        },
        {
            "key": "MEAN_REVERSION",
            "name": "Statistical Mean Reversion",
            "description": "Rolling 20-day price Z-score & Bollinger oversold detection.",
            "category": "Statistical",
            "rebalance": "Daily",
            "status": "READY"
        },
        {
            "key": "REGIME_ADAPTIVE",
            "name": "Regime-Adaptive Dynamic Strategy",
            "description": "Hidden Markov Model regime detection: switches Momentum in Bull Trends to Mean Reversion in Sideways markets, and hedges during high volatility.",
            "category": "Adaptive HMM",
            "rebalance": "Weekly",
            "status": "READY"
        }
    ]
