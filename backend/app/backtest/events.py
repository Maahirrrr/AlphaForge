from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any, Optional

class Event:
    """Base event class in the event-driven trading engine."""
    pass

@dataclass
class MarketEvent(Event):
    timestamp: datetime
    bars: Dict[str, Dict[str, float]] # symbol -> {open, high, low, close, volume}

@dataclass
class SignalEvent(Event):
    timestamp: datetime
    strategy_id: str
    target_weights: Dict[str, float] # symbol -> target portfolio weight

@dataclass
class OrderEvent(Event):
    timestamp: datetime
    order_id: str
    symbol: str
    side: str # "BUY" or "SELL"
    quantity: float
    order_type: str = "MARKET" # "MARKET", "LIMIT", "STOP"
    price: Optional[float] = None
    stop_price: Optional[float] = None
    strategy_id: Optional[str] = None
    execution_mode: str = "PAPER" # "PAPER" or "LIVE"

@dataclass
class FillEvent(Event):
    timestamp: datetime
    fill_id: str
    order_id: str
    symbol: str
    side: str
    quantity: float
    fill_price: float
    slippage: float
    commission: float
    fees: float
    execution_mode: str = "PAPER"

@dataclass
class PortfolioEvent(Event):
    timestamp: datetime
    equity: float
    cash: float
    positions_value: float
    daily_pnl: float
    drawdown: float
