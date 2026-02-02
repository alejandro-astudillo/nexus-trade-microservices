package services

import (
	"context"
	"fmt"
	"sync"

	"github.com/nexus-trade/pricing-go/internal/core/ports"
	"github.com/nexus-trade/pricing-go/internal/domain"
	"go.uber.org/zap"
)

// pricingService implements ports.PricingService using a thread-safe map.
type pricingService struct {
	mu        sync.RWMutex
	prices    map[string]domain.PriceUpdate
	publisher ports.Publisher
	logger    *zap.Logger
}

// NewPricingService creates a new instance of the pricing service.
func NewPricingService(publisher ports.Publisher, logger *zap.Logger) ports.PricingService {
	return &pricingService{
		prices:    make(map[string]domain.PriceUpdate),
		publisher: publisher,
		logger:    logger,
	}
}

// GetPrices returns all current prices in a thread-safe manner.
func (s *pricingService) GetPrices(ctx context.Context) (map[string]domain.PriceUpdate, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Return a copy to prevent race conditions
	snapshot := make(map[string]domain.PriceUpdate, len(s.prices))
	for k, v := range s.prices {
		snapshot[k] = v
	}
	return snapshot, nil
}

// GetPrice returns the price for a specific symbol.
func (s *pricingService) GetPrice(ctx context.Context, symbol string) (domain.PriceUpdate, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	update, ok := s.prices[symbol]
	if !ok {
		return domain.PriceUpdate{}, fmt.Errorf("price not found for symbol: %s", symbol)
	}
	return update, nil
}

// UpdatePrice updates the in-memory cache and publishes the update.
func (s *pricingService) UpdatePrice(ctx context.Context, update domain.PriceUpdate) error {
	// 1. Update In-Memory Cache (Thread Safe)
	s.mu.Lock()
	s.prices[update.Symbol] = update
	s.mu.Unlock()

	// 2. Publish to Bus (Async or Sync depending on requirement, here Sync for simplicity but could be fan-out)
	// In a real high-throughput system, we might push to a channel that the publisher consumes.
	// For this step, we call the publisher directly.
	if s.publisher != nil {
		if err := s.publisher.PublishPriceUpdate(ctx, update); err != nil {
			s.logger.Error("failed to publish price update", zap.Error(err), zap.String("symbol", update.Symbol))
			// We don't return error here because the cache was successfully updated, 
			// and we don't want to break the ingestion flow for a publishing error (resilience).
		}
	}

	return nil
}
