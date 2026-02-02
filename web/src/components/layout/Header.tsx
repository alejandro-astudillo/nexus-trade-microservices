'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Wallet,
  Activity,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore, useWalletStore } from '@/stores';
import { useLogout } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useTheme } from '@/components/ThemeProvider';

// ============================================
// Navigation Header Component
// ============================================

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { wallet } = useWalletStore();
  const logout = useLogout();
  const { theme, toggleTheme } = useTheme();
  
  // Fetch wallet on mount
  useWallet();

  const navItems = [
    { label: 'Trade', href: '/trade/BTC-USD', icon: TrendingUp },
    { label: 'Wallet', href: '/wallet', icon: Wallet },
    { label: 'System', href: '/system', icon: Activity },
  ];

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(balance);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-14 border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-8">
          <Link href="/trade/BTC-USD" className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-chart-1 to-chart-2">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline">
              NexusTrade
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href.split('/').slice(0, 2).join('/'));
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Balance & User */}
        <div className="flex items-center gap-4">
          {/* Balance */}
          {wallet && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-sm">
                {formatBalance(wallet.balance)}
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="w-9 h-9"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 pl-2 pr-3">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-chart-1 to-chart-2 text-white">
                    {user ? getInitials(user.fullName) : 'G'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">
                  {user?.fullName || 'Guest'}
                </span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.fullName || 'Guest'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/wallet" className="cursor-pointer">
                  <Wallet className="w-4 h-4 mr-2" />
                  Wallet
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/system" className="cursor-pointer">
                  <Activity className="w-4 h-4 mr-2" />
                  System Status
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
