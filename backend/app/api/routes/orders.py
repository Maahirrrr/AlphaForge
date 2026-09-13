from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.trading_service import TradingService

router = APIRouter(prefix="/api/orders", tags=["Orders"])
trading_service = TradingService()

class OrderSubmitRequest(BaseModel):
    symbol: str
    side: str # BUY / SELL
    quantity: float
    price: float
    order_type: str = "MARKET"
    mode: str = "PAPER" # PAPER / LIVE
    confirmation_token: Optional[str] = ""

@router.get("")
def get_orders(mode: str = "PAPER"):
    status = trading_service.get_portfolio_status(mode=mode)
    return status.get("orders", [])

@router.post("/paper")
def submit_paper_order(req: OrderSubmitRequest):
    req.mode = "PAPER"
    return trading_service.place_order(
        symbol=req.symbol,
        side=req.side,
        quantity=req.quantity,
        price=req.price,
        order_type=req.order_type,
        mode="PAPER"
    )

@router.post("/live")
def submit_live_order(req: OrderSubmitRequest):
    req.mode = "LIVE"
    return trading_service.place_order(
        symbol=req.symbol,
        side=req.side,
        quantity=req.quantity,
        price=req.price,
        order_type=req.order_type,
        mode="LIVE",
        confirmation_token=req.confirmation_token or ""
    )
