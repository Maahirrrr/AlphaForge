from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.backtest_service import BacktestService
from app.database.session import SessionLocal
from app.database.models import BacktestRun

router = APIRouter(prefix="/api/backtests", tags=["Backtesting"])
backtest_service = BacktestService()

class BacktestRequest(BaseModel):
    strategy_type: str = "ML_CROSS_SECTIONAL"
    universe: Optional[List[str]] = ["AAPL", "MSFT", "NVDA"]
    initial_capital: float = 1000000.0
    slippage_bps: float = 5.0
    commission_bps: float = 3.0
    rebalance_freq_days: int = 5
    start_date: str = "2021-01-01"

@router.post("/run")
def run_backtest(req: BacktestRequest):
    try:
        return backtest_service.run_backtest(
            strategy_type=req.strategy_type,
            universe=req.universe,
            initial_capital=req.initial_capital,
            slippage_bps=req.slippage_bps,
            commission_bps=req.commission_bps,
            rebalance_freq_days=req.rebalance_freq_days,
            start_date=req.start_date
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/compare")
def compare_strategies():
    return backtest_service.compare_strategies()

@router.get("/{backtest_id}")
def get_backtest(backtest_id: str):
    db = SessionLocal()
    try:
        bt = db.query(BacktestRun).filter(BacktestRun.backtest_id == backtest_id).first()
        if not bt:
            raise HTTPException(status_code=404, detail="Backtest not found")
        return {
            "backtest_id": bt.backtest_id,
            "strategy_name": bt.strategy_name,
            "universe": bt.universe,
            "start_date": bt.start_date,
            "end_date": bt.end_date,
            "initial_capital": bt.initial_capital,
            "final_equity": bt.final_equity,
            "metrics": bt.metrics,
            "equity_curve": bt.equity_curve,
            "trades": bt.trades
        }
    finally:
        db.close()
