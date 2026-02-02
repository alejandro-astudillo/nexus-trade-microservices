using MediatR;

namespace NexusTrade.Orders.Application.Orders.Commands.CancelOrder;

public record CancelOrderCommand(Guid OrderId, Guid? UserId = null) : IRequest;
