'use client';

import { use } from 'react';
import { Header } from '@/components/layout/Header';
import { CandleChart } from '@/components/trading/CandleChart';
import { PriceTicker } from '@/components/trading/PriceTicker';
import { OrderForm } from '@/components/trading/OrderForm';
import { OrderHistory } from '@/components/trading/OrderHistory';
import { CurrentPrice } from '@/components/trading/PriceTicker';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PortfolioWidget } from '@/components/trading/PortfolioWidget';
import { useTradingStore } from '@/stores';

interface TradingPageProps {
  params: Promise<{ symbol: string }>;
}

export default function TradingPage({ params }: TradingPageProps) {
  const { symbol } = use(params);
  const { selectedResolution, setSelectedResolution } = useTradingStore();

  // Decode the symbol (e.g., BTC-USD)
  const decodedSymbol = decodeURIComponent(symbol);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <PriceTicker />
      
      <main className="flex-1 p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 h-full">
          {/* Left: Chart Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* Symbol Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold">{decodedSymbol}</h1>
                <CurrentPrice symbol={decodedSymbol} />
              </div>
              
              {/* Resolution Tabs */}
              <Tabs
                value={selectedResolution}
                onValueChange={(v) => setSelectedResolution(v as '1m' | '5m' | '1h' | '1d')}
              >
                <TabsList>
                  <TabsTrigger value="1m">1m</TabsTrigger>
                  <TabsTrigger value="5m">5m</TabsTrigger>
                  <TabsTrigger value="1h">1H</TabsTrigger>
                  <TabsTrigger value="1d">1D</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Chart */}
            <div className="h-[400px] lg:h-[500px] bg-card border border-border/50 rounded-lg overflow-hidden">
              <CandleChart symbol={decodedSymbol} />
            </div>

            {/* Order History & Portfolio (Desktop: Below Chart) */}
            <div className="hidden lg:block">
              <Tabs defaultValue="orders" className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <TabsList className="grid w-[300px] grid-cols-2">
                    <TabsTrigger value="orders">Recent Orders</TabsTrigger>
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                  </TabsList>
                </div>
                
                <div className="mt-2">
                  <TabsContent value="orders" className="mt-0">
                    <OrderHistory />
                  </TabsContent>
                  <TabsContent value="portfolio" className="mt-0">
                    <PortfolioWidget />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Right: Order Form */}
          <div className="space-y-4">
            <OrderForm symbol={decodedSymbol} />
            
            {/* Order History (Mobile: Below Order Form) */}
            <div className="lg:hidden">
              <OrderHistory />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
