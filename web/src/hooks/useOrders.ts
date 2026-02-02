'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { ORDER_ENDPOINTS } from '@/lib/api';
import { CreateOrderRequest, OrderResponse, OrderListResponse, OrderStatus } from '@/types/api';

/**
 * Order hooks using TanStack Query
 */

// ============================================
// Fetch Orders List
// ============================================

interface OrdersParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
}

export function useOrders(params: OrdersParams = {}) {
  const { page = 1, pageSize = 20, status } = params;

  return useQuery({
    queryKey: ['orders', { page, pageSize, status }],
    queryFn: async () => {
      const response = await api.get<OrderListResponse>(ORDER_ENDPOINTS.LIST, {
        params: { page, pageSize, status },
      });
      return response.data;
    },
    staleTime: 1000 * 5, // 5 seconds - orders need to be fresh
  });
}

// ============================================
// Fetch Single Order
// ============================================

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get<OrderResponse>(ORDER_ENDPOINTS.BY_ID(orderId));
      return response.data;
    },
    enabled: !!orderId,
  });
}

// ============================================
// Create Order Mutation
// ============================================

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (order: CreateOrderRequest) => {
      const response = await api.post<OrderResponse>(ORDER_ENDPOINTS.CREATE, order);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Also invalidate wallet since balance may have changed
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
}

// ============================================
// Cancel Order Mutation
// ============================================

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      await api.delete(ORDER_ENDPOINTS.BY_ID(orderId));
    },
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
  });
}
