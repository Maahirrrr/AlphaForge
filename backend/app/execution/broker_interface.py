from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BrokerInterface(ABC):
    """
    Unified broker abstraction ensuring identical interface between Paper and Live modes.
    Architecture:
    Strategy -> Signal -> Risk Engine -> Order Manager -> BrokerInterface
                                                          +-- PaperBroker
                                                          +-- LiveBroker
    """

    @abstractmethod
    def connect(self) -> bool:
        """Establish handshake with broker execution service."""
        pass

    @abstractmethod
    def get_account(self) -> Dict[str, Any]:
        """Fetch account balance, cash, buying power, and currency."""
        pass

    @abstractmethod
    def get_positions(self) -> List[Dict[str, Any]]:
        """Fetch active held positions."""
        pass

    @abstractmethod
    def get_orders(self) -> List[Dict[str, Any]]:
        """Fetch open and historic orders."""
        pass

    @abstractmethod
    def get_quote(self, symbol: str) -> Dict[str, Any]:
        """Fetch current market quote for symbol."""
        pass

    @abstractmethod
    def place_order(
        self,
        symbol: str,
        side: str,
        quantity: float,
        order_type: str = "MARKET",
        price: Optional[float] = None,
        stop_price: Optional[float] = None
    ) -> Dict[str, Any]:
        """Submit order to broker."""
        pass

    @abstractmethod
    def cancel_order(self, order_id: str) -> bool:
        """Cancel an open order."""
        pass
