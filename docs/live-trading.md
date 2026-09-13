# Live Trading Safety Protocol

## Strict Safety Guardrails
1. **Paper by Default**: System boots in `PAPER` mode.
2. **Dual-Key Confirmation**: Live activation requires explicit token confirmation.
3. **No Hardcoded Secrets**: Credentials loaded exclusively via `.env` and never exposed over API.
4. **Kill Switch Armed**: Order flow terminates instantly if kill switch is triggered.
