using Microsoft.EntityFrameworkCore;
using NexusTrade.Orders.Domain.Entities;

namespace NexusTrade.Orders.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Order> Orders { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
