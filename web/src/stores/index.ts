import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, WalletDetail } from '@/types/api';

/**
 * Global application state using Zustand
 * Persisted to localStorage where appropriate
 */

// ============================================
// Auth Store
// ============================================

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'nexus-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ============================================
// Wallet Store
// ============================================

interface WalletState {
  wallet: WalletDetail | null;
  setWallet: (wallet: WalletDetail | null) => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  wallet: null,
  setWallet: (wallet) => set({ wallet }),
}));

// ============================================
// Trading Store
// ============================================

interface TradingState {
  selectedSymbol: string;
  selectedResolution: '1m' | '5m' | '1h' | '1d';
  setSelectedSymbol: (symbol: string) => void;
  setSelectedResolution: (resolution: '1m' | '5m' | '1h' | '1d') => void;
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set) => ({
      selectedSymbol: 'BTC-USD',
      selectedResolution: '1h',
      setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol }),
      setSelectedResolution: (selectedResolution) => set({ selectedResolution }),
    }),
    {
      name: 'nexus-trading',
    }
  )
);

// ============================================
// UI Store
// ============================================

interface UIState {
  sidebarOpen: boolean;
  orderFormOpen: boolean;
  depositModalOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setOrderFormOpen: (open: boolean) => void;
  setDepositModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  orderFormOpen: false,
  depositModalOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setOrderFormOpen: (orderFormOpen) => set({ orderFormOpen }),
  setDepositModalOpen: (depositModalOpen) => set({ depositModalOpen }),
}));

// ============================================
// Prices Store (Real-time)
// ============================================

interface PricesState {
  prices: Record<string, number>;
  updatePrice: (symbol: string, price: number) => void;
  setPrices: (prices: Record<string, number>) => void;
}

export const usePricesStore = create<PricesState>((set) => ({
  prices: {},
  updatePrice: (symbol, price) =>
    set((state) => ({
      prices: { ...state.prices, [symbol]: price },
    })),
  setPrices: (prices) => set({ prices }),
}));
