/**
 * TypeScript interfaces generated from OpenAPI contracts
 * Auto-generated from services' OpenAPI specifications
 */

// ============================================
// Auth & User (wallet-java)
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

// ============================================
// Wallet & Transactions (wallet-java)
// ============================================

export interface WalletDetail {
  id: string;
  currency: 'USD' | 'EUR';
  balance: number;
  updatedAt: string;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'BUY' | 'SELL';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  referenceId?: string;
  createdAt: string;
}

export interface DepositRequest {
  amount: number;
}

// ============================================
// Orders (order-engine-csharp)
// ============================================

export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'MARKET' | 'LIMIT';
export type OrderStatus = 'PENDING' | 'FILLED' | 'REJECTED' | 'CANCELLED';

export interface CreateOrderRequest {
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number; // Required for LIMIT orders
}

export interface OrderResponse {
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  status: OrderStatus;
  quantity: number;
  price?: number;
  executedPrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  items: OrderResponse[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ============================================
// Pricing (pricing-go)
// ============================================

export interface PriceSnapshot {
  symbol: string;
  price: number;
  currency?: string;
  source?: string;
  lastUpdated?: string;
  timestamp?: string;
  change24h?: number;
}

// ============================================
// Market Data & Analytics (analytics-python)
// ============================================

export interface Candle {
  time: number; // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TickerInfo {
  symbol: string;
  changePercent: number;
  lastPrice: number;
}

export interface MarketSummary {
  topGainers: TickerInfo[];
  topLosers: TickerInfo[];
}

export type Resolution = '1m' | '5m' | '1h' | '1d';

export interface HistoryParams {
  symbol: string;
  resolution?: Resolution;
  limit?: number;
}

// ============================================
// Notifications & Alerts (notifier-node)
// ============================================

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  symbol: string;
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  active: boolean;
  createdAt: string;
}

export interface CreateAlertRequest {
  symbol: string;
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
}

// ============================================
// RFC 7807 Error Response
// ============================================

export interface ApiError {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown; // Extension fields
}

// ============================================
// Socket.io Events
// ============================================

export interface PriceUpdateEvent {
  symbol: string;
  price: number;
  timestamp: string;
}

export interface OrderFilledEvent {
  orderId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  executedPrice: number;
}

export interface NotificationEvent {
  id: string;
  type: 'ORDER_FILLED' | 'PRICE_ALERT' | 'SYSTEM';
  title: string;
  message: string;
}
