using System.Reflection;
using Microsoft.EntityFrameworkCore;
using NexusTrade.Orders.Application.Common.Interfaces;
using NexusTrade.Orders.Domain.Entities;

namespace NexusTrade.Orders.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        base.OnModelCreating(builder);
    }
}
