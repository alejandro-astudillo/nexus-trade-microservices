from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class Candle(BaseModel):
    """
    Represents a single OHLCV (Open, High, Low, Close, Volume) candle.
    Matching the OpenAPI schema in components/schemas/candle.yaml
    """
    timestamp: datetime = Field(..., description="Opening time of the candle")
    open: float = Field(..., description="Opening price")
    high: float = Field(..., description="Highest price")
    low: float = Field(..., description="Lowest price")
    close: float = Field(..., description="Closing price")
    volume: float = Field(..., description="Trading volume")
    symbol: str = Field(..., description="Trading symbol, e.g., BTC-USD")
    resolution: str = Field(..., description="Timeframe resolution, e.g., 1h, 1d")

    class Config:
        json_schema_extra = {
            "example": {
                "timestamp": "2024-01-28T12:00:00Z",
                "open": 42000.50,
                "high": 42500.00,
                "low": 41900.00,
                "close": 42300.25,
                "volume": 125.5,
                "symbol": "BTC-USD",
                "resolution": "1h"
            }
        }

class MarketSummary(BaseModel):
    """
    Represents a 24h market summary.
    """
    top_gainers: List[Candle]
    top_losers: List[Candle]
    highest_volume: List[Candle]

class Asset(BaseModel):
    symbol: str
    quantity: float

class PortfolioRiskRequest(BaseModel):
    assets: List[Asset]

class PortfolioRiskResponse(BaseModel):
    totalValue: float
    volatility: float
    sharpeRatio: float
    diversificationScore: int
