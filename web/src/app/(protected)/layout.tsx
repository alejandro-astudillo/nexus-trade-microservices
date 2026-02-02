'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { getToken } from '@/lib/api';
import { useCurrentUser } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { isLoading: isUserLoading } = useCurrentUser();

  useEffect(() => {
    const token = getToken();
    if (!token && !isLoading) {
      router.push('/login');
    }
  }, [isLoading, router]);

  // Show loading skeleton while checking auth
  if (isLoading || isUserLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-14 border-b border-border/50 px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="flex">
          <div className="flex-1 p-4">
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !getToken()) {
    return null;
  }

  return <>{children}</>;
}
