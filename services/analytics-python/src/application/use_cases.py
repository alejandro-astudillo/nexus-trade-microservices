from typing import List
from src.domain.ports import MarketRepository, AnalyticsService
from src.domain.models import Candle, MarketSummary, PortfolioRiskRequest, PortfolioRiskResponse

class GetMarketDataUseCase:
    def __init__(self, repository: MarketRepository):
        self.repository = repository

    async def execute(self, symbol: str, resolution: str, limit: int) -> List[Candle]:
        return await self.repository.get_history(symbol, resolution, limit)

class GetMarketSummaryUseCase:
    def __init__(self, repository: MarketRepository):
        self.repository = repository

    async def execute(self) -> MarketSummary:
        return await self.repository.get_summary()

class PredictTrendUseCase:
    def __init__(self, analytics_service: AnalyticsService):
        self.service = analytics_service

    async def execute(self, symbol: str) -> dict:
        return await self.service.predict_trend(symbol)

class CalculateRiskUseCase:
    def __init__(self, analytics_service: AnalyticsService):
        self.service = analytics_service

    async def execute(self, portfolio: PortfolioRiskRequest) -> PortfolioRiskResponse:
        return await self.service.calculate_risk(portfolio)
