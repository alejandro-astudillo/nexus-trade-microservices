import httpx
from datetime import datetime
from typing import List
from src.domain.models import Candle
from src.domain.ports import MarketRepository

class BinanceMarketRepository(MarketRepository):
    """
    Adapter that fetches historical data directly from Binance REST API.
    """
    BASE_URL = "https://api.binance.com/api/v3/klines"

    def __init__(self):
        # Symbol mapping
        self.symbol_map = {
            "BTC-USD": "BTCUSDT",
            "ETH-USD": "ETHUSDT",
            "SOL-USD": "SOLUSDT",
            "ADA-USD": "ADAUSDT",
            "XRP-USD": "XRPUSDT",
        }
        # Interval mapping
        self.interval_map = {
            "1m": "1m",
            "5m": "5m",
            "15m": "15m",
            "1h": "1h",
            "4h": "4h",
            "1d": "1d",
            "1w": "1w",
        }

    async def get_history(self, symbol: str, resolution: str, limit: int) -> List[Candle]:
        binance_symbol = self.symbol_map.get(symbol)
        binance_interval = self.interval_map.get(resolution)

        if not binance_symbol or not binance_interval:
            return []

        params = {
            "symbol": binance_symbol,
            "interval": binance_interval,
            "limit": limit
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(self.BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()

        candles = []
        for item in data:
            # Binance kline format:
            # [
            #   [
            #     1499040000000,      // Open time
            #     "0.01634790",       // Open
            #     "0.80000000",       // High
            #     "0.01575800",       // Low
            #     "0.01577100",       // Close
            #     "148976.11427815",  // Volume
            #     1499644799999,      // Close time
            #     "2434.19055334",    // Quote asset volume
            #     308,                // Number of trades
            #     "1756.87402397",    // Taker buy base asset volume
            #     "28.46694368",      // Taker buy quote asset volume
            #     "17928899.62484339" // Ignore
            #   ]
            # ]
            candles.append(Candle(
                symbol=symbol,
                timestamp=datetime.fromtimestamp(item[0] / 1000.0),
                open=float(item[1]),
                high=float(item[2]),
                low=float(item[3]),
                close=float(item[4]),
                volume=float(item[5]),
                resolution=resolution
            ))

        return candles

    async def get_summary(self):
        # Not implemented for Binance adapter
        pass

    async def save_candles(self, candles: List[Candle]):
        # Read-only adapter
        pass
