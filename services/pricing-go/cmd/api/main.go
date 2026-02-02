package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/nexus-trade/pricing-go/internal/adapters/config"
	httpAdapter "github.com/nexus-trade/pricing-go/internal/adapters/http"
	"github.com/nexus-trade/pricing-go/internal/adapters/ingestion"
	"github.com/nexus-trade/pricing-go/internal/adapters/messaging"
	"github.com/nexus-trade/pricing-go/internal/core/services"
	"github.com/nexus-trade/pricing-go/internal/domain"
	"go.uber.org/zap"
)

func main() {
	// 1. Initialize Logger
	logger, _ := zap.NewProduction()
	defer logger.Sync()
	logger.Info("Starting Pricing Service")

	// 2. Load Configuration
	cfg, err := config.Load()
	if err != nil {
		logger.Fatal("Failed to load config", zap.Error(err))
	}

	// 3. Initialize Adapters & Core
	// Driven Adapters
	publisher := messaging.NewLogPublisher(logger)

	// Core Service
	pricingService := services.NewPricingService(publisher, logger)

	// Driving Adapters (HTTP)
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS()) // Allow frontend access

	// API Versioning
	v1 := e.Group("/v1")

	handler := httpAdapter.NewHandler(pricingService)
	handler.RegisterRoutes(v1)

	// Driving Adapters (Ingestion)
	// Create the channel for updates (Buffered for performance)
	updates := make(chan domain.PriceUpdate, 1000)
	// ingestionManager := ingestion.NewMockIngestionManager(logger)
	ingestionManager := ingestion.NewBinanceIngestionManager(logger)

	// 4. Start Ingestion & Processing Loop
	// Start the workers (Producers)
	ingestionManager.Start(updates)

	// Start the consumer (The "Broadcaster Routine")
	go func() {
		logger.Info("Starting Price Update Consumer")
		for update := range updates {
			// This calls Core Logic: internal cache update + publish event
			if err := pricingService.UpdatePrice(context.Background(), update); err != nil {
				logger.Error("Failed to update price", zap.Error(err))
			}
		}
	}()

	// 5. Start HTTP Server
	go func() {
		if err := e.Start(":" + cfg.ServerPort); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Shutting down server", zap.Error(err))
		}
	}()

	// 6. Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down service...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	ingestionManager.Stop()
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
	logger.Info("Service stopped")
}
