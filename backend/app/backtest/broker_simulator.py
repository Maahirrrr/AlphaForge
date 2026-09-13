from typing import Dict, Any, List, Optional
from datetime import datetime
from app.backtest.events import OrderEvent, FillEvent
from app.backtest.slippage import SlippageModel
from app.backtest.costs import TransactionCostEngine

class SimulatedBroker:
    """
    In-memory simulated broker for event-driven backtesting.
    Processes OrderEvents and generates FillEvents with configurable slippage & transaction costs.
    """

    def __init__(
        self,
        initial_capital: float = 1000000.0,
        slippage_bps: float = 5.0,
        commission_bps: float = 3.0,
        tax_bps: float = 10.0
    ):
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.positions: Dict[str, float] = {}      # symbol -> quantity
        self.cost_basis: Dict[str, float] = {}     # symbol -> avg price
        self.current_prices: Dict[str, float] = {} # symbol -> latest mark price
        self.slippage_model = SlippageModel(fixed_bps=slippage_bps)
        self.cost_engine = TransactionCostEngine(commission_bps=commission_bps, tax_bps=tax_bps)
        self.trade_history: List[Dict[str, Any]] = []

    def update_market_price(self, symbol: str, price: float):
        self.current_prices[symbol] = price

    def get_equity(self) -> float:
        pos_value = sum(
            qty * self.current_prices.get(sym, self.cost_basis.get(sym, 0.0))
            for sym, qty in self.positions.items()
        )
        return self.cash + pos_value

    def execute_order(self, order: OrderEvent, market_volume: Optional[float] = None) -> Optional[FillEvent]:
        price = order.price or self.current_prices.get(order.symbol, 100.0)
        exec_price, slippage = self.slippage_model.calculate_fill_price(
            market_price=price,
            side=order.side,
            quantity=order.quantity,
            market_volume=market_volume
        )
        notional = order.quantity * exec_price
        costs = self.cost_engine.calculate_costs(notional, order.side)

        fill_id = f"BT-FILL-{len(self.trade_history) + 1}"
        curr_qty = self.positions.get(order.symbol, 0.0)
        curr_basis = self.cost_basis.get(order.symbol, 0.0)

        trade_pnl = 0.0
        if order.side.upper() == "BUY":
            total_outflow = notional + costs["total_costs"]
            if total_outflow > self.cash:
                # Adjust quantity to available cash
                adj_qty = max(0.0, (self.cash - costs["total_costs"]) / exec_price)
                if adj_qty <= 0:
                    return None
                order.quantity = adj_qty
                notional = adj_qty * exec_price
                costs = self.cost_engine.calculate_costs(notional, order.side)

            self.cash -= (notional + costs["total_costs"])
            new_qty = curr_qty + order.quantity
            new_basis = ((curr_qty * curr_basis) + notional) / new_qty if new_qty > 0 else exec_price
            self.positions[order.symbol] = new_qty
            self.cost_basis[order.symbol] = new_basis
        else: # SELL
            sell_qty = min(order.quantity, curr_qty)
            if sell_qty <= 0:
                return None
            order.quantity = sell_qty
            notional = sell_qty * exec_price
            costs = self.cost_engine.calculate_costs(notional, order.side)

            self.cash += (notional - costs["total_costs"])
            trade_pnl = (exec_price - curr_basis) * sell_qty - costs["total_costs"]
            new_qty = curr_qty - sell_qty
            self.positions[order.symbol] = new_qty
            if new_qty == 0:
                self.cost_basis[order.symbol] = 0.0

        trade_record = {
            "timestamp": str(order.timestamp)[:10],
            "symbol": order.symbol,
            "side": order.side.upper(),
            "quantity": round(order.quantity, 2),
            "price": round(exec_price, 2),
            "notional": round(notional, 2),
            "slippage": round(slippage, 4),
            "commission": costs["commission"],
            "fees": costs["exchange_fee"] + costs["taxes"],
            "pnl": round(trade_pnl, 2)
        }
        self.trade_history.append(trade_record)

        return FillEvent(
            timestamp=order.timestamp,
            fill_id=fill_id,
            order_id=order.order_id,
            symbol=order.symbol,
            side=order.side.upper(),
            quantity=order.quantity,
            fill_price=exec_price,
            slippage=slippage,
            commission=costs["commission"],
            fees=costs["exchange_fee"] + costs["taxes"]
        )
