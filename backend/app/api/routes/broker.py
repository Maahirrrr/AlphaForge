from fastapi import APIRouter
from app.core.config import settings
from app.core.security import mask_credential
from app.services.trading_service import TradingService

router = APIRouter(prefix="/api/broker", tags=["Broker Integration"])
trading_service = TradingService()

@router.get("/status")
def get_broker_status():
    is_live = settings.is_live_mode
    return {
        "execution_mode": settings.EXECUTION_MODE,
        "is_live_enabled": is_live,
        "broker_type": settings.BROKER_TYPE,
        "api_key_configured": bool(settings.BROKER_API_KEY),
        "api_key_masked": mask_credential(settings.BROKER_API_KEY),
        "live_confirmed_flag": settings.BROKER_LIVE_CONFIRMED,
        "warning": "PAPER TRADING IS ACTIVE. Live mode requires explicit dual confirmation and broker credentials."
    }

@router.post("/request-live-token")
def request_token():
    return trading_service.request_live_activation_token()
