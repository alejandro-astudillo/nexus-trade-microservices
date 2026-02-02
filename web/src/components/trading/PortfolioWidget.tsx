'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function PortfolioWidget() {
  const { data: portfolio, isLoading } = usePortfolio();

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatPercent = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(val / 100);

  if (isLoading) {
    return (
      <Card className="h-full border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="w-24 h-4" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-border/50">
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Your Portfolio
          </CardTitle>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {formatCurrency(portfolio.totalValue)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[250px] p-4">
          {portfolio.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
              <Briefcase className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm">No assets found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolio.items.map((item) => {
                const isPositive = item.unrealizedPnL >= 0;
                return (
                  <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-sm tracking-tight">{item.symbol}</span>
                      <span className="text-xs text-muted-foreground">{item.quantity.toFixed(4)} @ {formatCurrency(item.averageBuyPrice)}</span>
                    </div>
                    
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-semibold text-sm">{formatCurrency(item.totalValue)}</span>
                      <div className={cn("flex items-center text-xs font-medium", isPositive ? "text-green-500" : "text-red-500")}>
                        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {formatCurrency(item.unrealizedPnL)} ({item.unrealizedPnLPercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        {portfolio.items.length > 0 && (
          <div className="border-t border-border/30 p-3 bg-muted/10 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Total PnL</span>
            <span className={cn("font-semibold", portfolio.totalUnrealizedPnL >= 0 ? "text-green-500" : "text-red-500")}>
              {portfolio.totalUnrealizedPnL >= 0 ? "+" : ""}{formatCurrency(portfolio.totalUnrealizedPnL)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
