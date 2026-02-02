'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Rocket, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useLogin, useDemoLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores';
import { getToken } from '@/lib/api';

// ============================================
// Validation Schema
// ============================================

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// Search Params Handler (inside Suspense)
// ============================================

function RegistrationToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast.success('Account created successfully!', {
        description: 'Please log in with your credentials.',
      });
    }
  }, [searchParams]);

  return null;
}

// ============================================
// Login Form Component
// ============================================

function LoginForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const login = useLogin();
  const demoLogin = useDemoLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Check if already authenticated
  useEffect(() => {
    const token = getToken();
    if (isAuthenticated || token) {
      router.push('/trade/BTC-USD');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    await login.mutateAsync(data);
  };

  const handleDemoLogin = async () => {
    await demoLogin.mutateAsync();
  };

  return (
    <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-chart-1 to-chart-2">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">NexusTrade</span>
        </div>
        <div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Sign in to access your trading dashboard</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Demo Login Button */}
        <Button
          variant="outline"
          className="w-full h-12 text-base gap-2 border-chart-1/50 hover:bg-chart-1/10 hover:border-chart-1 transition-all"
          onClick={handleDemoLogin}
          disabled={demoLogin.isPending}
        >
          {demoLogin.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Rocket className="w-5 h-5" />
          )}
          <span>Try Demo Account</span>
        </Button>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
            OR
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="trader@nexustrade.com"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isSubmitting || login.isPending}
          >
            {login.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Sign In
          </Button>
        </form>

        {/* Register Link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-medium">
            Create one
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

// ============================================
// Login Page with Suspense Boundary
// ============================================

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-chart-1/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-chart-2/10 rounded-full blur-3xl" />
      </div>

      {/* Suspense for useSearchParams */}
      <Suspense fallback={null}>
        <RegistrationToast />
      </Suspense>

      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

// ============================================
// Loading Skeleton
// ============================================

function LoginFormSkeleton() {
  return (
    <Card className="w-full max-w-md relative z-10 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-4">
        <Skeleton className="h-12 w-40 mx-auto" />
        <Skeleton className="h-6 w-32 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-px w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
