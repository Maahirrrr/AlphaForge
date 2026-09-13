from typing import Dict, Any, Tuple, Optional
from app.risk.limits import RiskLimits
from app.risk.kill_switch import kill_switch
from app.core.logging import logger, log_audit_event

class RiskEngine:
    """
    Institutional pre-trade risk validation engine.
    Every proposed order must pass through `validate_order()` before reaching any broker.
    """

    def __init__(self, limits: Optional[RiskLimits] = None):
        self.limits = limits or RiskLimits()

    def validate_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        price: float,
        current_equity: float,
        current_positions: Dict[str, Dict[str, float]], # sym -> {quantity, market_value}
        daily_pnl_pct: float = 0.0,
        current_drawdown_pct: float = 0.0
    ) -> Tuple[bool, str]:
        """
        Validates an order against all configured risk gates.
        Returns: (is_allowed, reason_or_status)
        """
        # 1. Kill Switch Check
        if kill_switch.is_active:
            reason = f"ORDER REJECTED: Global Kill Switch is ACTIVE ({kill_switch.reason})."
            logger.warning(reason)
            return False, reason

        order_value = abs(quantity * price)

        # 2. Maximum Order Value Check
        if order_value > self.limits.max_order_value:
            reason = (
                f"RISK BLOCKED: Order value {order_value:,.2f} exceeds "
                f"maximum allowable single order limit of {self.limits.max_order_value:,.2f}."
            )
            log_audit_event("RISK_BLOCKED", {"symbol": symbol, "reason": reason, "order_value": order_value})
            return False, reason

        # 3. Daily Loss Limit Check
        if daily_pnl_pct <= -self.limits.max_daily_loss_pct:
            reason = (
                f"RISK BLOCKED: Daily loss threshold breached ({daily_pnl_pct:.2%} <= "
                f"-{self.limits.max_daily_loss_pct:.2%}). Trading halted for the session."
            )
            log_audit_event("RISK_BLOCKED", {"symbol": symbol, "reason": reason, "daily_pnl_pct": daily_pnl_pct})
            return False, reason

        # 4. Maximum Drawdown Check
        if current_drawdown_pct >= self.limits.max_drawdown_pct:
            reason = (
                f"RISK BLOCKED: Maximum portfolio drawdown breached ({current_drawdown_pct:.2%} >= "
                f"{self.limits.max_drawdown_pct:.2%})."
            )
            log_audit_event("RISK_BLOCKED", {"symbol": symbol, "reason": reason, "drawdown": current_drawdown_pct})
            return False, reason

        # 5. Position Sizing & Concentration Check
        if current_equity > 0:
            existing_pos_val = current_positions.get(symbol, {}).get("market_value", 0.0)
            new_pos_val = existing_pos_val + (order_value if side.upper() == "BUY" else -order_value)
            new_weight = abs(new_pos_val) / current_equity

            if side.upper() == "BUY" and new_weight > self.limits.max_position_weight:
                reason = (
                    f"RISK BLOCKED: Proposed position weight {new_weight:.2%} exceeds "
                    f"single-asset limit of {self.limits.max_position_weight:.2%}."
                )
                log_audit_event("RISK_BLOCKED", {"symbol": symbol, "reason": reason, "weight": new_weight})
                return False, reason

        # 6. Maximum Open Positions Count Check
        if side.upper() == "BUY" and symbol not in current_positions:
            active_count = len([s for s, p in current_positions.items() if p.get("quantity", 0) != 0])
            if active_count >= self.limits.max_open_positions:
                reason = (
                    f"RISK BLOCKED: Maximum open positions limit ({self.limits.max_open_positions}) reached."
                )
                log_audit_event("RISK_BLOCKED", {"symbol": symbol, "reason": reason})
                return False, reason

        # 7. Total Portfolio Exposure Check
        if current_equity > 0:
            current_total_pos = sum(abs(p.get("market_value", 0.0)) for p in current_positions.values())
            projected_pos = current_total_pos + (order_value if side.upper() == "BUY" else -order_value)
            projected_exposure = projected_pos / current_equity
            if side.upper() == "BUY" and projected_exposure > self.limits.max_portfolio_exposure:
                reason = (
                    f"RISK BLOCKED: Projected gross exposure {projected_exposure:.2%} exceeds "
                    f"limit of {self.limits.max_portfolio_exposure:.2%}."
                )
                log_audit_event("RISK_BLOCKED", {"symbol": symbol, "reason": reason})
                return False, reason

        return True, "RISK_PASSED"
