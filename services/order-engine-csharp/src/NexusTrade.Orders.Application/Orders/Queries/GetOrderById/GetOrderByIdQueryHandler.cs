using MediatR;
using Microsoft.EntityFrameworkCore;
using NexusTrade.Orders.Application.Common.Interfaces;
using NexusTrade.Orders.Application.Orders.Common;

namespace NexusTrade.Orders.Application.Orders.Queries.GetOrderById;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
{
    private readonly IApplicationDbContext _context;

    public GetOrderByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<OrderDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Orders
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.OrderId && (!request.UserId.HasValue || x.UserId == request.UserId.Value), cancellationToken);

        if (entity == null)
        {
             // We can let the Controller handle null or throw NotFoundException here.
             // Following the approach in CancelOrder, we can throw KeyNotFoundException
             throw new KeyNotFoundException($"Order with ID {request.OrderId} not found.");
        }

        return new OrderDto
        {
            Id = entity.Id,
            UserId = entity.UserId,
            Symbol = entity.Symbol,
            Side = entity.Side.ToString(),
            Type = entity.Type.ToString(),
            Status = entity.Status.ToString(),
            Quantity = entity.Quantity,
            Price = entity.Price,
            ExecutedPrice = entity.ExecutedPrice,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}
