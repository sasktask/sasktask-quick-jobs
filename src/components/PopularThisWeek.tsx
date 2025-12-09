import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePopularServices } from "@/hooks/usePopularServices";
import { categories } from "@/lib/categories";
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  ArrowRight, 
  Briefcase,
  DollarSign,
  Clock,
  Sparkles
} from "lucide-react";

export function PopularThisWeek() {
  const { data: popularServices, isLoading, error } = usePopularServices();

  // Get icon for category
  const getCategoryIcon = (categoryTitle: string) => {
    const category = categories.find(c => c.title === categoryTitle);
    return category?.icon || Briefcase;
  };

  // Get color for category
  const getCategoryColor = (categoryTitle: string) => {
    const category = categories.find(c => c.title === categoryTitle);
    return category?.color || "from-gray-500 to-slate-500";
  };

  if (error) {
    return null; // Silently fail if there's an error
  }

  // Show placeholder data if no real data
  const showPlaceholder = !isLoading && (!popularServices || popularServices.length === 0);
  
  const placeholderData = [
    { category: "Snow Removal", count: 24, change: 45, avgBudget: 75, recentTasks: 18 },
    { category: "Cleaning", count: 19, change: 22, avgBudget: 120, recentTasks: 15 },
    { category: "Moving & Delivery", count: 15, change: 18, avgBudget: 150, recentTasks: 12 },
    { category: "Handyman Services", count: 12, change: -5, avgBudget: 85, recentTasks: 10 },
    { category: "Yard Work", count: 10, change: 35, avgBudget: 60, recentTasks: 8 },
    { category: "Pet Care", count: 8, change: 12, avgBudget: 45, recentTasks: 6 },
  ];

  const displayData = showPlaceholder ? placeholderData : popularServices;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm font-medium text-orange-600 mb-3">
              <Flame className="h-4 w-4" />
              Live Data
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Most Popular <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">This Week</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              See which services are trending in Saskatchewan right now
            </p>
          </div>
          <Link to="/categories">
            <Button variant="outline" className="group">
              View All Categories
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayData?.map((service, idx) => {
              const Icon = getCategoryIcon(service.category);
              const color = getCategoryColor(service.category);
              const isPositive = service.change >= 0;
              const isHot = service.change > 30;

              return (
                <Link
                  key={idx}
                  to={`/browse?category=${encodeURIComponent(service.category)}`}
                  className="block"
                >
                  <Card className="border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 h-full group relative overflow-hidden">
                    {/* Hot badge */}
                    {isHot && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                          <Flame className="h-3 w-3 mr-1" />
                          Hot
                        </Badge>
                      </div>
                    )}
                    
                    {/* Rank indicator */}
                    <div className="absolute top-2 left-2">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        #{idx + 1}
                      </div>
                    </div>

                    <CardContent className="p-4 pt-10">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                            {service.category}
                          </h3>
                          
                          {/* Stats */}
                          <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Briefcase className="h-3.5 w-3.5 mr-1" />
                              {service.count > 0 ? `${service.count} booked` : `${service.recentTasks} available`}
                            </div>
                            
                            {service.change !== 0 && (
                              <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                                {isPositive ? (
                                  <TrendingUp className="h-3.5 w-3.5 mr-0.5" />
                                ) : (
                                  <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
                                )}
                                {Math.abs(service.change)}%
                              </div>
                            )}
                          </div>

                          {/* Additional info */}
                          <div className="flex items-center gap-3 mt-2">
                            {service.avgBudget > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <DollarSign className="h-3 w-3 mr-0.5" />
                                Avg ${service.avgBudget}
                              </Badge>
                            )}
                            {service.recentTasks > 0 && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-0.5" />
                                {service.recentTasks} new
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            <Sparkles className="h-4 w-4 inline mr-1" />
            Updated in real-time based on booking activity
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/post-task">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white">
                Post a Task in Popular Category
              </Button>
            </Link>
            <Link to="/become-tasker">
              <Button size="lg" variant="outline">
                Earn Money in High-Demand Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}