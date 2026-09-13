import pytest
from app.risk.kill_switch import kill_switch
from app.risk.risk_engine import RiskEngine

def test_kill_switch_lifecycle():
    engine = RiskEngine()
    kill_switch.is_active = False

    # 1. Normal state allows valid order
    allowed, _ = engine.validate_order(
        symbol="AAPL", side="BUY", quantity=10, price=100.0,
        current_equity=1000000.0, current_positions={}
    )
    assert allowed

    # 2. Activate emergency kill switch
    kill_switch.activate(reason="Test Emergency")
    assert kill_switch.is_active

    # 3. Subsequent orders MUST be blocked
    allowed, reason = engine.validate_order(
        symbol="AAPL", side="BUY", quantity=10, price=100.0,
        current_equity=1000000.0, current_positions={}
    )
    assert not allowed
    assert "Kill Switch is ACTIVE" in reason

    # 4. Reset kill switch with token
    kill_switch.reset(confirmation_token="VALID-RESET-TOKEN-123")
    assert not kill_switch.is_active
