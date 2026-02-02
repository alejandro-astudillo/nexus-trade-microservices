using NexusTrade.Orders.Domain.Enums;

namespace NexusTrade.Orders.Application.Orders.Common;

public record OrderDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string Symbol { get; init; } = string.Empty;
    public string Side { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public decimal? Price { get; init; }
    public decimal? ExecutedPrice { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
