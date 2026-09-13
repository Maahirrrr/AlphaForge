from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    Text, ForeignKey, UniqueConstraint, Index, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(32), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    exchange = Column(String(32), default="NSE")
    asset_type = Column(String(32), default="EQUITY")
    sector = Column(String(64), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class MarketData(Base):
    __tablename__ = "market_data"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(32), index=True, nullable=False)
    timestamp = Column(DateTime, index=True, nullable=False)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    adjusted_close = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("symbol", "timestamp", name="uq_symbol_timestamp"),
        Index("idx_sym_time", "symbol", "timestamp"),
    )

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    model_type = Column(String(32), nullable=False)  # xgboost, lightgbm, ensemble
    target = Column(String(64), nullable=False)      # forward_return_5d, etc.
    horizon = Column(String(16), nullable=False)     # 1d, 5d, 10d, 20d
    status = Column(String(32), default="RESEARCH")  # RESEARCH, PAPER, LIVE
    features = Column(JSON, nullable=False)
    hyperparameters = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)           # IC, IC_IR, Sharpe, RMSE
    dataset_version = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ModelPrediction(Base):
    __tablename__ = "model_predictions"

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(64), index=True, nullable=False)
    symbol = Column(String(32), index=True, nullable=False)
    timestamp = Column(DateTime, index=True, nullable=False)
    predicted_return = Column(Float, nullable=False)
    predicted_class = Column(Integer, nullable=True)
    rank = Column(Integer, nullable=True)
    shap_drivers = Column(JSON, nullable=True)

class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    description = Column(Text, nullable=True)
    strategy_type = Column(String(64), nullable=False)  # ML_CROSS_SECTIONAL, MOMENTUM, REGIME_ADAPTIVE
    config = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=False)
    execution_mode = Column(String(16), default="PAPER") # PAPER, LIVE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(64), unique=True, index=True, nullable=False)
    client_order_id = Column(String(64), nullable=True)
    strategy_id = Column(String(64), index=True, nullable=True)
    symbol = Column(String(32), index=True, nullable=False)
    side = Column(String(8), nullable=False)       # BUY, SELL
    order_type = Column(String(16), default="MARKET") # MARKET, LIMIT, STOP
    quantity = Column(Float, nullable=False)
    filled_quantity = Column(Float, default=0.0)
    price = Column(Float, nullable=True)
    stop_price = Column(Float, nullable=True)
    status = Column(String(32), default="PENDING") # PENDING, SUBMITTED, FILLED, REJECTED, CANCELLED
    execution_mode = Column(String(16), default="PAPER") # PAPER, LIVE
    broker = Column(String(32), default="PAPER_SIMULATOR")
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Fill(Base):
    __tablename__ = "fills"

    id = Column(Integer, primary_key=True, index=True)
    fill_id = Column(String(64), unique=True, index=True, nullable=False)
    order_id = Column(String(64), ForeignKey("orders.order_id"), nullable=False)
    symbol = Column(String(32), nullable=False)
    side = Column(String(8), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    slippage = Column(Float, default=0.0)
    commission = Column(Float, default=0.0)
    fees = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Position(Base):
    __tablename__ = "positions"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(32), index=True, nullable=False)
    execution_mode = Column(String(16), default="PAPER")
    quantity = Column(Float, default=0.0)
    average_price = Column(Float, default=0.0)
    current_price = Column(Float, default=0.0)
    market_value = Column(Float, default=0.0)
    unrealized_pnl = Column(Float, default=0.0)
    realized_pnl = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("symbol", "execution_mode", name="uq_pos_symbol_mode"),
    )

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True, nullable=False)
    execution_mode = Column(String(16), default="PAPER")
    total_equity = Column(Float, nullable=False)
    cash = Column(Float, nullable=False)
    positions_value = Column(Float, default=0.0)
    daily_pnl = Column(Float, default=0.0)
    daily_pnl_pct = Column(Float, default=0.0)
    total_pnl = Column(Float, default=0.0)
    total_pnl_pct = Column(Float, default=0.0)
    drawdown = Column(Float, default=0.0)
    exposure = Column(Float, default=0.0)

class RiskEvent(Base):
    __tablename__ = "risk_events"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    event_type = Column(String(64), nullable=False) # LIMIT_BREACH, KILL_SWITCH, BLOCKED_ORDER
    order_id = Column(String(64), nullable=True)
    symbol = Column(String(32), nullable=True)
    risk_check = Column(String(64), nullable=False)
    details = Column(JSON, nullable=True)
    action_taken = Column(String(32), nullable=False) # BLOCKED, WARNING, HALTED

class BacktestRun(Base):
    __tablename__ = "backtest_runs"

    id = Column(Integer, primary_key=True, index=True)
    backtest_id = Column(String(64), unique=True, index=True, nullable=False)
    strategy_name = Column(String(128), nullable=False)
    universe = Column(JSON, nullable=False)
    start_date = Column(String(32), nullable=False)
    end_date = Column(String(32), nullable=False)
    initial_capital = Column(Float, nullable=False)
    final_equity = Column(Float, nullable=False)
    metrics = Column(JSON, nullable=False)
    equity_curve = Column(JSON, nullable=True)
    trades = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    event_type = Column(String(64), nullable=False)
    user = Column(String(64), default="SYSTEM")
    details = Column(JSON, nullable=True)
