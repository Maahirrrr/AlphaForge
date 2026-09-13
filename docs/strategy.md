# AlphaForge Quantitative Strategies

## 1. ML Cross-Sectional Alpha
- **Prediction Target**: Forward return $y_{t, h} = \frac{P_{t+h}}{P_t} - 1$
- **Estimator**: Gradient Boosted Decision Trees (XGBoost Regressor)
- **Portfolio Construction**: Mean-Variance Optimization:
  $$\max_{w} \left( w^T \hat{\mu} - \frac{\lambda}{2} w^T \Sigma w \right)$$
  subject to $\sum w_i = 1$, $0 \le w_i \le w_{max}$.

## 2. Quantitative Momentum
- **Metric**: 20-day Rate of Change with 50-day SMA trend confirmation.
- **Sizing**: Inverse-volatility risk budgeting ($w_i \propto \frac{1}{\sigma_i}$).

## 3. Statistical Mean Reversion
- **Metric**: Rolling 20-day price Z-score: $Z_t = \frac{P_t - \mu_t}{\sigma_t}$.
- **Entry**: Oversold conditions ($Z_t \le -1.5$).

## 4. Regime-Adaptive Dynamic Strategy
- **State Machine**: Driven by Hidden Markov Model (HMM).
- **Bull Trend**: Deploys Quantitative Momentum.
- **Sideways Market**: Deploys Mean Reversion.
- **High Volatility**: Reduces portfolio exposure to 40% (60% cash buffer).
