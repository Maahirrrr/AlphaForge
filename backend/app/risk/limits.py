from pydantic import BaseModel

class RiskLimits(BaseModel):
    max_portfolio_exposure: float = 1.0     # 100% net exposure
    max_position_weight: float = 0.15       # Max 15% in any single symbol
    max_daily_loss_pct: float = 0.02        # 2% daily loss halts trading
    max_drawdown_pct: float = 0.15          # 15% peak-to-trough drawdown halt
    max_leverage: float = 1.0               # No unhedged leverage
    max_order_value: float = 200000.0       # Max single order notional
    max_open_positions: int = 10            # Max concurrent positions
