import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Target,
  Sparkles,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface WeeklyData {
  week: string;
  earnings: number;
}

interface EarningsProjectionProps {
  historicalData: WeeklyData[];
  averageWeeklyEarnings: number;
  projectedMonthlyEarnings: number;
  bestWeek: number;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

export function EarningsProjection({
  historicalData,
  averageWeeklyEarnings,
  projectedMonthlyEarnings,
  bestWeek,
  trend,
  trendPercentage
}: EarningsProjectionProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Target;
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground';
  const trendBg = trend === 'up' ? 'bg-green-500/10' : trend === 'down' ? 'bg-red-500/10' : 'bg-muted';

  // Generate projection data (next 4 weeks)
  const projectionData = [...historicalData];
  const lastValue = historicalData.length > 0 ? historicalData[historicalData.length - 1].earnings : averageWeeklyEarnings;
  const weeklyGrowth = trend === 'up' ? 1.05 : trend === 'down' ? 0.95 : 1;
  
  for (let i = 1; i <= 4; i++) {
    projectionData.push({
      week: `+${i}w`,
      earnings: Math.round(lastValue * Math.pow(weeklyGrowth, i)),
    });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Earnings Projection</CardTitle>
              <CardDescription>Based on your recent performance</CardDescription>
            </div>
          </div>
          <Badge className={`${trendBg} ${trendColor} border-0 gap-1`}>
            {trend === 'up' ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : trend === 'down' ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : null}
            {trendPercentage > 0 ? '+' : ''}{trendPercentage}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Projection Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              ${averageWeeklyEarnings.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Avg/Week</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 text-center border border-primary/20">
            <p className="text-2xl font-bold text-primary">
              ${projectedMonthlyEarnings.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Monthly Est.</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-foreground">
              ${bestWeek.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground">Best Week</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[180px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
              <defs>
                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${value}`}
                width={50}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#earningsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Projection Note */}
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-muted-foreground">
            {trend === 'up' 
              ? `At this pace, you could earn $${(projectedMonthlyEarnings * 12).toFixed(0)} this year!`
              : trend === 'down'
              ? 'Complete more tasks to improve your projection'
              : 'Keep up the consistent work!'
            }
          </p>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className="text-muted-foreground">
              {trend === 'up' ? 'Growing trend' : trend === 'down' ? 'Declining trend' : 'Stable earnings'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-muted-foreground">
              {Math.round(projectedMonthlyEarnings / averageWeeklyEarnings)} weeks/month
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
