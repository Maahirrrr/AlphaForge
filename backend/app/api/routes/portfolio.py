from fastapi import APIRouter
from typing import Optional
from app.services.trading_service import TradingService
from app.services.portfolio_service import PortfolioService

router = APIRouter(prefix="/api/portfolio", tags=["Portfolio"])
trading_service = TradingService()
portfolio_service = PortfolioService()

@router.get("/summary")
def get_portfolio_summary(mode: str = "PAPER"):
    return trading_service.get_portfolio_status(mode=mode)

@router.get("/attribution")
def get_attribution(mode: str = "PAPER"):
    broker = trading_service.order_manager.get_broker(mode)
    return portfolio_service.get_portfolio_attribution(broker)

@router.post("/reset")
def reset_portfolio(capital: Optional[float] = None):
    return trading_service.reset_paper_account(capital)
