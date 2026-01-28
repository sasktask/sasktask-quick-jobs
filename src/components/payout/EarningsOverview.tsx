import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EarningsSummary } from '@/hooks/usePayoutData';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  ArrowUpRight,
  Wallet
} from 'lucide-react';

interface EarningsOverviewProps {
  summary: EarningsSummary;
  growthPercentage: number;
}

export function EarningsOverview({ summary, growthPercentage }: EarningsOverviewProps) {
  const stats = [
    {
      label: 'Available Balance',
      value: summary.inEscrow,
      icon: Wallet,
      description: 'Ready to cash out',
      highlight: true,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      label: 'Total Earned',
      value: summary.totalEarnings,
      icon: DollarSign,
      description: 'Lifetime earnings',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    },
    {
      label: 'This Month',
      value: summary.thisMonthEarnings,
      icon: TrendingUp,
      description: growthPercentage > 0 ? `+${growthPercentage.toFixed(0)}% from last month` : 'Same as last month',
      trend: growthPercentage,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10'
    },
    {
      label: 'Avg Per Task',
      value: summary.averageTaskValue,
      icon: CheckCircle,
      description: 'Per completed task',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10'
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Available for Cashout</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold tracking-tight text-foreground">
                  ${summary.inEscrow.toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground">CAD</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last updated just now
              </p>
            </div>
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index} 
              className={`${stat.highlight ? 'border-primary/30 bg-primary/5' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  {stat.trend !== undefined && stat.trend > 0 && (
                    <Badge className="ml-auto text-xs bg-green-500/10 text-green-600 border-green-500/20">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      {stat.trend.toFixed(0)}%
                    </Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">
                  ${stat.value.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
