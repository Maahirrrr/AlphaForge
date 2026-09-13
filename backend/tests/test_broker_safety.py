import pytest
from app.execution.paper_broker import PaperBroker
from app.execution.live_broker import LiveBrokerAdapter
from app.core.config import settings

def test_paper_broker_isolation():
    broker = PaperBroker(initial_capital=500000.0)
    acc = broker.get_account()
    assert acc["execution_mode"] == "PAPER"
    assert acc["cash"] == 500000.0

    # Place order
    res = broker.place_order(symbol="AAPL", side="BUY", quantity=10, price=150.0)
    assert res["status"] == "FILLED"
    assert res["execution_mode"] == "PAPER"
    assert broker.cash < 500000.0

def test_live_broker_safety_rejection_in_paper_mode():
    """
    CRITICAL: LiveBroker must strictly reject orders if system is in PAPER mode.
    """
    live_broker = LiveBrokerAdapter()
    res = live_broker.place_order(
        symbol="AAPL",
        side="BUY",
        quantity=10,
        price=150.0,
        confirmation_token="DUMMY"
    )
    assert res["status"] == "REJECTED"
    assert "LIVE ORDER BLOCKED" in res["rejection_reason"]
