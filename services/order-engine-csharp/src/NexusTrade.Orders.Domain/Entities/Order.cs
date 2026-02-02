using NexusTrade.Orders.Domain.Common;
using NexusTrade.Orders.Domain.Enums;

namespace NexusTrade.Orders.Domain.Entities;

public class Order : BaseAuditableEntity
{
    public Guid UserId { get; set; }
    public string Symbol { get; set; } = string.Empty;
    public OrderSide Side { get; set; }
    public OrderType Type { get; set; }
    public OrderStatus Status { get; set; }
    public decimal Quantity { get; set; }
    public decimal? Price { get; set; }
    public decimal? ExecutedPrice { get; set; }
}
