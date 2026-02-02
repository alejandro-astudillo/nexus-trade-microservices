package ports

import (
	"context"

	"github.com/nexus-trade/pricing-go/internal/domain"
)

// PricingService defines the interface for managing current prices.
// It is the primary port for the Driving Adapters (HTTP).
type PricingService interface {
	GetPrices(ctx context.Context) (map[string]domain.PriceUpdate, error)
	GetPrice(ctx context.Context, symbol string) (domain.PriceUpdate, error)
	UpdatePrice(ctx context.Context, update domain.PriceUpdate) error
}

// Publisher defines the interface for publishing price updates to external systems.
// It is a port for Driven Adapters (RabbitMQ/Redis Stream).
type Publisher interface {
	PublishPriceUpdate(ctx context.Context, update domain.PriceUpdate) error
}

// IngestionManager defines the interface for managing data ingestion workers.
type IngestionManager interface {
	Start(outputChan chan<- domain.PriceUpdate)
	Stop()
}
