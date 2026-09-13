from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from app.execution.order_manager import OrderManager
from app.risk.kill_switch import kill_switch
from app.risk.risk_engine import RiskEngine
from app.core.config import settings
from app.core.security import generate_confirmation_token, verify_live_mode_authorization
from app.core.logging import logger, log_audit_event

class TradingService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TradingService, cls).__new__(cls)
            cls._instance.order_manager = OrderManager()
        return cls._instance

    def get_portfolio_status(self, mode: str = "PAPER") -> Dict[str, Any]:
        broker = self.order_manager.get_broker(mode)
        account = broker.get_account()
        positions = broker.get_positions()
        orders = broker.get_orders()

        return {
            "account": account,
            "positions": positions,
            "orders": orders[:50],
            "execution_mode": mode,
            "kill_switch": kill_switch.get_status()
        }

    def place_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        price: float,
        order_type: str = "MARKET",
        mode: str = "PAPER",
        confirmation_token: str = ""
    ) -> Dict[str, Any]:
        return self.order_manager.submit_order(
            symbol=symbol,
            side=side,
            quantity=quantity,
            price=price,
            order_type=order_type,
            execution_mode=mode,
            confirmation_token=confirmation_token
        )

    def trigger_kill_switch(self, reason: str = "Manual Trigger", user: str = "USER") -> Dict[str, Any]:
        return kill_switch.activate(reason, user)

    def reset_kill_switch(self, token: str, user: str = "USER") -> Dict[str, Any]:
        return kill_switch.reset(token, user)

    def reset_paper_account(self, capital: Optional[float] = None) -> Dict[str, Any]:
        return self.order_manager.paper_broker.reset_account(capital)

    def request_live_activation_token(self) -> Dict[str, str]:
        token = generate_confirmation_token("ACTIVATE_LIVE_TRADING")
        return {"token": token, "expires_in_seconds": "300"}
