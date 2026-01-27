import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Briefcase, 
  Home, 
  Truck, 
  Wrench,
  Sparkles,
  ShoppingBag,
  MoreHorizontal
} from 'lucide-react';

interface CategoryEarning {
  category: string;
  amount: number;
  taskCount: number;
  color: string;
}

interface EarningsBreakdownProps {
  categoryEarnings: CategoryEarning[];
  totalEarnings: number;
}

const categoryIcons: Record<string, any> = {
  'Cleaning': Sparkles,
  'Moving': Truck,
  'Handyman': Wrench,
  'Delivery': ShoppingBag,
  'Home Repair': Home,
  'Professional': Briefcase,
  'Other': MoreHorizontal,
};

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142, 76%, 36%)',
  'hsl(217, 91%, 60%)',
  'hsl(262, 83%, 58%)',
  'hsl(25, 95%, 53%)',
  'hsl(346, 77%, 49%)',
  'hsl(var(--muted-foreground))',
];

export function EarningsBreakdown({ categoryEarnings, totalEarnings }: EarningsBreakdownProps) {
  const sortedCategories = [...categoryEarnings].sort((a, b) => b.amount - a.amount);
  const topCategories = sortedCategories.slice(0, 5);
  
  const chartData = topCategories.map((cat, index) => ({
    name: cat.category,
    value: cat.amount,
    color: COLORS[index % COLORS.length],
  }));

  // Group remaining into "Other"
  if (sortedCategories.length > 5) {
    const otherTotal = sortedCategories.slice(5).reduce((sum, cat) => sum + cat.amount, 0);
    if (otherTotal > 0) {
      chartData.push({
        name: 'Other',
        value: otherTotal,
        color: COLORS[6],
      });
    }
  }

  if (categoryEarnings.length === 0 || totalEarnings === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <PieChart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Earnings Breakdown</h3>
          <p className="text-muted-foreground text-sm">
            Complete tasks to see your earnings by category
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg">Earnings by Category</CardTitle>
            <CardDescription>See where your income comes from</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            {topCategories.map((category, index) => {
              const Icon = categoryIcons[category.category] || MoreHorizontal;
              const percentage = (category.amount / totalEarnings) * 100;
              
              return (
                <div key={category.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{category.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {category.taskCount} tasks
                      </Badge>
                      <span className="text-sm font-semibold">${category.amount.toFixed(0)}</span>
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-1.5"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performer Badge */}
        {topCategories.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              {(() => {
                const TopIcon = categoryIcons[topCategories[0].category] || MoreHorizontal;
                return <TopIcon className="h-4 w-4 text-primary" />;
              })()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Top Earning Category</p>
              <p className="text-xs text-muted-foreground">
                {topCategories[0].category} • ${topCategories[0].amount.toFixed(2)} earned
              </p>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {((topCategories[0].amount / totalEarnings) * 100).toFixed(0)}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
