namespace NexusTrade.Orders.Application.Common.Interfaces;

public interface IPriceService
{
    Task<decimal> GetPriceAsync(string symbol, CancellationToken cancellationToken);
}

public interface IWalletService
{
    Task<bool> DeductFundsAsync(string email, decimal amount, CancellationToken cancellationToken);
    Task<bool> AddFundsAsync(string email, decimal amount, CancellationToken cancellationToken);
}
