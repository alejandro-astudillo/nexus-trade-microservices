using MediatR;
using NexusTrade.Orders.Application.Common.Interfaces;
using NexusTrade.Orders.Domain.Entities;
using NexusTrade.Orders.Domain.Enums;

namespace NexusTrade.Orders.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IPriceService _priceService;
    private readonly IWalletService _walletService;

    public CreateOrderCommandHandler(IApplicationDbContext context, IPriceService priceService, IWalletService walletService)
    {
        _context = context;
        _priceService = priceService;
        _walletService = walletService;
    }

    public async Task<Guid> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        decimal executionPrice = request.Price ?? 0;

        // 1. If Market Order, or validation of price needed, fetch latest price
        if (request.Type == OrderType.MARKET || request.Side == OrderSide.BUY)
        {
            var price = await _priceService.GetPriceAsync(request.Symbol, cancellationToken);
            if (price > 0)
            {
                executionPrice = price;
            }
            else if (request.Type == OrderType.MARKET)
            {
                throw new Exception("Failed to fetch market price for order execution.");
            }
        }

        // 2. Adjust funds
        if (request.Side == OrderSide.BUY)
        {
            var totalCost = executionPrice * request.Quantity;
            
            // Use email provided in request
            var success = await _walletService.DeductFundsAsync(request.Email, totalCost, cancellationToken);
            if (!success)
            {
                throw new InvalidOperationException("Insufficient funds or wallet error.");
            }
        }
        else if (request.Side == OrderSide.SELL)
        {
            var totalProceeds = executionPrice * request.Quantity;
            
            // Credit funds for selling
            var success = await _walletService.AddFundsAsync(request.Email, totalProceeds, cancellationToken);
            if (!success)
            {
                throw new InvalidOperationException("Failed to credit funds to wallet.");
            }
        }

        var entity = new Order
        {
            UserId = request.UserId,
            Symbol = request.Symbol,
            Side = request.Side,
            Type = request.Type,
            Status = OrderStatus.FILLED, // Auto-fill for demo
            Quantity = request.Quantity,
            Price = request.Type == OrderType.LIMIT ? request.Price : null,
            ExecutedPrice = executionPrice,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
