from fastapi import APIRouter, Path
from src.application.use_cases import PredictTrendUseCase, CalculateRiskUseCase
from src.domain.models import PortfolioRiskRequest, PortfolioRiskResponse

def get_analytics_service():
    from src.presentation.main import analytics_service
    return analytics_service

router = APIRouter()

@router.get("/predict/{symbol}")
async def predict_trend(symbol: str = Path(..., description="Trading symbol")):
    service = get_analytics_service()
    use_case = PredictTrendUseCase(service)
    return await use_case.execute(symbol)

@router.post("/portfolio/risk", response_model=PortfolioRiskResponse)
async def calculate_portfolio_risk(request: PortfolioRiskRequest):
    service = get_analytics_service()
    use_case = CalculateRiskUseCase(service)
    return await use_case.execute(request)
