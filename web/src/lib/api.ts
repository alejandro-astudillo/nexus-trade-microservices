import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { ApiError } from '@/types/api';

/**
 * Axios instance configured for NexusTrade API
 * - Base URL from environment
 * - JWT token injection
 * - RFC 7807 error handling
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';

// Token storage key
const TOKEN_KEY = 'nexus_token';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ============================================
// Token Management
// ============================================

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

// ============================================
// Request Interceptor - Add Auth Header
// ============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// Response Interceptor - Handle RFC 7807 Errors
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const apiError = error.response?.data;
    const status = error.response?.status;

    // Handle RFC 7807 error format
    if (apiError && typeof apiError === 'object') {
      const title = apiError.title || 'Error';
      const detail = apiError.detail || error.message || 'An unexpected error occurred';

      // Show toast notification
      toast.error(title, {
        description: detail,
      });

      // Handle 401 - Clear token and redirect to login
      if (status === 401) {
        removeToken();
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    } else {
      // Fallback for non-RFC 7807 errors
      const message = error.message || 'Network error';
      toast.error('Error', {
        description: message,
      });
    }

    return Promise.reject(error);
  }
);

// ============================================
// API Endpoints
// ============================================

export const AUTH_ENDPOINTS = {
  LOGIN: '/api/wallet/v1/auth/login',
  REGISTER: '/api/wallet/v1/auth/register',
  ME: '/api/wallet/v1/users/me',
} as const;

export const WALLET_ENDPOINTS = {
  MY_WALLET: '/api/wallet/v1/wallets/me',
  TRANSACTIONS: '/api/wallet/v1/wallets/me/transactions',
  DEPOSIT: '/api/wallet/v1/wallets/me/deposit',
} as const;

export const ORDER_ENDPOINTS = {
  LIST: '/api/orders/v1/orders',
  CREATE: '/api/orders/v1/orders',
  BY_ID: (id: string) => `/api/orders/v1/orders/${id}`,
} as const;

export const PRICE_ENDPOINTS = {
  LIST: '/api/prices/v1/prices',
  BY_SYMBOL: (symbol: string) => `/api/prices/v1/prices/${symbol}`,
} as const;

export const MARKET_ENDPOINTS = {
  HISTORY: '/api/market/v1/history',
  SUMMARY: '/api/market/v1/summary',
} as const;

export const ANALYTICS_ENDPOINTS = {
  PREDICT: (symbol: string) => `/api/analytics/v1/predict/${symbol}`,
  PORTFOLIO_RISK: '/api/analytics/v1/portfolio/risk',
} as const;

export const STREAM_ENDPOINTS = {
  NOTIFICATIONS: '/api/stream/v1/notifications',
  ALERTS: '/api/stream/v1/alerts',
  ALERT_BY_ID: (id: string) => `/api/stream/v1/alerts/${id}`,
} as const;

export default api;
