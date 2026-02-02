'use client';

import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickSeries, CandlestickData, Time } from 'lightweight-charts';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketHistory } from '@/hooks/usePrices';
import { usePricesStore, useTradingStore } from '@/stores';
import { Candle } from '@/types/api';

interface CandleChartProps {
  symbol: string;
}

export function CandleChart({ symbol }: CandleChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const { selectedResolution } = useTradingStore();
  const { prices } = usePricesStore();

  const { data: candles, isLoading, error } = useMarketHistory({
    symbol,
    resolution: selectedResolution,
    limit: 200,
  });

  // Initialize chart - recreate when symbol or resolution changes
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          style: 2,
        },
        horzLine: {
          color: 'rgba(255, 255, 255, 0.2)',
          width: 1,
          style: 2,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: {
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: false,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [symbol, selectedResolution]);

  // Update chart data when candles arrive
  useEffect(() => {
    if (!seriesRef.current || !candles || candles.length === 0) return;

    const chartData: CandlestickData<Time>[] = candles.map((candle: Candle) => ({
      time: candle.time as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(chartData);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  // Real-time price updates
  useEffect(() => {
    if (!seriesRef.current || !prices[symbol]) return;

    const currentPrice = prices[symbol];
    const lastCandle = candles?.[candles.length - 1];

    if (lastCandle) {
      // Update the last candle with real-time price
      seriesRef.current.update({
        time: lastCandle.time as Time,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, currentPrice),
        low: Math.min(lastCandle.low, currentPrice),
        close: currentPrice,
      });
    }
  }, [prices, symbol, candles]);

  return (
    <div className="w-full h-full relative">
      {/* Always render the chart container */}
      <div ref={chartContainerRef} className="w-full h-full" />
      
      {/* Overlay loading/error states */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-muted-foreground">
          <p>Failed to load chart data</p>
        </div>
      )}
      
      {!isLoading && !error && (!candles || candles.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-muted-foreground">
          <p>No chart data available</p>
        </div>
      )}
    </div>
  );
}
