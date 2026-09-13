from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime
import pandas as pd

class MarketDataProvider(ABC):
    """
    Abstract interface for market data acquisition.
    Ensures seamless pluggability between Yahoo Finance, CSV, and Live Broker feeds.
    """

    @abstractmethod
    def get_historical_prices(
        self,
        symbol: str,
        start_date: str,
        end_date: str,
        timeframe: str = "1d"
    ) -> pd.DataFrame:
        """
        Fetch historical bars. Must return normalized DataFrame with columns:
        [open, high, low, close, adjusted_close, volume] and UTC DatetimeIndex.
        """
        pass

    @abstractmethod
    def get_latest_quote(self, symbol: str) -> Dict[str, Any]:
        """Fetch latest real-time or delayed quote."""
        pass

    @abstractmethod
    def get_market_calendar(self, start_date: str, end_date: str) -> List[str]:
        """Fetch list of active trading sessions between start and end dates."""
        pass
