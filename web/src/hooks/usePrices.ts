'use client';

import { useQuery } from '@tanstack/react-query';
import api, { PRICE_ENDPOINTS, MARKET_ENDPOINTS } from '@/lib/api';
import { PriceSnapshot, Candle, MarketSummary, HistoryParams } from '@/types/api';
import { usePricesStore } from '@/stores';
import { useEffect } from 'react';

/**
 * Price and market data hooks using TanStack Query
 */

// ============================================
// Fetch All Prices
// ============================================

export function usePrices() {
  const { setPrices } = usePricesStore();

  const query = useQuery({
    queryKey: ['prices'],
    queryFn: async () => {
      // API returns object like {"BTC-USD": { "price": 64930.31, "change24h": -1.5, ... }, ...}
      const response = await api.get<Record<string, PriceSnapshot>>(PRICE_ENDPOINTS.LIST);
      const priceMap = response.data;
      
      // Transform to array format for components
      const pricesArray: PriceSnapshot[] = Object.entries(priceMap).map(([symbol, data]) => ({
        ...data,
        symbol,
      }));
      
      return pricesArray;
    },
    staleTime: 0, 
    refetchInterval: 1000, 
  });

  // Sync to Zustand store
  useEffect(() => {
    if (query.data) {
      const priceMap = query.data.reduce(
        (acc, p) => ({ ...acc, [p.symbol]: p.price }),
        {} as Record<string, number>
      );
      setPrices(priceMap);
    }
  }, [query.data, setPrices]);

  return query;
}

// ============================================
// Fetch Single Price
// ============================================

export function usePrice(symbol: string) {
  return useQuery({
    queryKey: ['price', symbol],
    queryFn: async () => {
      const response = await api.get<PriceSnapshot>(PRICE_ENDPOINTS.BY_SYMBOL(symbol));
      return response.data;
    },
    enabled: !!symbol,
    staleTime: 1000 * 5,
  });
}

// ============================================
// Fetch Historical Candles
// ============================================

// API response format from Python backend
interface ApiCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  resolution: string;
}

export function useMarketHistory(params: HistoryParams) {
  const { symbol, resolution = '1h', limit = 100 } = params;

  return useQuery({
    queryKey: ['market', 'history', { symbol, resolution, limit }],
    queryFn: async () => {
      const response = await api.get<ApiCandle[]>(MARKET_ENDPOINTS.HISTORY, {
        params: { symbol, resolution, limit },
      });
      
      // Transform timestamp to time (unix seconds) for lightweight-charts
      const candles: Candle[] = response.data.map((c) => ({
        time: Math.floor(new Date(c.timestamp).getTime() / 1000),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      }));
      
      return candles;
    },
    enabled: !!symbol,
    staleTime: 1000 * 30, // 30 seconds for historical data
  });
}

// ============================================
// Fetch Market Summary
// ============================================

export function useMarketSummary() {
  return useQuery({
    queryKey: ['market', 'summary'],
    queryFn: async () => {
      const response = await api.get<MarketSummary>(MARKET_ENDPOINTS.SUMMARY);
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
