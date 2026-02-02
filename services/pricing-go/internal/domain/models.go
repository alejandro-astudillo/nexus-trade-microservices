package domain

import "time"

// PriceUpdate represents a price change for an asset.
type PriceUpdate struct {
	Symbol    string    `json:"symbol"`
	Price     float64   `json:"price"`
	Timestamp time.Time `json:"timestamp"`
	Source    string    `json:"source"`
	Change24h float64   `json:"change24h"` // Percentage change in the last 24h
}

// AssetConfig represents configuration for an asset to be tracked.
type AssetConfig struct {
	Symbol string `json:"symbol"`
	Active bool   `json:"active"`
}
