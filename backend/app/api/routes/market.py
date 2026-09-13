from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.data.providers.csv import CSVDataProvider
from app.data.providers.yahoo import YahooFinanceProvider
from app.data.ingestion import ingest_universe, DEFAULT_UNIVERSE

router = APIRouter(prefix="/api/market", tags=["Market Data"])
csv_provider = CSVDataProvider()
yahoo_provider = YahooFinanceProvider()

@router.get("/universe")
def get_universe():
    return {
        "categories": DEFAULT_UNIVERSE,
        "available_symbols": ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]
    }

@router.get("/quote")
def get_quote(symbol: str = Query("AAPL")):
    quote = csv_provider.get_latest_quote(symbol)
    if not quote.get("price"):
        quote = yahoo_provider.get_latest_quote(symbol)
    return quote

@router.get("/history")
def get_history(
    symbol: str = Query("AAPL"),
    start_date: str = Query("2023-01-01"),
    end_date: str = Query("")
):
    df = csv_provider.get_historical_prices(symbol, start_date, end_date)
    if df.empty:
        df = yahoo_provider.get_historical_prices(symbol, start_date, end_date)
    
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No market data found for {symbol}")

    records = []
    for dt, row in df.iterrows():
        records.append({
            "date": str(dt)[:10],
            "open": round(float(row["open"]), 2),
            "high": round(float(row["high"]), 2),
            "low": round(float(row["low"]), 2),
            "close": round(float(row["close"]), 2),
            "volume": round(float(row["volume"]), 0)
        })
    return {"symbol": symbol, "bars_count": len(records), "bars": records[-150:]}

@router.post("/ingest")
def trigger_ingest(symbols: List[str]):
    res = ingest_universe(symbols)
    return {"status": "SUCCESS", "ingested_symbols": list(res.keys())}
