import pytest
from app.risk.risk_engine import RiskEngine
from app.risk.limits import RiskLimits
from app.risk.kill_switch import kill_switch

@pytest.fixture
def risk_engine():
    limits = RiskLimits(
        max_portfolio_exposure=1.0,
        max_position_weight=0.15,
        max_daily_loss_pct=0.02,
        max_drawdown_pct=0.15,
        max_order_value=200000.0,
        max_open_positions=5
    )
    return RiskEngine(limits=limits)

def test_max_order_value_blocked(risk_engine):
    # Attempt order value > 200,000
    allowed, reason = risk_engine.validate_order(
        symbol="AAPL",
        side="BUY",
        quantity=1000,
        price=250.0, # 250,000 > 200,000 limit
        current_equity=1000000.0,
        current_positions={}
    )
    assert not allowed
    assert "RISK BLOCKED: Order value" in reason

def test_max_position_weight_blocked(risk_engine):
    # Attempt to take position of 180,000 in equity of 1,000,000 (18% > 15% limit)
    allowed, reason = risk_engine.validate_order(
        symbol="AAPL",
        side="BUY",
        quantity=900,
        price=200.0, # 180,000 = 18%
        current_equity=1000000.0,
        current_positions={}
    )
    assert not allowed
    assert "Proposed position weight" in reason

def test_daily_loss_threshold_blocked(risk_engine):
    # If daily loss is 3% (breaching 2% limit)
    allowed, reason = risk_engine.validate_order(
        symbol="AAPL",
        side="BUY",
        quantity=10,
        price=150.0,
        current_equity=1000000.0,
        current_positions={},
        daily_pnl_pct=-0.03
    )
    assert not allowed
    assert "Daily loss threshold breached" in reason
