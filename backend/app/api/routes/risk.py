from fastapi import APIRouter
from pydantic import BaseModel
from app.services.trading_service import TradingService
from app.risk.kill_switch import kill_switch
from app.risk.limits import RiskLimits

router = APIRouter(prefix="/api/risk", tags=["Risk Management"])
trading_service = TradingService()

class KillSwitchTrigger(BaseModel):
    reason: str = "Manual emergency halt"

class KillSwitchReset(BaseModel):
    token: str

@router.get("/status")
def get_risk_status():
    return {
        "kill_switch": kill_switch.get_status(),
        "limits": trading_service.order_manager.risk_engine.limits.model_dump()
    }

@router.post("/kill-switch")
def trigger_kill_switch(req: KillSwitchTrigger):
    return trading_service.trigger_kill_switch(reason=req.reason)

@router.post("/kill-switch/reset")
def reset_kill_switch(req: KillSwitchReset):
    return trading_service.reset_kill_switch(token=req.token)
