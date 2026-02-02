from fastapi import APIRouter, HTTPException, Query
from typing import List
from src.domain.models import Candle, MarketSummary
from src.application.use_cases import GetMarketDataUseCase, GetMarketSummaryUseCase

from src.infrastructure.mongo_adapter import MongoMarketRepository
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongo_url: str
    db_name: str

    class Config:
        env_file = ".env"

def get_market_repo():
    from src.presentation.main import mongo_repo
    return mongo_repo

router = APIRouter()

@router.get("/history", response_model=List[Candle])
async def get_history(
    symbol: str = Query(..., description="Trading symbol"),
    resolution: str = Query("1h", description="Timeframe"),
    limit: int = Query(100, description="Number of candles")
):
    repo = get_market_repo()
    use_case = GetMarketDataUseCase(repo)
    return await use_case.execute(symbol, resolution, limit)

@router.get("/summary", response_model=MarketSummary)
async def get_market_summary():
    repo = get_market_repo()
    use_case = GetMarketSummaryUseCase(repo)
    return await use_case.execute()
