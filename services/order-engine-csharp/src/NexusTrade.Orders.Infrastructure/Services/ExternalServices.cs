using System.Net.Http.Json;
using NexusTrade.Orders.Application.Common.Interfaces;

namespace NexusTrade.Orders.Infrastructure.Services;

public class PriceService : IPriceService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public PriceService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<decimal> GetPriceAsync(string symbol, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient();
        try 
        {
            var response = await client.GetFromJsonAsync<PricingResponse>(
                $"http://pricing-go:8080/v1/prices/{symbol}", cancellationToken);
            return response?.Price ?? 0;
        }
        catch
        {
            return 0; // Fallback or throw
        }
    }

    private class PricingResponse
    {
        public string Symbol { get; set; }
        public decimal Price { get; set; }
    }
}

public class WalletService : IWalletService
{
    private readonly IHttpClientFactory _httpClientFactory;

    public WalletService(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    public async Task<bool> DeductFundsAsync(string email, decimal amount, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient();
        var request = new { email, amount };
        
        try
        {
            var response = await client.PostAsJsonAsync(
                "http://wallet-java:8081/v1/wallets/internal/withdraw", 
                request, 
                cancellationToken);
                
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    public async Task<bool> AddFundsAsync(string email, decimal amount, CancellationToken cancellationToken)
    {
        var client = _httpClientFactory.CreateClient();
        var request = new { email, amount };
        
        try
        {
            var response = await client.PostAsJsonAsync(
                "http://wallet-java:8081/v1/wallets/internal/deposit", 
                request, 
                cancellationToken);
                
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}
