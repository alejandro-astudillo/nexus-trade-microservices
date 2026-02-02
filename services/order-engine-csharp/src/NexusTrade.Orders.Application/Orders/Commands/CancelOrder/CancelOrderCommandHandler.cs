using MediatR;
using NexusTrade.Orders.Application.Common.Exceptions;
using NexusTrade.Orders.Application.Common.Interfaces;
using NexusTrade.Orders.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace NexusTrade.Orders.Application.Orders.Commands.CancelOrder;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand>
{
    private readonly IApplicationDbContext _context;

    public CancelOrderCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders
            .FirstOrDefaultAsync(x => x.Id == request.OrderId && (!request.UserId.HasValue || x.UserId == request.UserId.Value), cancellationToken);

        if (entity == null)
        {
            throw new KeyNotFoundException($"Order with ID {request.OrderId} not found or you don't have permission to cancel it.");
        }

        if (entity.Status != OrderStatus.PENDING)
        {
             // Mapping domain logic failure to Application Exception (could be a custom DomainException too)
            throw new InvalidOperationException("Only PENDING orders can be cancelled.");
        }

        entity.Status = OrderStatus.CANCELLED;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
