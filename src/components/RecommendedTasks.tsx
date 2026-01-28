import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  Star,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  Thermometer,
  Navigation,
  Zap,
  Leaf
} from 'lucide-react';
import { useTaskRecommendations } from '@/hooks/useTaskRecommendations';
import { format } from 'date-fns';

interface RecommendedTasksProps {
  userId: string;
}

const getWeatherIcon = (condition: string) => {
  switch (condition?.toLowerCase()) {
    case 'rain':
    case 'drizzle':
      return <CloudRain className="h-4 w-4 text-blue-500" />;
    case 'snow':
      return <CloudSnow className="h-4 w-4 text-blue-200" />;
    case 'clouds':
    case 'mist':
      return <Cloud className="h-4 w-4 text-gray-400" />;
    default:
      return <Sun className="h-4 w-4 text-yellow-500" />;
  }
};

const getTagBadge = (tag: string, index: number) => {
  switch (tag) {
    case 'nearby':
      return <Badge key={`tag-${index}-${tag}`} variant="secondary" className="bg-green-500/10 text-green-600 text-xs"><Navigation className="h-3 w-3 mr-1" />Nearby</Badge>;
    case 'weather-ideal':
      return <Badge key={`tag-${index}-${tag}`} variant="secondary" className="bg-blue-500/10 text-blue-600 text-xs"><Cloud className="h-3 w-3 mr-1" />Weather Perfect</Badge>;
    case 'urgent':
      return <Badge key={`tag-${index}-${tag}`} variant="destructive" className="text-xs"><Zap className="h-3 w-3 mr-1" />Urgent</Badge>;
    case 'new':
      return <Badge key={`tag-${index}-${tag}`} variant="secondary" className="bg-purple-500/10 text-purple-600 text-xs"><Sparkles className="h-3 w-3 mr-1" />New</Badge>;
    case 'seasonal':
      return <Badge key={`tag-${index}-${tag}`} variant="secondary" className="bg-orange-500/10 text-orange-600 text-xs"><Leaf className="h-3 w-3 mr-1" />Seasonal</Badge>;
    default:
      return null;
  }
};

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

  if (error || (!data?.recommendations?.length && !data?.nearbyTasks?.length)) {
    return null;
  }

  const { recommendations, nearbyTasks, weatherBased, insight, weather, season, userStats } = data;

  const renderTaskCard = (task: any) => (
    <div
      key={task.id}
      className="p-3 bg-background rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer group"
      onClick={() => navigate(`/task/${task.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">{task.title}</h4>
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary text-xs shrink-0"
            >
              {task.matchScore}% match
            </Badge>
          </div>
          
          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.slice(0, 3).map((tag: string, idx: number) => getTagBadge(tag, idx)).filter(Boolean)}
            </div>
          )}
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="font-semibold text-primary">${task.pay_amount}</span>
            {task.distance !== null && (
              <span className="flex items-center gap-1 text-green-600">
                <Navigation className="h-3 w-3" />
                {task.distance.toFixed(1)}km
              </span>
            )}
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
          {task.reasons && task.reasons.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1 italic line-clamp-1">
              {task.reasons[0]}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            Recommended For You
          </CardTitle>
          <div className="flex items-center gap-2">
            {weather && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                {getWeatherIcon(weather.condition)}
                <Thermometer className="h-3 w-3 ml-1" />
                <span>{Math.round(weather.temperature)}°C</span>
              </div>
            )}
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
        </div>
        
        {/* Weather tip */}
        {weather?.tip && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 p-2 rounded-lg mt-2">
            {getWeatherIcon(weather.condition)}
            <span>{weather.tip}</span>
          </div>
        )}
        
        {insight && (
          <p className="text-sm text-muted-foreground mt-2">{insight}</p>
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
        <Tabs defaultValue="recommended" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="recommended" className="text-xs sm:text-sm">
              <Sparkles className="h-3 w-3 mr-1 hidden sm:inline" />
              For You
            </TabsTrigger>
            <TabsTrigger value="nearby" className="text-xs sm:text-sm">
              <Navigation className="h-3 w-3 mr-1 hidden sm:inline" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="weather" className="text-xs sm:text-sm">
              {getWeatherIcon(weather?.condition || 'clear')}
              <span className="ml-1">Weather</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended" className="space-y-3">
            {recommendations && recommendations.length > 0 ? (
              <>
                {recommendations.slice(0, 5).map(renderTaskCard)}
                {recommendations.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-primary"
                    onClick={() => navigate('/browse')}
                  >
                    View all {recommendations.length} recommendations
                  </Button>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No personalized recommendations yet. Complete more tasks to get better matches!
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="nearby" className="space-y-3">
            {nearbyTasks && nearbyTasks.length > 0 ? (
              <>
                {nearbyTasks.slice(0, 5).map(renderTaskCard)}
                {nearbyTasks.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-primary"
                    onClick={() => navigate('/browse')}
                  >
                    View all {nearbyTasks.length} nearby tasks
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <Navigation className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Enable location access to see tasks near you
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="weather" className="space-y-3">
            {weather && (
              <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg mb-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {getWeatherIcon(weather.condition)}
                </div>
                <div>
                  <p className="font-medium capitalize">{weather.description || weather.condition}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Thermometer className="h-3 w-3" />
                    {Math.round(weather.temperature)}°C
                    {season && <span className="ml-2 capitalize">• {season}</span>}
                  </p>
                </div>
              </div>
            )}
            
            {weatherBased && weatherBased.length > 0 ? (
              <>
                <p className="text-xs text-muted-foreground mb-2">
                  Tasks perfect for today's weather conditions:
                </p>
                {weatherBased.slice(0, 5).map(renderTaskCard)}
              </>
            ) : (
              <div className="text-center py-4">
                <Cloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No weather-specific recommendations available
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
