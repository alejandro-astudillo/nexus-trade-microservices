namespace NexusTrade.Orders.Api.Endpoints;

public static class HealthEndpoints
{
    public static void MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/health");

        group.MapGet("/", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }))
             .WithName("GetHealthStatus")
             .WithOpenApi();
    }
}
