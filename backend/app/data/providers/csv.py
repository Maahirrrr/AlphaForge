from pathlib import Path
from typing import List, Dict, Any
import pandas as pd
from app.data.providers.base import MarketDataProvider
from app.core.config import RAW_DATA_DIR
from app.core.logging import logger

class CSVDataProvider(MarketDataProvider):
    """
    Offline CSV market data provider for guaranteed reproducibility and testing.
    """
    def __init__(self, directory: Path = RAW_DATA_DIR):
        self.directory = directory

    def get_historical_prices(
        self,
        symbol: str,
        start_date: str,
        end_date: str,
        timeframe: str = "1d"
    ) -> pd.DataFrame:
        clean_symbol = symbol.replace(".", "_").replace("^", "")
        file_path = self.directory / f"{clean_symbol}.csv"
        if not file_path.exists():
            logger.warning(f"CSV file not found: {file_path}")
            return pd.DataFrame()

        df = pd.read_csv(file_path, parse_dates=["timestamp"])
        df.set_index("timestamp", inplace=True)
        df.sort_index(inplace=True)

        if start_date:
            df = df[df.index >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df.index <= pd.to_datetime(end_date)]

        return df

    def get_latest_quote(self, symbol: str) -> Dict[str, Any]:
        clean_symbol = symbol.replace(".", "_").replace("^", "")
        file_path = self.directory / f"{clean_symbol}.csv"
        if not file_path.exists():
            return {"symbol": symbol, "price": 0.0, "timestamp": ""}
        df = pd.read_csv(file_path, parse_dates=["timestamp"]).set_index("timestamp")
        last_row = df.iloc[-1]
        prev_row = df.iloc[-2] if len(df) > 1 else last_row
        change = float(last_row["close"] - prev_row["close"])
        pct = (change / float(prev_row["close"]) * 100.0) if prev_row["close"] else 0.0

        return {
            "symbol": symbol,
            "price": float(last_row["close"]),
            "change": change,
            "change_pct": pct,
            "volume": float(last_row["volume"]),
            "timestamp": str(df.index[-1])
        }

    def get_market_calendar(self, start_date: str, end_date: str) -> List[str]:
        dates = pd.date_range(start=start_date, end=end_date, freq="B")
        return [d.strftime("%Y-%m-%d") for d in dates]
