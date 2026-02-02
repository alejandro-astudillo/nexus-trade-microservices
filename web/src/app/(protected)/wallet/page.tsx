'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useWallet, useTransactions, useDeposit } from '@/hooks/useWallet';
import { Transaction } from '@/types/api';
import { cn } from '@/lib/utils';

// ============================================
// Deposit Schema
// ============================================

const depositSchema = z.object({
  amount: z.number().min(1, 'Minimum deposit is $1').max(1000000, 'Maximum deposit is $1,000,000'),
});

type DepositFormData = z.infer<typeof depositSchema>;

// ============================================
// Wallet Page
// ============================================

export default function WalletPage() {
  const [depositOpen, setDepositOpen] = useState(false);
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const deposit = useDeposit();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepositFormData>({
    resolver: zodResolver(depositSchema),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const onDeposit = async (data: DepositFormData) => {
    try {
      await deposit.mutateAsync({ amount: data.amount });
      toast.success('Deposit successful!', {
        description: `${formatCurrency(data.amount)} has been added to your wallet.`,
      });
      reset();
      setDepositOpen(false);
    } catch {
      // Error handled by interceptor
    }
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return <Plus className="w-4 h-4" />;
      case 'WITHDRAWAL':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'BUY':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'SELL':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Balance Card */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardHeader>
              <CardDescription>Available Balance</CardDescription>
              {walletLoading ? (
                <Skeleton className="h-12 w-48" />
              ) : (
                <CardTitle className="text-4xl font-bold">
                  {formatCurrency(wallet?.balance || 0)}
                </CardTitle>
              )}
            </CardHeader>
            <CardContent>
              <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>
                      Add virtual funds to your trading account. This is paper trading
                      simulation money.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onDeposit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        {...register('amount', { valueAsNumber: true })}
                        className={errors.amount ? 'border-destructive' : ''}
                      />
                      {errors.amount && (
                        <p className="text-xs text-destructive">{errors.amount.message}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {[100, 500, 1000, 5000].map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => reset({ amount })}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={deposit.isPending}
                    >
                      {deposit.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Deposit Funds
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent wallet activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {txLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !transactions || !Array.isArray(transactions) || transactions.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No transactions yet</p>
                    <p className="text-sm">Add funds to get started</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/30">
                    {transactions.map((tx: Transaction) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center',
                              tx.type === 'DEPOSIT' && 'bg-green-500/10 text-green-500',
                              tx.type === 'WITHDRAWAL' && 'bg-red-500/10 text-red-500',
                              tx.type === 'BUY' && 'bg-blue-500/10 text-blue-500',
                              tx.type === 'SELL' && 'bg-purple-500/10 text-purple-500'
                            )}
                          >
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium">{tx.type}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(tx.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              'font-semibold',
                              tx.type === 'DEPOSIT' && 'text-green-500',
                              tx.type === 'SELL' && 'text-green-500',
                              tx.type === 'WITHDRAWAL' && 'text-red-500',
                              tx.type === 'BUY' && 'text-red-500'
                            )}
                          >
                            {tx.type === 'DEPOSIT' || tx.type === 'SELL' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
