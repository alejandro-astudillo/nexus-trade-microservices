using MediatR;
using NexusTrade.Orders.Application.Orders.Common;

namespace NexusTrade.Orders.Application.Orders.Queries.GetOrderById;

public record GetOrderByIdQuery(Guid OrderId, Guid? UserId = null) : IRequest<OrderDto>;
