'use client';

import { io, Socket } from 'socket.io-client';
import { PriceUpdateEvent, OrderFilledEvent, NotificationEvent } from '@/types/api';

/**
 * Socket.io client for real-time updates
 * Manages WebSocket connection to Notifier service
 */

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost';
const SOCKET_PATH = '/api/stream/socket.io';

let socket: Socket | null = null;

export interface SocketEvents {
  onPriceUpdate?: (data: PriceUpdateEvent) => void;
  onOrderFilled?: (data: OrderFilledEvent) => void;
  onNotification?: (data: NotificationEvent) => void;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: Error) => void;
}

export const connectSocket = (token: string, events: SocketEvents = {}): Socket => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Connection events
  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
    events.onConnect?.();
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
    events.onDisconnect?.(reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket] Connection error:', error);
    events.onError?.(error);
  });

  // Business events
  socket.on('price:update', (data: PriceUpdateEvent) => {
    events.onPriceUpdate?.(data);
  });

  socket.on('order:filled', (data: OrderFilledEvent) => {
    events.onOrderFilled?.(data);
  });

  socket.on('notification', (data: NotificationEvent) => {
    events.onNotification?.(data);
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = (): Socket | null => socket;

export const subscribeToSymbol = (symbol: string): void => {
  socket?.emit('subscribe:symbol', { symbol });
};

export const unsubscribeFromSymbol = (symbol: string): void => {
  socket?.emit('unsubscribe:symbol', { symbol });
};

const socketClient = {
  connect: connectSocket,
  disconnect: disconnectSocket,
  getSocket,
  subscribeToSymbol,
  unsubscribeFromSymbol,
};

export default socketClient;
