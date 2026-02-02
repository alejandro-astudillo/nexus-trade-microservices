import os
import random
from datetime import datetime, timedelta
from typing import List
from motor.motor_asyncio import AsyncIOMotorClient
from src.domain.models import Candle, MarketSummary
from src.domain.ports import MarketRepository
from src.infrastructure.binance_adapter import BinanceMarketRepository

class MongoMarketRepository(MarketRepository):
    """
    MongoDB implementation of the MarketRepository port.
    Uses Motor for async access.
    """
    def __init__(self, mongo_url: str, db_name: str):
        self.client = AsyncIOMotorClient(mongo_url)
        self.db = self.client[db_name]
        self.collection = self.db.candles
        self.binance_repo = BinanceMarketRepository()

    async def get_history(self, symbol: str, resolution: str, limit: int) -> List[Candle]:
        cursor = self.collection.find(
            {"symbol": symbol, "resolution": resolution}
        ).sort("timestamp", -1).limit(limit)
        
        candles = []
        async for doc in cursor:
            # Motor returns dicts, Pydantic handles conversion
            candles.append(Candle(**doc))
        
        # If no data in DB, fetch from Binance
        if not candles:
            candles = await self.binance_repo.get_history(symbol, resolution, limit)
            # Save to DB for caching
            if candles:
                await self.save_candles(candles)
            
        # Return in chronological order
        return sorted(candles, key=lambda c: c.timestamp)
    
    async def get_summary(self) -> MarketSummary:
        # For simplicity in this demo, we'll implement a basic summary
        # In a real app, this might use MongoDB aggregation pipelines
        pass
        # Placeholder implementation to satisfy abstract class until full implementation
        return MarketSummary(top_gainers=[], top_losers=[], highest_volume=[])

    async def save_candles(self, candles: List[Candle]):
        if not candles:
            return
        
        # Convert to dicts for insertion
        docs = [candle.model_dump() for candle in candles]
        
        # Upsert based on symbol, resolution, and timestamp to avoid duplicates
        for doc in docs:
            await self.collection.update_one(
                {
                    "symbol": doc["symbol"],
                    "resolution": doc["resolution"],
                    "timestamp": doc["timestamp"]
                },
                {"$set": doc},
                upsert=True
            )
