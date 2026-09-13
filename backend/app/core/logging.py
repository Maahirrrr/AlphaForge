import logging
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict
from app.core.config import PROJECT_ROOT

LOGS_DIR = PROJECT_ROOT / "data" / "logs"
LOGS_DIR.mkdir(parents=True, exist_ok=True)
AUDIT_LOG_FILE = LOGS_DIR / "audit_trail.jsonl"

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "props"):
            log_data.update(record.props)
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data)

def setup_logging():
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)

    # Console Handler
    c_handler = logging.StreamHandler(sys.stdout)
    c_handler.setFormatter(JsonFormatter())
    root_logger.handlers = [c_handler]

    # File Handler
    f_handler = logging.FileHandler(LOGS_DIR / "alphaforge.log", encoding="utf-8")
    f_handler.setFormatter(JsonFormatter())
    root_logger.addHandler(f_handler)

def log_audit_event(event_type: str, details: Dict[str, Any], user: str = "SYSTEM"):
    """
    Append-only audit logging for critical operations:
    - Live trading activation
    - Kill switch activation
    - Orders submitted/cancelled
    - Risk blocks
    """
    audit_entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event_type": event_type,
        "user": user,
        "details": details
    }
    with open(AUDIT_LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(audit_entry) + "\n")

    logger = logging.getLogger("alphaforge.audit")
    logger.info(f"AUDIT_EVENT: {event_type}", extra={"props": audit_entry})

setup_logging()
logger = logging.getLogger("alphaforge")
