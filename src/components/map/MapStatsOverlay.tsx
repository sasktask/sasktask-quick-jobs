import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  DollarSign,
  Zap,
  Clock,
  Users,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  pay_amount: number;
  priority?: string;
  category: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

interface MapStatsOverlayProps {
  tasks: Task[];
  radiusKm: number;
  isConnected: boolean;
  className?: string;
}

export function MapStatsOverlay({ 
  tasks, 
  radiusKm, 
  isConnected,
  className 
}: MapStatsOverlayProps) {
  const stats = useMemo(() => {
    const tasksWithLocation = tasks.filter(t => t.latitude && t.longitude);
    const totalValue = tasksWithLocation.reduce((sum, t) => sum + t.pay_amount, 0);
    const avgPay = tasksWithLocation.length > 0 ? totalValue / tasksWithLocation.length : 0;
    const urgentCount = tasksWithLocation.filter(t => t.priority === 'urgent').length;
    const premiumCount = tasksWithLocation.filter(t => t.pay_amount >= 100).length;
    
    // Calculate trend (mock - in real app would compare to previous period)
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const trendValue = Math.floor(Math.random() * 20) + 1;

    // Recent tasks (last hour mock)
    const recentCount = Math.floor(Math.random() * 5) + 1;

    return {
      total: tasksWithLocation.length,
      avgPay: Math.round(avgPay),
      urgentCount,
      premiumCount,
      trend,
      trendValue,
      recentCount,
      density: (tasksWithLocation.length / (Math.PI * radiusKm * radiusKm)).toFixed(2),
    };
  }, [tasks, radiusKm]);

  const statItems = [
    {
      icon: MapPin,
      label: 'Tasks',
      value: stats.total.toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: DollarSign,
      label: 'Avg Pay',
      value: `$${stats.avgPay}`,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      icon: Zap,
      label: 'Urgent',
      value: stats.urgentCount.toString(),
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Premium',
      value: stats.premiumCount.toString(),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-background/90 backdrop-blur-sm shadow-lg p-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Live updates' : 'Connecting...'}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {radiusKm}km radius
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className={`h-8 w-8 mx-auto rounded-lg ${stat.bgColor} flex items-center justify-center mb-1`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-sm font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Trend</span>
          </div>
          <div className="flex items-center gap-1">
            {stats.trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs font-medium ${
              stats.trend === 'up' ? 'text-green-500' : 'text-red-500'
            }`}>
              {stats.trendValue}% {stats.trend === 'up' ? 'more' : 'less'} today
            </span>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentCount > 0 && (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Recent</span>
            </div>
            <Badge variant="secondary" className="text-xs animate-pulse">
              +{stats.recentCount} in last hour
            </Badge>
          </div>
        )}

        {/* Density */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Density</span>
          </div>
          <span className="text-xs font-medium">{stats.density} tasks/km²</span>
        </div>
      </Card>
    </motion.div>
  );
}
