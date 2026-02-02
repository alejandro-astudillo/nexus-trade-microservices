from abc import ABC, abstractmethod
from typing import List, Optional
from src.domain.models import Candle, MarketSummary, PortfolioRiskRequest, PortfolioRiskResponse

class MarketRepository(ABC):
    """
    Port for Market Data access.
    Infrastructure adapters will implement this to connect to MongoDB.
    """
    
    @abstractmethod
    async def get_history(self, symbol: str, resolution: str, limit: int) -> List[Candle]:
        """Retrieves historical candles matching criteria."""
        pass
    
    @abstractmethod
    async def get_summary(self) -> MarketSummary:
        """Retrieves 24h market summary."""
        pass
    
    @abstractmethod
    async def save_candles(self, candles: List[Candle]):
        """Saves candles to the repository."""
        pass

class AnalyticsService(ABC):
    """
    Port for Analytics domain logic.
    Implementations may use Pandas/Numpy for calculations.
    """
    
    @abstractmethod
    async def predict_trend(self, symbol: str) -> dict:
        """Predicts future trend for a symbol."""
        pass
        
    @abstractmethod
    async def calculate_risk(self, portfolio: PortfolioRiskRequest) -> PortfolioRiskResponse:
        """Calculates risk metrics for a portfolio."""
        pass
