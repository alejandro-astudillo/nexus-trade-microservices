using MediatR;
using Microsoft.EntityFrameworkCore;
using NexusTrade.Orders.Application.Common.Interfaces;
using NexusTrade.Orders.Application.Common.Models;
using NexusTrade.Orders.Application.Orders.Common;
using NexusTrade.Orders.Domain.Enums;

namespace NexusTrade.Orders.Application.Orders.Queries.GetOrders;

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, PaginatedList<OrderDto>>
{
    private readonly IApplicationDbContext _context;

    public GetOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<OrderDto>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders.AsNoTracking();

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<OrderStatus>(request.Status, true, out var status))
        {
            query = query.Where(x => x.Status == status);
        }

        if (request.UserId.HasValue)
        {
            query = query.Where(x => x.UserId == request.UserId.Value);
        }

        var count = await query.CountAsync(cancellationToken);
        
        var items = await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(o => new OrderDto
            {
                Id = o.Id,
                UserId = o.UserId,
                Symbol = o.Symbol,
                Side = o.Side.ToString(),
                Type = o.Type.ToString(),
                Status = o.Status.ToString(),
                Quantity = o.Quantity,
                Price = o.Price,
                ExecutedPrice = o.ExecutedPrice,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt
            })
            .ToListAsync(cancellationToken);

        return new PaginatedList<OrderDto>(items, count, request.PageNumber, request.PageSize);
    }
}
