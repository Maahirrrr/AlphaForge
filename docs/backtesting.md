# Event-Driven Backtesting Engine

## Mechanics
Sequences events chronologically:
1. `MarketEvent`: Ingests bar $t$.
2. `SignalEvent`: Generates strategy target weights using data $\le t$.
3. `OrderEvent`: Computes rebalance trades and validates against `RiskEngine`.
4. `FillEvent`: Simulates execution with slippage and fee deduction.
5. `PortfolioEvent`: Updates mark-to-market equity.

## Transaction Cost & Slippage Model
- **Slippage**: Fixed basis points (5 bps) + Volume-dependent market impact:
  $$S = \text{base\_bps} + \gamma \cdot \left(\frac{Q}{V}\right)^\alpha$$
- **Costs**: Brokerage (3 bps), Exchange fees (0.35 bps), Taxes/STT (10 bps).
