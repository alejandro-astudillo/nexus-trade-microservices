using MediatR;
using NexusTrade.Orders.Application.Common.Models;
using NexusTrade.Orders.Application.Orders.Common;

namespace NexusTrade.Orders.Application.Orders.Queries.GetOrders;

public record GetOrdersQuery : IRequest<PaginatedList<OrderDto>>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 20;
    public string? Status { get; init; }
    public Guid? UserId { get; init; }
}
