using FluentValidation;
using NexusTrade.Orders.Domain.Enums;

namespace NexusTrade.Orders.Application.Orders.Commands.CreateOrder;

public class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(v => v.Symbol)
            .NotEmpty().WithMessage("Symbol is required.")
            .Length(3, 10).WithMessage("Symbol must be between 3 and 10 characters.");

        RuleFor(v => v.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than 0.");

        RuleFor(v => v.Price)
            .GreaterThan(0).When(v => v.Type == OrderType.LIMIT)
            .WithMessage("Price is required and must be greater than 0 for LIMIT orders.");
            
        RuleFor(v => v.Price)
            .Null().When(v => v.Type == OrderType.MARKET)
            .WithMessage("Price should be null for MARKET orders.");

        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("UserId is required.");
    }
}
