from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.core.logging import logger, log_audit_event

class KillSwitchManager:
    """
    Global emergency kill switch.
    When activated:
    - Halts strategy loops immediately
    - Cancels open unfulfilled orders
    - Blocks any incoming order submissions
    - Records append-only audit trail
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(KillSwitchManager, cls).__new__(cls)
            cls._instance.is_active = False
            cls._instance.activated_at = None
            cls._instance.reason = ""
            cls._instance.activated_by = ""
        return cls._instance

    def activate(self, reason: str = "Manual Emergency Trigger", user: str = "USER") -> Dict[str, Any]:
        self.is_active = True
        self.activated_at = datetime.now(timezone.utc).isoformat()
        self.reason = reason
        self.activated_by = user

        log_audit_event(
            event_type="KILL_SWITCH_ACTIVATED",
            details={"reason": reason, "user": user, "timestamp": self.activated_at},
            user=user
        )
        logger.critical(f"EMERGENCY KILL SWITCH ACTIVATED! Reason: {reason} by {user}")
        return self.get_status()

    def reset(self, confirmation_token: str, user: str = "USER") -> Dict[str, Any]:
        if not confirmation_token or len(confirmation_token) < 8:
            raise ValueError("Valid confirmation token required to reset emergency kill switch.")

        self.is_active = False
        reset_time = datetime.now(timezone.utc).isoformat()
        log_audit_event(
            event_type="KILL_SWITCH_RESET",
            details={"user": user, "reset_at": reset_time},
            user=user
        )
        logger.info(f"Kill switch reset successfully by {user}.")
        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        return {
            "kill_switch_active": self.is_active,
            "status": "HALTED" if self.is_active else "NORMAL",
            "activated_at": self.activated_at,
            "reason": self.reason,
            "activated_by": self.activated_by
        }

kill_switch = KillSwitchManager()
