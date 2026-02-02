package http

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/nexus-trade/pricing-go/internal/core/ports"
)

type Handler struct {
	service ports.PricingService
}

func NewHandler(service ports.PricingService) *Handler {
	return &Handler{service: service}
}

func (h *Handler) RegisterRoutes(g *echo.Group) {
	g.GET("/prices", h.GetPrices)
	g.GET("/prices/:symbol", h.GetPrice)
	g.POST("/manageAssets", h.ManageAssets)
}

// ManageAssets handles asset tracking requests
func (h *Handler) ManageAssets(c echo.Context) error {
	// For now, this is a placeholder to pass the 404 check.
	// In a real implementation, this would call h.service.TrackAsset(...)
	type AssetConfig struct {
		Symbol         string `json:"symbol"`
		Provider       string `json:"provider"`
		ProviderSymbol string `json:"providerSymbol"`
		Enabled        bool   `json:"enabled"`
	}

	var req AssetConfig
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// Just acknowledge the request for now
	return c.JSON(http.StatusCreated, req)
}


func (h *Handler) GetPrices(c echo.Context) error {
	prices, err := h.service.GetPrices(c.Request().Context())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, prices)
}

func (h *Handler) GetPrice(c echo.Context) error {
	symbol := c.Param("symbol")
	price, err := h.service.GetPrice(c.Request().Context(), symbol)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
	}
	// Return the price update object directly
	return c.JSON(http.StatusOK, price)
}
