# Risk Management Framework

## Pre-Trade Risk Engine
Every order must pass through `RiskEngine.validate_order()`:
1. **Max Portfolio Exposure**: Cap on total invested capital (e.g. 100%).
2. **Max Position Size**: Single-asset concentration cap (e.g. 15%).
3. **Max Daily Loss**: Daily circuit breaker (e.g. -2% session loss halts trading).
4. **Max Drawdown**: High-water mark drawdown cap (e.g. -15%).
5. **Max Order Value**: Caps individual order notional.

## Emergency Kill Switch
Global state manager halting all automated trading, cancelling open orders, and blocking order entry.
