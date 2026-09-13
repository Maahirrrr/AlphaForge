# AlphaForge: ML-Powered Quantitative Trading & Research Platform

[![Live Terminal](https://img.shields.io/badge/Live%20Demo-AlphaForge%20Terminal-007AFF?style=for-the-badge&logo=vercel&logoColor=white)](https://maahirrrr.github.io/AlphaForge/)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg?style=for-the-badge)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg?style=for-the-badge)](LICENSE)

> **Live Interactive Web Terminal**: [https://maahirrrr.github.io/AlphaForge/](https://maahirrrr.github.io/AlphaForge/)  
> Experience the full institutional dark quant workstation directly in your browser with interactive walk-forward model training, SHAP explainability, HMM regime transitions, mean-variance quadratic optimization, and paper trading blotters.

---

AlphaForge is an institutional-grade quantitative research and algorithmic trading platform designed for systematic alpha generation, market regime detection, multi-layer risk management, and realistic event-driven backtesting.

## Key Features

- **Historical Market Data Research**: Automated multi-asset ingestion (US Tech & Indian NSE/Nifty) with split/dividend adjustment, survivorship safeguards, and anomaly detection.
- **50+ Quantitative Features**: Technical, momentum, volatility, volume microstructure, and multi-factor signals computed with strict anti-lookahead guarantees.
- **Supervised ML Alpha Engine**: XGBoost regression and classification forecasting forward return distributions $E[r_{t+h} \mid X_t]$.
- **Leak-Free Walk-Forward Validation**: Expanding/rolling time-series folds tracking Spearman Rank Information Coefficient (Rank IC), IC Information Ratio ($IC\_IR$), and directional accuracy.
- **Explainable Quant AI**: TreeSHAP feature attributions decomposing individual trade predictions alongside Wasserstein distance feature drift monitoring.
- **Market Regime Detection**: 3-state Gaussian Hidden Markov Model (Bull Trend, Sideways, High Volatility) with dynamic regime-conditioned strategy adaptation.
- **Portfolio Optimization**: Mean-Variance Quadratic Programming with Ledoit-Wolf shrinkage covariance estimation and Equal Risk Parity.
- **Institutional Pre-Trade Risk Engine**: Multi-tier limits (Max Position Weight, Daily Loss Halt, Max Drawdown, Leverage Limits) and Global Emergency Kill Switch.
- **Realistic Event-Driven Backtesting**: Tick/bar-by-bar queue simulation with slippage curves, broker commissions, exchange transaction charges, and borrow fees.
- **Paper & Live Execution Architecture**: 
  - **Default Mode**: Paper trading simulation seeded with ₹10,00,000 / $100,000 virtual capital.
  - **Live Mode**: Strict dual-key authorization with cryptographic token gates, credentials masking, and broker isolation.

---

## Quickstart

### 1. Web Terminal (Zero-Install Browser Demo)
Access the pre-deployed terminal immediately at:
**[https://maahirrrr.github.io/AlphaForge/](https://maahirrrr.github.io/AlphaForge/)**

### 2. Local Research CLI
```powershell
# Clone repository
git clone https://github.com/Maahirrrr/AlphaForge.git
cd AlphaForge

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt

# Download / verify pre-seeded market data
python cli.py data-download

# Train supervised XGBoost alpha model with walk-forward validation
python cli.py model-train --symbol AAPL --horizon 5d

# Run event-driven backtest on trained alpha
python cli.py backtest --strategy ML_CROSS_SECTIONAL

# Check paper broker telemetry & positions
python cli.py paper-status
```

### 3. Full-Stack Local Deployment
```powershell
# Run FastAPI Backend (Port 8000)
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Run Next.js Quant Terminal (Port 3000)
cd ../frontend
npm install
npm run dev
```

### 4. Docker Compose
```bash
docker compose up --build
```

---

## Architecture Overview

```
alphaforge/
├── backend/
│   ├── app/
│   │   ├── api/routes/         # REST API endpoints (market, models, backtest, risk, broker)
│   │   ├── config.py           # Institutional config & safety thresholds
│   │   └── main.py             # FastAPI entrypoint
│   ├── alphaforge/
│   │   ├── data/               # Yahoo Finance fetcher & data store
│   │   ├── features/           # 50+ quantitative features & pipeline
│   │   ├── models/             # XGBoost, Walk-Forward validator, HMM, SHAP
│   │   ├── portfolio/          # Ledoit-Wolf covariance, MVO QP, Risk Parity
│   │   ├── backtest/           # Bar-by-bar event driven simulation engine
│   │   ├── risk/               # Pre-trade risk validator & Emergency Kill Switch
│   │   └── execution/          # PaperBroker & LiveBrokerAdapter
│   └── tests/                  # 12 Unit & Integration test suites
├── frontend/                   # Next.js 14 dark institutional trading workstation
│   ├── app/                    # 8 views (Dashboard, Research, Backtest, Strategies, etc.)
│   ├── components/             # Industrial high-density quant UI components
│   └── lib/                    # API client with automatic client-side demo fallback
├── cli.py                      # Production CLI interface
└── docker-compose.yml          # Containerized deployment
```

---

## Safety & Compliance Notice
> **CRITICAL**: Live trading involves substantial risk of loss. AlphaForge enforces simulated **PAPER TRADING** by default. Live broker execution cannot be activated without explicit multi-stage credential setup, risk limit acknowledgment, and dual-confirmation token authorization.
