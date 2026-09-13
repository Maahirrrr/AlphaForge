from typing import Optional, Tuple
import numpy as np

class SlippageModel:
    """
    Realistic execution slippage models:
    1. Fixed basis points (Buys pay higher, Sells receive lower)
    2. Volume-dependent market impact: S = base_bps + gamma * (qty / volume)^alpha
    """

    def __init__(
        self,
        fixed_bps: float = 5.0,
        enable_market_impact: bool = True,
        impact_gamma: float = 0.1,
        impact_alpha: float = 0.5
    ):
        self.fixed_bps = fixed_bps
        self.enable_market_impact = enable_market_impact
        self.impact_gamma = impact_gamma
        self.impact_alpha = impact_alpha

    def calculate_fill_price(
        self,
        market_price: float,
        side: str,
        quantity: float,
        market_volume: Optional[float] = None
    ) -> Tuple[float, float]:
        """
        Calculates execution fill price and slippage amount per share.
        Returns: (execution_price, slippage_per_share)
        """
        if market_price <= 0:
            return market_price, 0.0

        total_bps = self.fixed_bps

        if self.enable_market_impact and market_volume and market_volume > 0:
            participation_rate = quantity / market_volume
            impact_bps = self.impact_gamma * (participation_rate ** self.impact_alpha) * 10000.0
            total_bps += min(impact_bps, 50.0)

        slip_fraction = total_bps / 10000.0
        slip_amount = market_price * slip_fraction

        if side.upper() == "BUY":
            exec_price = market_price + slip_amount
        else:
            exec_price = max(0.01, market_price - slip_amount)

        return round(exec_price, 4), round(slip_amount, 4)
