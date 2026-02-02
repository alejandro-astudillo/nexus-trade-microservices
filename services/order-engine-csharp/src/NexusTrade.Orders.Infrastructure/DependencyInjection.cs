using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NexusTrade.Orders.Application.Common.Interfaces;
using NexusTrade.Orders.Infrastructure.Persistence;

namespace NexusTrade.Orders.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseSqlServer(connectionString);
        });

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<ApplicationDbContextInitialiser>();
        services.AddHttpClient();
        
        services.AddTransient<IPriceService, Services.PriceService>();
        services.AddTransient<IWalletService, Services.WalletService>();

        return services;
    }
}
