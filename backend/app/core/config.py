import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BACKEND_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
MODELS_DIR = DATA_DIR / "models"
CONFIGS_DIR = PROJECT_ROOT / "configs"

for p in [DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR, CONFIGS_DIR]:
    p.mkdir(parents=True, exist_ok=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core
    APP_NAME: str = "AlphaForge"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "alphaforge-institutional-quant-platform-secret"

    # Execution Mode: PAPER (default) or LIVE
    EXECUTION_MODE: str = "PAPER"
    INITIAL_CAPITAL: float = 1000000.0
    CURRENCY: str = "INR"

    # Database
    DATABASE_URL: str = "sqlite:///./alphaforge.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Risk Limits
    MAX_PORTFOLIO_EXPOSURE: float = 1.0
    MAX_POSITION_WEIGHT: float = 0.15
    MAX_DAILY_LOSS_PCT: float = 0.02
    MAX_DRAWDOWN_PCT: float = 0.15
    MAX_LEVERAGE: float = 1.0
    MAX_ORDER_VALUE: float = 200000.0
    MAX_OPEN_POSITIONS: int = 10

    # Costs & Slippage
    DEFAULT_SLIPPAGE_BPS: float = 5.0
    DEFAULT_COMMISSION_BPS: float = 3.0
    DEFAULT_EXCHANGE_FEE_BPS: float = 0.35
    DEFAULT_TAX_BPS: float = 10.0

    # Broker Configuration (ISOLATED)
    BROKER_TYPE: str = "MOCK_LIVE"
    BROKER_API_KEY: str = ""
    BROKER_API_SECRET: str = ""
    BROKER_ACCESS_TOKEN: str = ""
    BROKER_USER_ID: str = ""
    BROKER_LIVE_CONFIRMED: bool = False

    # Server & CORS
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    FRONTEND_PORT: int = 3000
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            import json
            return json.loads(v)
        return v

    @property
    def is_live_mode(self) -> bool:
        return self.EXECUTION_MODE.upper() == "LIVE" and self.BROKER_LIVE_CONFIRMED


settings = Settings()
