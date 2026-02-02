from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from src.presentation.api import market, analytics
from src.infrastructure.mongo_adapter import MongoMarketRepository
from src.infrastructure.analytics_adapter import PandasAnalyticsService
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    files_api_url: str = "http://localhost:8000" 
    mongo_url: str = "mongodb://localhost:27017"
    db_name: str = "nexus_analytics"

    class Config:
        env_file = ".env"

settings = Settings()

mongo_repo = MongoMarketRepository(settings.mongo_url, settings.db_name)
analytics_service = PandasAnalyticsService()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting Analytics Service...")
    yield
    print("Shutting down Analytics Service...")

app = FastAPI(
    title="NexusTrade Analytics Service",
    description="Service for market data analysis and risk management",
    version="1.0.0",
    lifespan=lifespan
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": str(exc),
            "details": {}
        }
    )

app.include_router(market.router, prefix="/v1/market", tags=["Market Data"])
app.include_router(analytics.router, prefix="/v1/analytics", tags=["Analytics"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
