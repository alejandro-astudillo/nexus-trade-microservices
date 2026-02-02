package messaging

import (
	"context"

	"github.com/nexus-trade/pricing-go/internal/domain"
	"go.uber.org/zap"
)

type LogPublisher struct {
	logger *zap.Logger
}

func NewLogPublisher(logger *zap.Logger) *LogPublisher {
	return &LogPublisher{logger: logger}
}

func (p *LogPublisher) PublishPriceUpdate(ctx context.Context, update domain.PriceUpdate) error {
	return nil
}
