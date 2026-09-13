from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime
import pandas as pd

class BaseStrategy(ABC):
    """
    Abstract Strategy Interface for all AlphaForge trading strategies.
    Ensures identical signal generation interface for Backtesting, Paper, and Live execution.
    """

    def __init__(self, name: str, config: Dict[str, Any]):
        self.name = name
        self.config = config

    @abstractmethod
    def generate_signals(
        self,
        current_time: datetime,
        historical_data: Dict[str, pd.DataFrame] # symbol -> df up to current_time ONLY
    ) -> Dict[str, Any]:
        """
        Calculates target portfolio weights for the universe.
        Returns dict: {"target_weights": {symbol: weight}, "metadata": {...}}
        """
        pass
