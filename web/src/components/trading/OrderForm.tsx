'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateOrder } from '@/hooks/useOrders';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWalletStore, usePricesStore } from '@/stores';
import { OrderSide, OrderType } from '@/types/api';
import { cn } from '@/lib/utils';

// ============================================
// Validation Schema
// ============================================

const orderSchema = z.object({
  quantity: z.number().min(0.000001, 'Minimum quantity is 0.000001'),
  price: z.number().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

// ============================================
// Order Form Component
// ============================================

interface OrderFormProps {
  symbol: string;
}

export function OrderForm({ symbol }: OrderFormProps) {
  const [side, setSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const { wallet } = useWalletStore();
  const { prices } = usePricesStore();
  const { data: portfolio } = usePortfolio();
  const createOrder = useCreateOrder();

  const currentPrice = prices[symbol] || 0;
  // properties that we need to find the asset in the portfolio
  const asset = portfolio?.items.find((item) => item.symbol === symbol);
  const assetBalance = asset?.quantity || 0;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 0,
      price: undefined,
    },
  });

  const quantity = watch('quantity') || 0;
  const totalCost = quantity * currentPrice;

  // Check balance based on side
  const hasSufficientBalance = side === 'BUY'
    ? (wallet?.balance || 0) >= totalCost
    : assetBalance >= quantity;

  const onSubmit = async (data: OrderFormData) => {
    if (!hasSufficientBalance) {
      toast.error('Insufficient balance', {
        description: side === 'BUY'
          ? 'You do not have enough funds to complete this order.'
          : `You do not have enough ${symbol.split('-')[0]} to sell.`,
      });
      return;
    }

    try {
      await createOrder.mutateAsync({
        symbol,
        side,
        type: orderType,
        quantity: data.quantity,
        price: orderType === 'LIMIT' ? data.price : undefined,
      });
      toast.success('Order placed successfully!', {
        description: `${side} ${data.quantity} ${symbol.split('-')[0]} at ${orderType === 'MARKET' ? 'market price' : data.price}`,
      });
      setValue('quantity', 0);
    } catch {
      // Error is handled by the API interceptor
    }
  };

  const setPercentage = (percent: number) => {
    if (!wallet || currentPrice === 0) return;

    let maxQuantity = 0;
    if (side === 'BUY') {
      maxQuantity = (wallet.balance * percent) / 100 / currentPrice;
    } else {
      maxQuantity = (assetBalance * percent) / 100;
    }
    
    // Round down to avoid floating point issues exceeding balance
    setValue('quantity', Math.floor(maxQuantity * 1000000) / 1000000);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Place Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Buy/Sell Toggle */}
        <Tabs value={side} onValueChange={(v) => {
          setSide(v as OrderSide);
          setValue('quantity', 0); // Reset quantity when switching sides
        }} className="w-full">
          <TabsList className="w-full h-10">
            <TabsTrigger
              value="BUY"
              className={cn(
                'flex-1 data-[state=active]:bg-green-500 data-[state=active]:text-white'
              )}
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="SELL"
              className={cn(
                'flex-1 data-[state=active]:bg-red-500 data-[state=active]:text-white'
              )}
            >
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Order Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={orderType === 'MARKET' ? 'secondary' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setOrderType('MARKET')}
          >
            Market
          </Button>
          <Button
            variant={orderType === 'LIMIT' ? 'secondary' : 'outline'}
            size="sm"
            className="flex-1"
            onClick={() => setOrderType('LIMIT')}
          >
            Limit
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Price (for limit orders) */}
          {orderType === 'LIMIT' && (
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder={currentPrice.toString()}
                {...register('price', { valueAsNumber: true })}
              />
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.000001"
              placeholder="0.00"
              {...register('quantity', { valueAsNumber: true })}
              className={errors.quantity ? 'border-destructive' : ''}
            />
            {errors.quantity && (
              <p className="text-xs text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <Button
                key={percent}
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setPercentage(percent)}
              >
                {percent}%
              </Button>
            ))}
          </div>

          {/* Order Summary */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Market Price</span>
              <span className="font-medium">${currentPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">${totalCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Available</span>
              <span className={cn(
                'font-medium',
                !hasSufficientBalance && 'text-destructive'
              )}>
                {side === 'BUY' 
                  ? `$${wallet?.balance.toLocaleString() || '0.00'}`
                  : `${assetBalance.toFixed(6)} ${symbol.split('-')[0]}`
                }
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className={cn(
              'w-full h-11 text-white font-semibold',
              side === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            )}
            disabled={createOrder.isPending || !hasSufficientBalance}
          >
            {createOrder.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            {side === 'BUY' ? 'Buy' : 'Sell'} {symbol.split('-')[0]}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
