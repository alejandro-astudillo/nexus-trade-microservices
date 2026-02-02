'use client';

import { formatDistanceToNow } from 'date-fns';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrders, useCancelOrder } from '@/hooks/useOrders';
import { OrderResponse, OrderStatus } from '@/types/api';
import { cn } from '@/lib/utils';

// ============================================
// Order History Component
// ============================================

export function OrderHistory() {
  const { data, isLoading } = useOrders({ pageSize: 10 });
  const cancelOrder = useCancelOrder();

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'FILLED':
        return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'CANCELLED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      default:
        return '';
    }
  };

  const handleCancel = async (orderId: string) => {
    try {
      await cancelOrder.mutateAsync(orderId);
      toast.success('Order cancelled');
    } catch {
      // Error handled by interceptor
    }
  };

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const orders = data?.items || [];

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          {orders.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p>No orders yet</p>
              <p className="text-sm">Place your first trade to see it here</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {orders.map((order: OrderResponse) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onCancel={handleCancel}
                  isCancelling={cancelOrder.isPending}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ============================================
// Order Row Component
// ============================================

interface OrderRowProps {
  order: OrderResponse;
  onCancel: (orderId: string) => void;
  isCancelling: boolean;
  getStatusColor: (status: OrderStatus) => string;
}

function OrderRow({ order, onCancel, isCancelling, getStatusColor }: OrderRowProps) {
  const isBuy = order.side === 'BUY';

  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-1 h-10 rounded-full',
            isBuy ? 'bg-green-500' : 'bg-red-500'
          )}
        />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{order.symbol}</span>
            <Badge
              variant="outline"
              className={cn('text-xs', getStatusColor(order.status))}
            >
              {order.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={isBuy ? 'text-green-500' : 'text-red-500'}>
              {order.side}
            </span>
            <span>•</span>
            <span>{order.quantity}</span>
            <span>•</span>
            <span>
              {formatDistanceToNow(
                new Date(order.createdAt.endsWith('Z') || order.createdAt.includes('+') ? order.createdAt : `${order.createdAt}Z`),
                { addSuffix: true }
              )}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right flex flex-col items-end">
          <p className="font-bold text-sm sm:text-base tracking-tight">
            ${(order.quantity * (order.executedPrice || order.price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">{order.type}</p>
        </div>
        {order.status === 'PENDING' && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onCancel(order.id)}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
