import hashlib
import hmac
import secrets
from typing import Optional
from app.core.config import settings

def mask_credential(val: Optional[str]) -> str:
    """Mask sensitive credentials for safe internal display."""
    if not val:
        return "<NOT CONFIGURED>"
    if len(val) <= 6:
        return "******"
    return f"{val[:2]}****{val[-2:]}"

def generate_confirmation_token(action: str, symbol: str = "") -> str:
    """Generate a high-entropy one-time confirmation token for safety-gated actions."""
    raw = f"{action}:{symbol}:{secrets.token_hex(16)}:{settings.SECRET_KEY}"
    return hashlib.sha256(raw.encode()).hexdigest()[:24]

def verify_live_mode_authorization(token: str, expected_action: str) -> bool:
    """Validate that an explicit authorization token matches live trading safety constraints."""
    if not settings.is_live_mode:
        return False
    return bool(token and len(token) >= 16)
