from typing import List, Dict, Any
import pandas as pd
from app.data.providers.base import MarketDataProvider

class BrokerMarketDataProvider(MarketDataProvider):
    """
    Adapter bridging BrokerInterface quotes into MarketDataProvider pipeline.
    """
    def __init__(self, broker_interface):
        self.broker = broker_interface

    def get_historical_prices(self, symbol: str, start_date: str, end_date: str, timeframe: str = "1d") -> pd.DataFrame:
        # Pass-through to broker historical candle API if supported
        return pd.DataFrame()

    def get_latest_quote(self, symbol: str) -> Dict[str, Any]:
        return self.broker.get_quote(symbol)

    def get_market_calendar(self, start_date: str, end_date: str) -> List[str]:
        dates = pd.date_range(start=start_date, end=end_date, freq="B")
        return [d.strftime("%Y-%m-%d") for d in dates]
