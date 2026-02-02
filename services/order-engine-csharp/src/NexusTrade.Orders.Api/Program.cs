using NexusTrade.Orders.Api.Middleware;
using NexusTrade.Orders.Application.Common.Behaviors;
using NexusTrade.Orders.Infrastructure;
using NexusTrade.Orders.Infrastructure.Persistence;
using FluentValidation;
using MediatR;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer("Bearer", options =>
    {
        options.RequireHttpsMetadata = false; // Dev mode
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                Convert.FromBase64String("404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"))
        };
    });

// Layer specific registrations
builder.Services.AddInfrastructureServices(builder.Configuration);

// Application Layer Registration (Manual since we didn't add a DependencyInjection.cs there yet)
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(NexusTrade.Orders.Application.Orders.Commands.CreateOrder.CreateOrderCommand).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
});
builder.Services.AddValidatorsFromAssembly(typeof(NexusTrade.Orders.Application.Orders.Commands.CreateOrder.CreateOrderCommandValidator).Assembly);


var app = builder.Build();

// Initialise and seed database
using (var scope = app.Services.CreateScope())
{
    var initialiser = scope.ServiceProvider.GetRequiredService<ApplicationDbContextInitialiser>();
    await initialiser.InitialiseAsync();
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
