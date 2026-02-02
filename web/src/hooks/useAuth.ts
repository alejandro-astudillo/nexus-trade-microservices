'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { AUTH_ENDPOINTS, setToken, removeToken, getToken } from '@/lib/api';
import { useAuthStore } from '@/stores';
import { LoginRequest, RegisterRequest, TokenResponse, User } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

/**
 * Authentication hooks using TanStack Query
 */

// ============================================
// Fetch Current User
// ============================================

export function useCurrentUser() {
  const { setUser, setLoading } = useAuthStore();

  const query = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      const token = getToken();
      if (!token) {
        return null;
      }
      try {
        const response = await api.get<User>(AUTH_ENDPOINTS.ME);
        return response.data;
      } catch (error) {
        removeToken();
        throw error;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Sync state with store
  useEffect(() => {
    if (!getToken()) {
      setUser(null);
      return;
    }

    if (query.isLoading) {
      setLoading(true);
    } else if (query.isSuccess) {
      setUser(query.data);
    } else if (query.isError) {
      setUser(null);
    }
  }, [query.isLoading, query.isSuccess, query.isError, query.data, setUser, setLoading]);

  return query;
}

// ============================================
// Login Mutation
// ============================================

export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await api.post<TokenResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
      return response.data;
    },
    onSuccess: async (data) => {
      setToken(data.accessToken);
      // Fetch user profile after login
      const userResponse = await api.get<User>(AUTH_ENDPOINTS.ME);
      setUser(userResponse.data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      router.push('/trade/BTC-USD');
    },
  });
}

// ============================================
// Register Mutation
// ============================================

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      await api.post(AUTH_ENDPOINTS.REGISTER, data);
    },
    onSuccess: () => {
      router.push('/login?registered=true');
    },
  });
}

// ============================================
// Logout
// ============================================

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const router = useRouter();

  return useCallback(() => {
    removeToken();
    logout();
    queryClient.clear();
    router.push('/login');
  }, [logout, queryClient, router]);
}

// ============================================
// Demo Login (Guest Mode)
// ============================================

export function useDemoLogin() {
  const login = useLogin();

  return useMutation({
    mutationFn: async () => {
      // Hardcoded demo credentials
      const demoCredentials: LoginRequest = {
        email: 'guest@nexustrade.com',
        password: 'guestPassword123',
      };
      return login.mutateAsync(demoCredentials);
    },
  });
}

// ============================================
// Auth Guard Hook
// ============================================

export function useAuthGuard() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    // Wait for store hydration
    if (isLoading) return;

    if (!isAuthenticated && !token) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router, token]);

  return { isAuthenticated, isLoading: isLoading || (!isAuthenticated && !!token) };
}
