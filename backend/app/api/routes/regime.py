from fastapi import APIRouter, HTTPException, Query
from app.models.regime.hmm import MarketRegimeHMM
from app.data.providers.csv import CSVDataProvider

router = APIRouter(prefix="/api/regime", tags=["Market Regime"])
provider = CSVDataProvider()

@router.get("/current")
def get_current_regime(symbol: str = Query("AAPL")):
    df = provider.get_historical_prices(symbol, "2021-01-01", "")
    if df.empty:
        raise HTTPException(status_code=404, detail="No market data available for regime analysis")
    
    hmm = MarketRegimeHMM()
    hmm.fit(df)
    return hmm.get_current_regime(df)
