from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
import pandas as pd
import yfinance as yf
from app.data.providers.base import MarketDataProvider
from app.core.logging import logger

class YahooFinanceProvider(MarketDataProvider):
    """
    Yahoo Finance provider for free historical market research.
    Normalizes timestamps, splits, and columns.
    """

    def get_historical_prices(
        self,
        symbol: str,
        start_date: str,
        end_date: str,
        timeframe: str = "1d"
    ) -> pd.DataFrame:
        try:
            logger.info(f"Fetching historical data from Yahoo Finance for {symbol} ({start_date} to {end_date})")
            ticker = yf.Ticker(symbol)
            df = ticker.history(start=start_date, end=end_date, interval=timeframe, auto_adjust=False)
            
            if df.empty:
                logger.warning(f"No data returned for {symbol} from Yahoo Finance.")
                return pd.DataFrame()

            # Normalize column names
            df.columns = [c.lower().replace(" ", "_") for c in df.columns]
            
            # Map columns
            rename_map = {
                "adj_close": "adjusted_close",
                "adj close": "adjusted_close",
            }
            df.rename(columns=rename_map, inplace=True)
            if "adjusted_close" not in df.columns and "close" in df.columns:
                df["adjusted_close"] = df["close"]

            required = ["open", "high", "low", "close", "adjusted_close", "volume"]
            for col in required:
                if col not in df.columns:
                    df[col] = df["close"] if "close" in df.columns else 0.0

            df = df[required]
            # Ensure timezone is UTC and index is clean datetime
            if df.index.tz is not None:
                df.index = df.index.tz_convert(timezone.utc).tz_localize(None)
            df.index.name = "timestamp"
            return df.sort_index()

        except Exception as e:
            logger.error(f"Error fetching data for {symbol} from Yahoo Finance: {e}")
            return pd.DataFrame()

    def get_latest_quote(self, symbol: str) -> Dict[str, Any]:
        try:
            ticker = yf.Ticker(symbol)
            fast_info = ticker.fast_info
            price = fast_info.last_price if hasattr(fast_info, "last_price") else 0.0
            prev_close = fast_info.previous_close if hasattr(fast_info, "previous_close") else price
            change = price - prev_close
            change_pct = (change / prev_close * 100.0) if prev_close else 0.0

            return {
                "symbol": symbol,
                "price": float(price),
                "change": float(change),
                "change_pct": float(change_pct),
                "volume": float(getattr(fast_info, "last_volume", 0.0) or 0.0),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching quote for {symbol}: {e}")
            return {
                "symbol": symbol,
                "price": 0.0,
                "change": 0.0,
                "change_pct": 0.0,
                "volume": 0.0,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }

    def get_market_calendar(self, start_date: str, end_date: str) -> List[str]:
        # Approximate standard trading days (Mon-Fri)
        dates = pd.date_range(start=start_date, end=end_date, freq="B")
        return [d.strftime("%Y-%m-%d") for d in dates]
