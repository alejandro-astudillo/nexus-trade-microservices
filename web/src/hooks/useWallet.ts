'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { WALLET_ENDPOINTS } from '@/lib/api';
import { WalletDetail, Transaction, DepositRequest } from '@/types/api';
import { useWalletStore } from '@/stores';
import { useEffect } from 'react';

/**
 * Wallet hooks using TanStack Query
 */

// ============================================
// Fetch Wallet
// ============================================

export function useWallet() {
  const { setWallet } = useWalletStore();

  const query = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: async () => {
      const response = await api.get<WalletDetail>(WALLET_ENDPOINTS.MY_WALLET);
      return response.data;
    },
    staleTime: 1000 * 10, // 10 seconds
  });

  // Sync to Zustand store
  useEffect(() => {
    if (query.data) {
      setWallet(query.data);
    }
  }, [query.data, setWallet]);

  return query;
}

// ============================================
// Fetch Transactions
// ============================================

interface TransactionsParams {
  page?: number;
  size?: number;
}

// Spring Page response format
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export function useTransactions(params: TransactionsParams = {}) {
  const { page = 0, size = 20 } = params;

  return useQuery({
    queryKey: ['transactions', { page, size }],
    queryFn: async () => {
      const response = await api.get<PageResponse<Transaction> | Transaction[]>(
        WALLET_ENDPOINTS.TRANSACTIONS,
        { params: { page, size } }
      );
      
      const data = response.data;
      
      // Handle both paginated (Spring Page) and array responses
      if (Array.isArray(data)) {
        return data;
      }
      
      // Spring Page format - extract content
      if (data && typeof data === 'object' && 'content' in data) {
        return data.content;
      }
      
      return [];
    },
  });
}

// ============================================
// Deposit Mutation
// ============================================

export function useDeposit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DepositRequest) => {
      const response = await api.post<WalletDetail>(WALLET_ENDPOINTS.DEPOSIT, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
