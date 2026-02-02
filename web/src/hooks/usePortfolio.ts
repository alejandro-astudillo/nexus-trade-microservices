'use client';

import { useQuery } from '@tanstack/react-query';
import { useOrders } from './useOrders';
import { usePricesStore } from '@/stores';
import { OrderResponse } from '@/types/api';

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  averageBuyPrice: number;
  currentPrice: number;
  totalValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalUnrealizedPnL: number;
  items: PortfolioItem[];
}

export function usePortfolio() {
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ pageSize: 1000, status: 'FILLED' }); // Fetch all filled orders
  const { prices } = usePricesStore();

  const isLoading = ordersLoading;

  const portfolio = useQuery({
    queryKey: ['portfolio', ordersData, prices],
    queryFn: () => {
      if (!ordersData?.items) return { totalValue: 0, totalUnrealizedPnL: 0, items: [] };

      // Group orders by symbol
      const holdings: Record<string, { quantity: number; costBasis: number }> = {};

      ordersData.items.forEach((order: OrderResponse) => {
        if (order.status !== 'FILLED') return;

        if (!holdings[order.symbol]) {
          holdings[order.symbol] = { quantity: 0, costBasis: 0 };
        }

        const executedPrice = order.executedPrice || order.price || 0;
        const total = order.quantity * executedPrice;

        if (order.side === 'BUY') {
          holdings[order.symbol].quantity += order.quantity;
          holdings[order.symbol].costBasis += total;
        } else if (order.side === 'SELL') {
          // Simplistic FIFO/Average Cost logic for reduction
          // Reducing quantity and proportional cost basis
          const costPerUnit = holdings[order.symbol].quantity > 0 
            ? holdings[order.symbol].costBasis / holdings[order.symbol].quantity 
            : 0;
            
          holdings[order.symbol].quantity -= order.quantity;
          holdings[order.symbol].costBasis -= (order.quantity * costPerUnit);
        }
      });

      // Calculate stats
      const items: PortfolioItem[] = Object.entries(holdings)
        .filter(([_, data]) => data.quantity > 0.000001) // Filter out dust
        .map(([symbol, data]) => {
          const currentPrice = prices[symbol] || 0;
          const totalValue = data.quantity * currentPrice;
          const averageBuyPrice = data.quantity > 0 ? data.costBasis / data.quantity : 0;
          const unrealizedPnL = totalValue - data.costBasis;
          const unrealizedPnLPercent = data.costBasis > 0 ? (unrealizedPnL / data.costBasis) * 100 : 0;

          return {
            symbol,
            quantity: data.quantity,
            averageBuyPrice,
            currentPrice,
            totalValue,
            unrealizedPnL,
            unrealizedPnLPercent,
          };
        })
        .sort((a, b) => b.totalValue - a.totalValue);

      const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
      const totalUnrealizedPnL = items.reduce((sum, item) => sum + item.unrealizedPnL, 0);

      const summary: PortfolioSummary = {
        totalValue,
        totalUnrealizedPnL,
        items,
      };

      return summary;
    },
    enabled: !!ordersData,
    initialData: { totalValue: 0, totalUnrealizedPnL: 0, items: [] },
  });

  return { ...portfolio, isLoading: isLoading || portfolio.isLoading };
}
