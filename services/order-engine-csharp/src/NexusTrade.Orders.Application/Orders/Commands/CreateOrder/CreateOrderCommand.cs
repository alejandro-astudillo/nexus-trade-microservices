using MediatR;
using NexusTrade.Orders.Domain.Enums;

namespace NexusTrade.Orders.Application.Orders.Commands.CreateOrder;

public record CreateOrderCommand : IRequest<Guid>
{
    public Guid UserId { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Symbol { get; init; } = string.Empty;
    public OrderSide Side { get; init; }
    public OrderType Type { get; init; }
    public decimal Quantity { get; init; }
    public decimal? Price { get; init; }
}
