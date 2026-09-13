from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
from app.execution.broker_interface import BrokerInterface
from app.backtest.slippage import SlippageModel
from app.backtest.costs import TransactionCostEngine
from app.core.config import settings
from app.core.logging import logger, log_audit_event

class PaperBroker(BrokerInterface):
    """
    High-fidelity Paper Broker simulating realistic market execution:
    - Dedicated simulated cash balance (default ?10,00,000)
    - Slippage modeling
    - Realistic fee and commission deductions
    - Position tracking & P&L calculation
    - Reset paper account capability
    """

    def __init__(
        self,
        initial_capital: float = settings.INITIAL_CAPITAL,
        slippage_bps: float = settings.DEFAULT_SLIPPAGE_BPS,
        commission_bps: float = settings.DEFAULT_COMMISSION_BPS
    ):
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.positions: Dict[str, Dict[str, float]] = {} # symbol -> {quantity, avg_price, current_price}
        self.orders: List[Dict[str, Any]] = []
        self.fills: List[Dict[str, Any]] = []
        self.slippage_model = SlippageModel(fixed_bps=slippage_bps)
        self.cost_engine = TransactionCostEngine(commission_bps=commission_bps)
        self.is_connected = True

    def connect(self) -> bool:
        self.is_connected = True
        return True

    def reset_account(self, capital: Optional[float] = None) -> Dict[str, Any]:
        """Resets paper account state to clean initial condition."""
        if capital:
            self.initial_capital = capital
        self.cash = self.initial_capital
        self.positions = {}
        self.orders = []
        self.fills = []
        log_audit_event("PAPER_ACCOUNT_RESET", {"initial_capital": self.initial_capital})
        logger.info(f"Paper account reset with capital {self.initial_capital:,.2f}")
        return self.get_account()

    def update_market_price(self, symbol: str, price: float):
        """Updates internal mark-to-market pricing."""
        if symbol in self.positions:
            self.positions[symbol]["current_price"] = price

    def get_account(self) -> Dict[str, Any]:
        positions_val = sum(
            p["quantity"] * p["current_price"] for p in self.positions.values()
        )
        total_equity = self.cash + positions_val
        unrealized_pnl = sum(
            (p["current_price"] - p["avg_price"]) * p["quantity"] for p in self.positions.values()
        )

        return {
            "broker": "PAPER_SIMULATOR",
            "execution_mode": "PAPER",
            "currency": settings.CURRENCY,
            "cash": round(self.cash, 2),
            "positions_value": round(positions_val, 2),
            "total_equity": round(total_equity, 2),
            "unrealized_pnl": round(unrealized_pnl, 2),
            "total_pnl": round(total_equity - self.initial_capital, 2),
            "total_pnl_pct": round((total_equity - self.initial_capital) / self.initial_capital * 100.0, 2),
            "positions_count": len([p for p in self.positions.values() if p["quantity"] != 0])
        }

    def get_positions(self) -> List[Dict[str, Any]]:
        pos_list = []
        for sym, p in self.positions.items():
            if p["quantity"] != 0:
                mkt_val = p["quantity"] * p["current_price"]
                unrealized = (p["current_price"] - p["avg_price"]) * p["quantity"]
                pnl_pct = ((p["current_price"] - p["avg_price"]) / p["avg_price"] * 100.0) if p["avg_price"] else 0.0
                pos_list.append({
                    "symbol": sym,
                    "quantity": p["quantity"],
                    "avg_price": round(p["avg_price"], 2),
                    "current_price": round(p["current_price"], 2),
                    "market_value": round(mkt_val, 2),
                    "unrealized_pnl": round(unrealized, 2),
                    "unrealized_pnl_pct": round(pnl_pct, 2)
                })
        return pos_list

    def get_orders(self) -> List[Dict[str, Any]]:
        return list(reversed(self.orders[-100:]))

    def get_quote(self, symbol: str) -> Dict[str, Any]:
        curr = self.positions.get(symbol, {}).get("current_price", 100.0)
        return {
            "symbol": symbol,
            "price": curr,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def place_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        order_type: str = "MARKET",
        price: Optional[float] = None,
        stop_price: Optional[float] = None
    ) -> Dict[str, Any]:
        order_id = f"PAPER-ORD-{uuid.uuid4().hex[:8].upper()}"
        mkt_price = price or self.positions.get(symbol, {}).get("current_price", 100.0)

        # Apply realistic slippage
        exec_price, slippage = self.slippage_model.calculate_fill_price(mkt_price, side, quantity)
        notional = quantity * exec_price
        costs = self.cost_engine.calculate_costs(notional, side)

        # Cash check for BUY orders
        if side.upper() == "BUY" and (notional + costs["total_costs"]) > self.cash:
            rejected_order = {
                "order_id": order_id,
                "symbol": symbol,
                "side": side.upper(),
                "quantity": quantity,
                "status": "REJECTED",
                "execution_mode": "PAPER",
                "rejection_reason": f"Insufficient paper cash: required {notional + costs['total_costs']:,.2f}, available {self.cash:,.2f}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            self.orders.append(rejected_order)
            return rejected_order

        # Execute simulated fill
        fill_id = f"FILL-{uuid.uuid4().hex[:8].upper()}"
        if side.upper() == "BUY":
            self.cash -= (notional + costs["total_costs"])
            pos = self.positions.get(symbol, {"quantity": 0.0, "avg_price": 0.0, "current_price": exec_price})
            new_qty = pos["quantity"] + quantity
            new_avg = ((pos["quantity"] * pos["avg_price"]) + notional) / new_qty if new_qty > 0 else exec_price
            self.positions[symbol] = {"quantity": new_qty, "avg_price": new_avg, "current_price": exec_price}
        else:
            self.cash += (notional - costs["total_costs"])
            pos = self.positions.get(symbol, {"quantity": 0.0, "avg_price": exec_price, "current_price": exec_price})
            new_qty = max(0.0, pos["quantity"] - quantity)
            self.positions[symbol] = {"quantity": new_qty, "avg_price": pos["avg_price"], "current_price": exec_price}

        fill_record = {
            "fill_id": fill_id,
            "order_id": order_id,
            "symbol": symbol,
            "side": side.upper(),
            "quantity": quantity,
            "price": exec_price,
            "slippage": slippage,
            "commission": costs["commission"],
            "fees": costs["exchange_fee"] + costs["taxes"],
            "execution_mode": "PAPER",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.fills.append(fill_record)

        filled_order = {
            "order_id": order_id,
            "symbol": symbol,
            "side": side.upper(),
            "quantity": quantity,
            "price": exec_price,
            "status": "FILLED",
            "execution_mode": "PAPER",
            "fill": fill_record,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        self.orders.append(filled_order)
        logger.info(f"[PAPER] Filled {side} {quantity} {symbol} @ {exec_price:.2f} (fees: {costs['total_costs']:.2f})")
        return filled_order

    def cancel_order(self, order_id: str) -> bool:
        for ord_rec in self.orders:
            if ord_rec["order_id"] == order_id and ord_rec["status"] == "PENDING":
                ord_rec["status"] = "CANCELLED"
                return True
        return False
