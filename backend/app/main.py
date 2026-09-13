from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.database.session import init_db

# Import Routers
from app.api.routes.market import router as market_router
from app.api.routes.research import router as research_router
from app.api.routes.backtests import router as backtest_router
from app.api.routes.strategies import router as strategies_router
from app.api.routes.portfolio import router as portfolio_router
from app.api.routes.orders import router as orders_router
from app.api.routes.risk import router as risk_router
from app.api.routes.broker import router as broker_router
from app.api.routes.regime import router as regime_router
from app.api.routes.models import router as models_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION} in {settings.EXECUTION_MODE} mode.")
    init_db()
    yield
    logger.info(f"Shutting down {settings.APP_NAME}.")

app = FastAPI(
    title=f"{settings.APP_NAME} - Quantitative Trading & Research Platform",
    version=settings.APP_VERSION,
    description="Institutional-grade systematic research, ML alpha generation, event-driven backtesting, and paper/live trading platform.",
    lifespan=lifespan
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(market_router)
app.include_router(research_router)
app.include_router(backtest_router)
app.include_router(strategies_router)
app.include_router(portfolio_router)
app.include_router(orders_router)
app.include_router(risk_router)
app.include_router(broker_router)
app.include_router(regime_router)
app.include_router(models_router)

@app.get("/")
def root():
    return {
        "platform": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "mode": settings.EXECUTION_MODE,
        "status": "ONLINE",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "mode": settings.EXECUTION_MODE,
        "currency": settings.CURRENCY,
        "initial_capital": settings.INITIAL_CAPITAL,
        "database": "CONNECTED",
        "live_trading_enabled": settings.is_live_mode
    }
