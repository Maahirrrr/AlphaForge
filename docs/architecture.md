# AlphaForge System Architecture

AlphaForge is engineered following a clean quantitative pipeline:

```
Market Data -> Feature Pipeline -> Alpha Models -> Regime Detection (HMM)
     -> Risk Model -> Portfolio Optimization -> Position Sizer
     -> RiskEngine Check -> Order Manager -> BrokerInterface [PaperBroker | LiveBroker]
```

## Architectural Decoupling
1. **Research vs Execution**: Model research and walk-forward cross-validation operate on immutable historical series. Execution consumes model representations via standard interfaces.
2. **Broker Interface**: A single unified `BrokerInterface` is shared across Paper and Live trading. Strategies never know which broker is connected.
3. **Safety Gates**: Orders are pre-screened by `RiskEngine` before hitting any broker adapter.
