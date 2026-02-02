using MediatR;
using Microsoft.AspNetCore.Mvc;
using NexusTrade.Orders.Application.Common.Models;
using NexusTrade.Orders.Application.Orders.Commands.CancelOrder;
using NexusTrade.Orders.Application.Orders.Commands.CreateOrder;
using NexusTrade.Orders.Application.Orders.Common;
using NexusTrade.Orders.Application.Orders.Queries.GetOrderById;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using NexusTrade.Orders.Application.Orders.Queries.GetOrders;
using NexusTrade.Orders.Domain.Enums;

namespace NexusTrade.Orders.Api.Controllers;

// DTO for incoming order request (without UserId - that comes from auth)
public record CreateOrderRequest
{
    public string Email { get; init; } = "guest@nexustrade.com"; // Default for backward compatibility
    public string Symbol { get; init; } = string.Empty;
    public OrderSide Side { get; init; }
    public OrderType Type { get; init; }
    public decimal Quantity { get; init; }
    public decimal? Price { get; init; }
}

[Authorize]
[ApiController]
[Route("v1/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<OrdersController> _logger;
    
    // TODO: Replace with proper JWT authentication
    // For now, use a static userId for demo purposes
    private static readonly Guid DemoUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public OrdersController(IMediator mediator, ILogger<OrdersController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedList<OrderDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedList<OrderDto>>> GetOrders([FromQuery] GetOrdersQuery query)
    {
        var userId = GetUserIdFromClaims();
        var updatedQuery = query with { UserId = userId };
        return Ok(await _mediator.Send(updatedQuery));
    }

    [HttpPost]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<Guid>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userId = GetUserIdFromClaims();
        var userEmail = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? request.Email;

        var command = new CreateOrderCommand
        {
            UserId = userId,
            Email = userEmail,
            Symbol = request.Symbol,
            Side = request.Side,
            Type = request.Type,
            Quantity = request.Quantity,
            Price = request.Price
        };
        
        var orderId = await _mediator.Send(command);
        var orderDto = await _mediator.Send(new GetOrderByIdQuery(orderId, userId));

        return CreatedAtAction(nameof(GetOrderById), new { orderId = orderId }, orderDto);
    }

    [HttpGet("{orderId}")]
    [ProducesResponseType(typeof(OrderDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDto>> GetOrderById(Guid orderId)
    {
        var userId = GetUserIdFromClaims();
        return Ok(await _mediator.Send(new GetOrderByIdQuery(orderId, userId)));
    }

    [HttpDelete("{orderId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CancelOrder(Guid orderId)
    {
        var userId = GetUserIdFromClaims();
        await _mediator.Send(new CancelOrderCommand(orderId, userId));
        return NoContent();
    }

    private Guid GetUserIdFromClaims()
    {
        var email = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(email) || email == "guest@nexustrade.com")
        {
            return DemoUserId;
        }

        using (var md5 = System.Security.Cryptography.MD5.Create())
        {
            var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(email));
            return new Guid(hash);
        }
    }
}
