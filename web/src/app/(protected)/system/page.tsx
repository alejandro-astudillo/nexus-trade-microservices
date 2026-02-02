'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, TrendingUp, Wallet, Database, Activity, Bell } from 'lucide-react';
import axios from 'axios';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ============================================
// Service Configuration
// ============================================

interface ServiceConfig {
  name: string;
  description: string;
  healthUrl: string;
  icon: React.ElementType;
  color: string;
  technology: string;
}

const services: ServiceConfig[] = [
  {
    name: 'Pricing Service',
    description: 'Real-time market data ingestion via WebSockets',
    healthUrl: '/api/prices/v1/prices',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    technology: 'Go + Redis',
  },
  {
    name: 'Wallet Service',
    description: 'User authentication and balance management',
    healthUrl: '/api/wallet/v1/wallets/me',
    icon: Wallet,
    color: 'from-green-500 to-emerald-500',
    technology: 'Java + PostgreSQL',
  },
  {
    name: 'Order Engine',
    description: 'High-performance order execution with CQRS',
    healthUrl: '/api/orders/v1/orders',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    technology: 'C# .NET + SQL Server',
  },
  {
    name: 'Analytics Service',
    description: 'Historical data and ML-based predictions',
    healthUrl: '/api/market/v1/summary',
    icon: Activity,
    color: 'from-orange-500 to-yellow-500',
    technology: 'Python + MongoDB',
  },
  {
    name: 'Notifier Service',
    description: 'Real-time notifications via Socket.io',
    healthUrl: '/api/stream/v1/notifications',
    icon: Bell,
    color: 'from-red-500 to-rose-500',
    technology: 'Node.js + RabbitMQ',
  },
];

// ============================================
// Service Status Type
// ============================================

type ServiceStatus = 'checking' | 'online' | 'offline';

interface ServiceHealth {
  status: ServiceStatus;
  latency?: number;
}

// ============================================
// System Health Page
// ============================================

export default function SystemPage() {
  const [healthStatus, setHealthStatus] = useState<Record<string, ServiceHealth>>({});

  useEffect(() => {
    const checkHealth = async () => {
      const results: Record<string, ServiceHealth> = {};

      await Promise.all(
        services.map(async (service) => {
          const start = Date.now();
          try {
            await axios.get(service.healthUrl, { 
              timeout: 5000,
              validateStatus: (status) => status < 500,
            });
            results[service.name] = {
              status: 'online',
              latency: Date.now() - start,
            };
          } catch {
            results[service.name] = {
              status: 'offline',
            };
          }
        })
      );

      setHealthStatus(results);
    };

    // Initialize as checking
    services.forEach((service) => {
      setHealthStatus((prev) => ({
        ...prev,
        [service.name]: { status: 'checking' },
      }));
    });

    checkHealth();

    // Poll every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const onlineCount = Object.values(healthStatus).filter((h) => h.status === 'online').length;
  const totalCount = services.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Overview Card */}
          <Card className="border-border/50 bg-gradient-to-br from-card to-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Health Monitor
              </CardTitle>
              <CardDescription>
                Real-time status of NexusTrade microservices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'text-5xl font-bold',
                    onlineCount === totalCount ? 'text-green-500' : 'text-yellow-500'
                  )}
                >
                  {onlineCount}/{totalCount}
                </div>
                <div className="text-muted-foreground">
                  <p>Services Online</p>
                  <p className="text-sm">
                    {onlineCount === totalCount
                      ? 'All systems operational'
                      : 'Some services may be experiencing issues'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => {
              const health = healthStatus[service.name] || { status: 'checking' };
              const Icon = service.icon;

              return (
                <Card
                  key={service.name}
                  className={cn(
                    'border-border/50 transition-all',
                    health.status === 'online' && 'hover:border-green-500/50',
                    health.status === 'offline' && 'border-red-500/50 bg-red-500/5'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br',
                            service.color
                          )}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {service.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {health.status === 'checking' ? (
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : health.status === 'online' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        {health.latency && (
                          <span className="text-xs text-muted-foreground">
                            {health.latency}ms
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {service.technology}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          health.status === 'online' && 'text-green-500 border-green-500/30',
                          health.status === 'offline' && 'text-red-500 border-red-500/30',
                          health.status === 'checking' && 'text-muted-foreground'
                        )}
                      >
                        {health.status === 'checking' ? 'Checking...' : health.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Architecture Info */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Architecture Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                NexusTrade is a polyglot microservices platform demonstrating enterprise-grade
                architecture patterns including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Event-driven architecture with RabbitMQ</li>
                <li>CQRS pattern in the Order Engine</li>
                <li>Real-time data streaming via WebSockets</li>
                <li>API Gateway pattern with NGINX</li>
                <li>Polyglot persistence (PostgreSQL, MongoDB, Redis, SQL Server)</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
