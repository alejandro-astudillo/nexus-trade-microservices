'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { usePrices } from '@/hooks/usePrices';
import { usePricesStore, useTradingStore } from '@/stores';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ============================================
// Price Ticker Component
// ============================================

export function PriceTicker() {
  const { data: prices, isLoading } = usePrices();
  const { selectedSymbol, setSelectedSymbol } = useTradingStore();



  if (isLoading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto py-2 px-4 border-b border-border/30">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-28 flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!prices || !Array.isArray(prices) || prices.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-4 border-b border-border/30 scrollbar-thin scrollbar-thumb-muted">
      {prices.map((price) => {
        const isSelected = price.symbol === selectedSymbol;
        const changePercent = price.change24h || 0;
        const isPositive = changePercent >= 0;

        return (
          <Link
            key={price.symbol}
            href={`/trade/${price.symbol}`}
            onClick={() => setSelectedSymbol(price.symbol)}
            className={cn(
              'flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 cursor-pointer hover:bg-muted/50',
              isSelected
                ? 'border-chart-1/50 bg-chart-1/10'
                : 'border-transparent'
            )}
          >
            <div className="flex flex-col">
              <span className="text-xs font-medium">{price.symbol}</span>
              <span className="text-sm font-semibold">
                ${price.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium',
                isPositive
                  ? 'text-green-500 border-green-500/30 bg-green-500/10'
                  : 'text-red-500 border-red-500/30 bg-red-500/10'
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%
            </Badge>
          </Link>
        );
      })}
    </div>
  );
}

// ============================================
// Current Price Display
// ============================================

interface CurrentPriceProps {
  symbol: string;
}

export function CurrentPrice({ symbol }: CurrentPriceProps) {
  const { prices } = usePricesStore();
  const currentPrice = prices[symbol];

  if (!currentPrice) {
    return <Skeleton className="h-8 w-32" />;
  }

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold">
        ${currentPrice.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
      <span className="text-sm text-muted-foreground">USD</span>
    </div>
  );
}
