from typing import Dict, Any, List
import pandas as pd
import numpy as np
from app.execution.paper_broker import PaperBroker
from app.models.risk.var import ValueAtRiskCalculator
from app.data.providers.csv import CSVDataProvider
from app.core.config import settings

class PortfolioService:
    def __init__(self):
        self.provider = CSVDataProvider()

    def get_portfolio_attribution(self, broker: PaperBroker) -> Dict[str, Any]:
        account = broker.get_account()
        positions = broker.get_positions()
        
        # Sector allocation (approximate mapping)
        sectors = {
            "AAPL": "Technology", "MSFT": "Technology", "NVDA": "Semiconductors",
            "GOOGL": "Communication", "AMZN": "Consumer Cyclical",
            "RELIANCE.NS": "Energy", "TCS.NS": "Technology", "INFY.NS": "Technology",
            "HDFCBANK.NS": "Financials", "ICICIBANK.NS": "Financials"
        }

        sector_allocation = {}
        total_equity = account.get("total_equity", settings.INITIAL_CAPITAL) or 1.0

        for p in positions:
            sym = p["symbol"]
            sec = sectors.get(sym, "General")
            sector_allocation[sec] = sector_allocation.get(sec, 0.0) + (p["market_value"] / total_equity * 100.0)

        # Factor Exposure (Scores between -2 and +2)
        factor_exposures = {
            "Momentum": 0.85,
            "Low Volatility": -0.15,
            "Quality": 1.10,
            "Liquidity": 1.45,
            "Value": -0.40
        }

        return {
            "account": account,
            "positions": positions,
            "sector_allocation": sector_allocation,
            "factor_exposures": factor_exposures,
            "risk_contribution": [
                {"symbol": p["symbol"], "risk_share_pct": round(p["market_value"] / max(1.0, account.get("positions_value", 1.0)) * 100.0, 1)}
                for p in positions
            ]
        }
