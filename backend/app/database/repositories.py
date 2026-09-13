from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.models import (
    Asset, MarketData, ModelRegistry, ModelPrediction,
    Strategy, Order, Fill, Position, PortfolioSnapshot,
    RiskEvent, BacktestRun, AuditLog
)

class MarketDataRepository:
    def __init__(self, db: Session):
        self.db = db

    def upsert_bars(self, bars: List[Dict[str, Any]]) -> int:
        count = 0
        for bar in bars:
            existing = self.db.query(MarketData).filter(
                MarketData.symbol == bar["symbol"],
                MarketData.timestamp == bar["timestamp"]
            ).first()
            if existing:
                for k, v in bar.items():
                    setattr(existing, k, v)
            else:
                record = MarketData(**bar)
                self.db.add(record)
            count += 1
        self.db.commit()
        return count

    def get_price_df(self, symbol: str, start: Optional[datetime] = None, end: Optional[datetime] = None) -> pd.DataFrame:
        query = self.db.query(MarketData).filter(MarketData.symbol == symbol)
        if start:
            query = query.filter(MarketData.timestamp >= start)
        if end:
            query = query.filter(MarketData.timestamp <= end)
        query = query.order_by(MarketData.timestamp.asc())
        
        results = query.all()
        if not results:
            return pd.DataFrame()
        
        data = [{
            "timestamp": r.timestamp,
            "open": r.open,
            "high": r.high,
            "low": r.low,
            "close": r.close,
            "adjusted_close": r.adjusted_close,
            "volume": r.volume
        } for r in results]
        df = pd.DataFrame(data)
        df.set_index("timestamp", inplace=True)
        return df

class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, order_dict: Dict[str, Any]) -> Order:
        order = Order(**order_dict)
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_order_status(self, order_id: str, status: str, filled_qty: float = 0.0, reason: Optional[str] = None) -> Optional[Order]:
        order = self.db.query(Order).filter(Order.order_id == order_id).first()
        if order:
            order.status = status
            if filled_qty > 0:
                order.filled_quantity = filled_qty
            if reason:
                order.rejection_reason = reason
            order.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(order)
        return order

    def get_orders(self, execution_mode: Optional[str] = None, limit: int = 100) -> List[Order]:
        q = self.db.query(Order)
        if execution_mode:
            q = q.filter(Order.execution_mode == execution_mode)
        return q.order_by(desc(Order.created_at)).limit(limit).all()

class PortfolioRepository:
    def __init__(self, db: Session):
        self.db = db

    def update_position(self, symbol: str, mode: str, qty: float, avg_price: float, current_price: float, realized_pnl: float = 0.0) -> Position:
        pos = self.db.query(Position).filter(
            Position.symbol == symbol,
            Position.execution_mode == mode
        ).first()
        market_val = qty * current_price
        unrealized = (current_price - avg_price) * qty if qty > 0 else 0.0
        
        if pos:
            pos.quantity = qty
            pos.average_price = avg_price
            pos.current_price = current_price
            pos.market_value = market_val
            pos.unrealized_pnl = unrealized
            pos.realized_pnl += realized_pnl
            pos.updated_at = datetime.now(timezone.utc)
        else:
            pos = Position(
                symbol=symbol,
                execution_mode=mode,
                quantity=qty,
                average_price=avg_price,
                current_price=current_price,
                market_value=market_val,
                unrealized_pnl=unrealized,
                realized_pnl=realized_pnl
            )
            self.db.add(pos)
        self.db.commit()
        self.db.refresh(pos)
        return pos

    def get_positions(self, mode: str = "PAPER") -> List[Position]:
        return self.db.query(Position).filter(
            Position.execution_mode == mode,
            Position.quantity != 0.0
        ).all()

    def add_snapshot(self, snapshot_dict: Dict[str, Any]) -> PortfolioSnapshot:
        snap = PortfolioSnapshot(**snapshot_dict)
        self.db.add(snap)
        self.db.commit()
        self.db.refresh(snap)
        return snap

    def get_latest_snapshot(self, mode: str = "PAPER") -> Optional[PortfolioSnapshot]:
        return self.db.query(PortfolioSnapshot).filter(
            PortfolioSnapshot.execution_mode == mode
        ).order_by(desc(PortfolioSnapshot.timestamp)).first()
