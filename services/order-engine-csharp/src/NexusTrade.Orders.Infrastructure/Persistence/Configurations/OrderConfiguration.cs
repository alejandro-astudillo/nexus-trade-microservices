using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NexusTrade.Orders.Domain.Entities;

namespace NexusTrade.Orders.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Symbol)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(o => o.Side)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(o => o.Type)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(o => o.Status)
            .IsRequired()
            .HasConversion<string>();

        // Precision for monetary/quantity values
        builder.Property(o => o.Quantity)
            .HasPrecision(18, 8); // Allows crypto precision like 0.00000001

        builder.Property(o => o.Price)
            .HasPrecision(18, 2); // Standard currency precision

        builder.Property(o => o.ExecutedPrice)
            .HasPrecision(18, 2);
    }
}
