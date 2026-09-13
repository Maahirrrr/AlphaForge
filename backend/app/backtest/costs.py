from typing import Dict, Any

class TransactionCostEngine:
    """
    Configurable transaction fee and taxation model.
    Models institutional & retail fee breakdowns:
    - Brokerage commission
    - Exchange turnover fees
    - Securities transaction tax (STT) / Stamp duty
    - Regulatory fees
    """

    def __init__(
        self,
        commission_bps: float = 3.0,     # 0.03%
        exchange_fee_bps: float = 0.35,  # 0.0035%
        tax_bps: float = 10.0,           # 0.10% on buys/sells
        min_commission: float = 0.0
    ):
        self.commission_bps = commission_bps
        self.exchange_fee_bps = exchange_fee_bps
        self.tax_bps = tax_bps
        self.min_commission = min_commission

    def calculate_costs(self, notional: float, side: str = "BUY") -> Dict[str, float]:
        """
        Calculates all trading fees for a trade of given notional value.
        """
        notional_abs = abs(notional)
        comm = max(self.min_commission, notional_abs * (self.commission_bps / 10000.0))
        exch = notional_abs * (self.exchange_fee_bps / 10000.0)
        tax = notional_abs * (self.tax_bps / 10000.0)
        total = comm + exch + tax

        return {
            "commission": round(comm, 2),
            "exchange_fee": round(exch, 2),
            "taxes": round(tax, 2),
            "total_costs": round(total, 2)
        }
