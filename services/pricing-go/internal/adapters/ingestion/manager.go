package ingestion

import (
	"math/rand"
	"time"

	"github.com/nexus-trade/pricing-go/internal/domain"
	"go.uber.org/zap"
)

type MockIngestionManager struct {
	logger *zap.Logger
	assets []string
	stopCh chan struct{}
}

func NewMockIngestionManager(logger *zap.Logger) *MockIngestionManager {
	return &MockIngestionManager{
		logger: logger,
		assets: []string{"BTC-USD", "ETH-USD", "SOL-USD", "ADA-USD", "XRP-USD"}, // Mock assets with correct format
		stopCh: make(chan struct{}),
	}
}

func (m *MockIngestionManager) Start(outputChan chan<- domain.PriceUpdate) {
	m.logger.Info("Starting Mock Ingestion Manager")

	// Spawn a worker for each asset (Fan-In Pattern)
	for _, asset := range m.assets {
		go m.simulateAssetStream(asset, outputChan)
	}
}

func (m *MockIngestionManager) Stop() {
	close(m.stopCh)
	m.logger.Info("Stopping Mock Ingestion Manager")
}

func (m *MockIngestionManager) simulateAssetStream(symbol string, out chan<- domain.PriceUpdate) {
	ticker := time.NewTicker(time.Duration(500+rand.Intn(1500)) * time.Millisecond)
	defer ticker.Stop()

	// Initial price
	price := 1000.0 + rand.Float64()*50000.0
	if symbol == "BTC-USD" {
		price = 65000.0
	} else if symbol == "ETH-USD" {
		price = 3500.0
	}

	for {
		select {
		case <-m.stopCh:
			return
		case <-ticker.C:
			// Random walk price update
			change := (rand.Float64() - 0.5) * (price * 0.002) // 0.2% volatility
			price += change

			update := domain.PriceUpdate{
				Symbol:    symbol,
				Price:     price,
				Timestamp: time.Now(),
				Source:    "mock-exchange",
			}

			out <- update
		}
	}
}
