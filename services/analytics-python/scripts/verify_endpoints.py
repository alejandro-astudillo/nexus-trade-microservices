import asyncio
import httpx
from datetime import datetime

BASE_URL = "http://localhost:8003"

async def test_endpoints():
    async with httpx.AsyncClient() as client:
        # 1. Health Check
        print("Checking Health...")
        response = await client.get(f"{BASE_URL}/health")
        print(f"Health Status: {response.status_code}")
        print(response.json())
        assert response.status_code == 200
        
        # 2. Market Summary (should be empty initially)
        print("\nChecking Market Summary...")
        response = await client.get(f"{BASE_URL}/v1/market/summary")
        print(f"Summary Status: {response.status_code}")
        print(response.json())
        assert response.status_code == 200

        # 3. Analytics Prediction
        print("\nChecking Analytics Prediction...")
        response = await client.get(f"{BASE_URL}/v1/analytics/predict/BTC-USD")
        print(f"Prediction Status: {response.status_code}")
        print(response.json())
        assert response.status_code == 200
        assert response.json()["symbol"] == "BTC-USD"
        
        # 4. Market History (should be empty initially)
        print("\nChecking Market History...")
        response = await client.get(f"{BASE_URL}/v1/market/history?symbol=BTC-USD&resolution=1h")
        print(f"History Status: {response.status_code}")
        data = response.json()
        print(f"Candles count: {len(data)}")
        assert response.status_code == 200
        assert isinstance(data, list)

if __name__ == "__main__":
    asyncio.run(test_endpoints())
