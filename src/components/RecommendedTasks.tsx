import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, MapPin, Calendar, Clock, RefreshCw, TrendingUp, Star } from 'lucide-react';
import { useTaskRecommendations } from '@/hooks/useTaskRecommendations';
import { format } from 'date-fns';

interface RecommendedTasksProps {
  userId: string;
}

export function RecommendedTasks({ userId }: RecommendedTasksProps) {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isFetching } = useTaskRecommendations(userId);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended For You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data?.recommendations?.length) {
    return null;
  }

  const { recommendations, insight, userStats } = data;

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended For You
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-8"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {insight && (
          <p className="text-sm text-muted-foreground mt-1">{insight}</p>
        )}
        {userStats && userStats.completedTasks > 0 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {userStats.completedTasks} tasks completed
            </span>
            {userStats.avgRating && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {userStats.avgRating.toFixed(1)} avg rating
              </span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className="p-3 bg-background rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => navigate(`/task/${task.id}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{task.title}</h4>
                    <Badge 
                      variant="secondary" 
                      className="bg-primary/10 text-primary text-xs shrink-0"
                    >
                      {task.matchScore}% match
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">${task.pay_amount}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {task.location}
                    </span>
                    {task.scheduled_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.scheduled_date), 'MMM d')}
                      </span>
                    )}
                    {task.estimated_duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {task.estimated_duration}h
                      </span>
                    )}
                  </div>
                  {task.reasons.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      {task.reasons[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {recommendations.length > 5 && (
          <Button 
            variant="ghost" 
            className="w-full mt-3 text-primary"
            onClick={() => navigate('/browse')}
          >
            View all {recommendations.length} recommendations
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
