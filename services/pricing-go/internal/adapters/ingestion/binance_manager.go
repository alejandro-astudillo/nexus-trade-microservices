package ingestion

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/nexus-trade/pricing-go/internal/domain"
	"go.uber.org/zap"
)


type BinanceIngestionManager struct {
	logger        *zap.Logger
	assets        map[string]string // Map internal symbol (BTC-USD) to Binance symbol (btcusdt)
	stopCh        chan struct{}
	wg            sync.WaitGroup
	conn          *websocket.Conn
	mu            sync.Mutex
	reconnectBackoff time.Duration
}

type BinanceCombinedMessage struct {
	Stream string                 `json:"stream"`
	Data   map[string]interface{} `json:"data"`
}

func parseFloat(v interface{}) float64 {
	switch val := v.(type) {
	case float64:
		return val
	case string:
		f, _ := strconv.ParseFloat(val, 64)
		return f
	default:
		return 0
	}
}

func NewBinanceIngestionManager(logger *zap.Logger) *BinanceIngestionManager {
	// Map internal symbols to Binance symbols
	// Assuming USDT pairs for USD representation
	assets := map[string]string{
		"BTC-USD": "btcusdt",
		"ETH-USD": "ethusdt",
		"SOL-USD": "solusdt",
		"ADA-USD": "adausdt",
		"XRP-USD": "xrpusdt",
	}

	return &BinanceIngestionManager{
		logger:           logger,
		assets:           assets,
		stopCh:           make(chan struct{}),
		reconnectBackoff: 1 * time.Second,
	}
}

func (m *BinanceIngestionManager) Start(outputChan chan<- domain.PriceUpdate) {
	m.logger.Info("Starting Binance Ingestion Manager")

	m.wg.Add(1)
	go m.connectAndListen(outputChan)
}

func (m *BinanceIngestionManager) Stop() {
	m.logger.Info("Stopping Binance Ingestion Manager")
	close(m.stopCh)
	
	m.mu.Lock()
	if m.conn != nil {
		m.conn.Close()
	}
	m.mu.Unlock()
	
	m.wg.Wait()
}

func (m *BinanceIngestionManager) connectAndListen(outputChan chan<- domain.PriceUpdate) {
	defer m.wg.Done()

	for {
		select {
		case <-m.stopCh:
			return
		default:
			if err := m.connect(); err != nil {
				m.logger.Error("Failed to connect to Binance", zap.Error(err))
				time.Sleep(m.reconnectBackoff)
				m.reconnectBackoff *= 2
				if m.reconnectBackoff > 30*time.Second {
					m.reconnectBackoff = 30 * time.Second
				}
				continue
			}

			m.reconnectBackoff = 1 * time.Second // Reset backoff on success
			m.listen(outputChan)
		}
	}
}

func (m *BinanceIngestionManager) connect() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	var streams []string
	for _, binanceSymbol := range m.assets {
		streams = append(streams, fmt.Sprintf("%s@ticker", binanceSymbol))
	}
	
	url := fmt.Sprintf("wss://stream.binance.com:9443/stream?streams=%s", strings.Join(streams, "/"))
	
	m.logger.Info("Connecting to Binance WebSocket", zap.String("url", url))

	conn, _, err := websocket.DefaultDialer.Dial(url, nil)
	if err != nil {
		return err
	}

	m.conn = conn
	return nil
}

func (m *BinanceIngestionManager) listen(outputChan chan<- domain.PriceUpdate) {
	defer func() {
		m.mu.Lock()
		if m.conn != nil {
			m.conn.Close()
			m.conn = nil
		}
		m.mu.Unlock()
	}()

	for {
		select {
		case <-m.stopCh:
			return
		default:
			_, message, err := m.conn.ReadMessage()
			if err != nil {
				m.logger.Error("Error reading from WebSocket", zap.Error(err))
				return // Return to trigger reconnection loop
			}

			// We use a map for the 'data' field because fields can be strings or floats
			var combined BinanceCombinedMessage
			if err := json.Unmarshal(message, &combined); err != nil {
				continue
			}

			data := combined.Data
			if data == nil {
				continue
			}

			// Mapping fields from the Binance 24hr ticker event
			// s: Symbol, c: Last Price, P: Price Change Percent, E: Event Time
			symbol, _ := data["s"].(string)
			lastPriceRaw := data["c"]
			pricePctRaw := data["P"]
			eventTimeRaw, _ := data["E"].(float64)

			internalSymbol := m.getInternalSymbol(symbol)
			if internalSymbol == "" {
				continue
			}

			price := parseFloat(lastPriceRaw)
			changePct := parseFloat(pricePctRaw)

			update := domain.PriceUpdate{
				Symbol:    internalSymbol,
				Price:     price,
				Timestamp: time.UnixMilli(int64(eventTimeRaw)),
				Source:    "Binance",
				Change24h: changePct,
			}

			outputChan <- update
		}
	}
}

func (m *BinanceIngestionManager) getInternalSymbol(binanceSymbol string) string {
	// binanceSymbol comes in uppercase from the event (e.g., "BTCUSDT")
	binanceSymbol = strings.ToLower(binanceSymbol)
	for k, v := range m.assets {
		if v == binanceSymbol {
			return k
		}
	}
	return ""
}
