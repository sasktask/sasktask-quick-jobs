import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, PieChartIcon, BarChart3, LineChartIcon } from 'lucide-react';
import { format, subDays, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  payout_amount: number;
  status: string;
  escrow_status: string | null;
  created_at: string;
  task: {
    title: string;
    category: string;
  } | null;
}

interface EarningsAnalyticsProps {
  transactions: Transaction[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function EarningsAnalytics({ transactions }: EarningsAnalyticsProps) {
  const weeklyData = useMemo(() => {
    const weeks: { name: string; earnings: number; tasks: number }[] = [];
    
    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = endOfWeek(subDays(new Date(), i * 7));
      
      const weekEarnings = transactions
        .filter(tx => {
          const txDate = parseISO(tx.created_at);
          return isWithinInterval(txDate, { start: weekStart, end: weekEnd }) &&
                 tx.escrow_status === 'released';
        })
        .reduce((sum, tx) => sum + (tx.payout_amount || 0), 0);
      
      const weekTasks = transactions.filter(tx => {
        const txDate = parseISO(tx.created_at);
        return isWithinInterval(txDate, { start: weekStart, end: weekEnd }) &&
               tx.escrow_status === 'released';
      }).length;
      
      weeks.push({
        name: format(weekStart, 'MMM d'),
        earnings: weekEarnings,
        tasks: weekTasks
      });
    }
    
    return weeks;
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months: { name: string; earnings: number; tasks: number }[] = [];
    
    for (let i = 11; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = endOfMonth(subMonths(new Date(), i));
      
      const monthEarnings = transactions
        .filter(tx => {
          const txDate = parseISO(tx.created_at);
          return isWithinInterval(txDate, { start: monthStart, end: monthEnd }) &&
                 tx.escrow_status === 'released';
        })
        .reduce((sum, tx) => sum + (tx.payout_amount || 0), 0);
      
      const monthTasks = transactions.filter(tx => {
        const txDate = parseISO(tx.created_at);
        return isWithinInterval(txDate, { start: monthStart, end: monthEnd }) &&
               tx.escrow_status === 'released';
      }).length;
      
      months.push({
        name: format(monthStart, 'MMM'),
        earnings: monthEarnings,
        tasks: monthTasks
      });
    }
    
    return months;
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};
    
    transactions
      .filter(tx => tx.escrow_status === 'released' && tx.task?.category)
      .forEach(tx => {
        const cat = tx.task?.category || 'Other';
        categories[cat] = (categories[cat] || 0) + (tx.payout_amount || 0);
      });
    
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [transactions]);

  const totalThisMonth = monthlyData[monthlyData.length - 1]?.earnings || 0;
  const totalLastMonth = monthlyData[monthlyData.length - 2]?.earnings || 0;
  const monthlyGrowth = totalLastMonth > 0 
    ? ((totalThisMonth - totalLastMonth) / totalLastMonth * 100).toFixed(1)
    : totalThisMonth > 0 ? '100' : '0';
  const isPositiveGrowth = parseFloat(monthlyGrowth) >= 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Earnings Analytics
            </CardTitle>
            <CardDescription>Track your earnings trends and category breakdown</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {isPositiveGrowth ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={isPositiveGrowth ? 'text-green-600' : 'text-red-600'}>
              {monthlyGrowth}% vs last month
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="gap-2">
              <LineChartIcon className="h-4 w-4" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-2">
              <PieChartIcon className="h-4 w-4" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weekly" className="space-y-4">
            <div className="h-[300px]">
              {weeklyData.some(d => d.earnings > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
                    />
                    <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No earnings data available for the past 8 weeks
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="h-[300px]">
              {monthlyData.some(d => d.earnings > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
                    />
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#earningsGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No earnings data available for the past 12 months
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-[250px]">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    No category data available
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Top Categories</h4>
                {categoryData.length > 0 ? (
                  categoryData.map((cat, index) => (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <span className="font-medium">${cat.value.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No earnings by category yet</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
