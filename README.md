# AlphaForge: ML-Powered Quantitative Trading & Research Platform

AlphaForge is a portfolio-grade quantitative research and systematic trading platform combining machine learning alpha prediction, market regime classification, mean-variance portfolio optimization, multi-layer risk management, and event-driven backtesting.

## Key Features
- **Historical Market Data**: Automated ingestion from Yahoo Finance and local CSV with split adjustment and anomaly validation.
- **Feature Engineering**: 50+ technical, momentum, volatility, volume microstructure, and factor signals with strict anti-lookahead guarantees.
- **Supervised ML Alpha**: XGBoost regression/classification predicting forward return distributions $E[r_{t+h} | X_t]$.
- **Time-Series Validation**: Walk-forward cross-validation tracking Spearman Rank IC, IC Information Ratio ($IC\_IR$), and directional accuracy.
- **Market Regime Detection**: 3-state Gaussian Hidden Markov Model (Bull Trend, Sideways, High Volatility).
- **Portfolio Optimization**: Mean-Variance (Quadratic Programming) with Ledoit-Wolf covariance shrinkage and Risk Parity.
- **Pre-Trade Risk Engine**: Multi-layer limits (Max Position, Daily Loss, Drawdown, Exposure) and Emergency Kill Switch.
- **Event-Driven Backtester**: Bar-by-bar event simulation with realistic slippage and transaction costs.
- **Execution**: Paper trading by default (?10,00,000 demo capital) with safety-gated live broker adapter.

## Quickstart (Local PowerShell)
```powershell
# Ingest data & run walk-forward validation
python cli.py data-download
python cli.py model-train --symbol AAPL --horizon 5d

# Run event-driven backtest
python cli.py backtest --strategy ML_CROSS_SECTIONAL

# Start FastAPI backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Docker Compose
```bash
docker compose up --build
```
