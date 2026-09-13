from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.execution.broker_interface import BrokerInterface
from app.execution.paper_broker import PaperBroker
from app.execution.live_broker import LiveBrokerAdapter
from app.risk.risk_engine import RiskEngine
from app.core.config import settings
from app.core.logging import logger, log_audit_event

class OrderManager:
    """
    Central Order Execution & Reconciliation Manager.
    Directs orders to PaperBroker or LiveBrokerAdapter based on mode.
    Enforces risk checks before any order dispatch.
    """

    def __init__(self, risk_engine: Optional[RiskEngine] = None):
        self.risk_engine = risk_engine or RiskEngine()
        self.paper_broker = PaperBroker()
        self.live_broker = LiveBrokerAdapter()

    def get_broker(self, mode: str = "PAPER") -> BrokerInterface:
        if mode.upper() == "LIVE" and settings.is_live_mode:
            return self.live_broker
        return self.paper_broker

    def submit_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        price: float,
        order_type: str = "MARKET",
        execution_mode: str = "PAPER",
        confirmation_token: str = ""
    ) -> Dict[str, Any]:
        """
        Validates order against RiskEngine and submits to chosen broker implementation.
        """
        broker = self.get_broker(execution_mode)
        account = broker.get_account()
        positions_raw = broker.get_positions()
        positions_map = {
            p["symbol"]: {"quantity": p["quantity"], "market_value": p["market_value"]}
            for p in positions_raw
        }

        # 1. Pre-Trade Risk Engine Validation
        is_allowed, risk_status = self.risk_engine.validate_order(
            symbol=symbol,
            side=side,
            quantity=quantity,
            price=price,
            current_equity=account.get("total_equity", settings.INITIAL_CAPITAL),
            current_positions=positions_map
        )

        if not is_allowed:
            logger.warning(f"Order submission BLOCKED by RiskEngine: {risk_status}")
            return {
                "order_id": f"BLOCKED-{datetime.now(timezone.utc).strftime('%H%M%S')}",
                "symbol": symbol,
                "side": side,
                "quantity": quantity,
                "status": "REJECTED",
                "execution_mode": execution_mode,
                "rejection_reason": risk_status,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

        # 2. Broker Dispatch
        if execution_mode.upper() == "LIVE":
            return self.live_broker.place_order(
                symbol=symbol,
                side=side,
                quantity=quantity,
                order_type=order_type,
                price=price,
                confirmation_token=confirmation_token
            )
        else:
            return self.paper_broker.place_order(
                symbol=symbol,
                side=side,
                quantity=quantity,
                order_type=order_type,
                price=price
            )
