import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  Wallet, 
  Calendar, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { EarningsSummary } from '@/hooks/usePayoutData';

interface PayoutStatsGridProps {
  summary: EarningsSummary;
  growthPercentage: number;
}

export function PayoutStatsGrid({ summary, growthPercentage }: PayoutStatsGridProps) {
  const isPositiveGrowth = growthPercentage >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Earnings */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20 hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">${summary.totalEarnings.toFixed(2)}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle className="h-3 w-3" />
                <span>{summary.completedTasks} tasks paid</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In Escrow */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">In Escrow</p>
              <p className="text-2xl font-bold text-blue-600">${summary.inEscrow.toFixed(2)}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{summary.pendingPayouts} pending</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* This Month */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">${summary.thisMonthEarnings.toFixed(2)}</p>
              <div className="flex items-center gap-1">
                {isPositiveGrowth ? (
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs font-medium ${isPositiveGrowth ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(growthPercentage).toFixed(1)}% vs last month
                </span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Task Value */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Avg. Task Value</p>
              <p className="text-2xl font-bold">${summary.averageTaskValue.toFixed(2)}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                <span>{summary.lifetimeTasks} lifetime tasks</span>
              </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
