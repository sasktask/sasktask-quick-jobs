import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Star, CheckCircle, Loader2, Brain, Trophy, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Match {
  tasker_id: string;
  fit_score: number;
  reasoning: string;
  key_strengths: string[];
  tasker: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    rating: number | null;
    total_reviews: number | null;
    completed_tasks: number | null;
    skills: string[] | null;
    hourly_rate: number | null;
  };
}

interface AISmartMatchProps {
  taskId: string;
  onSelectTasker?: (taskerId: string) => void;
}

export function AISmartMatch({ taskId, onSelectTasker }: AISmartMatchProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const findMatches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-task-matching', {
        body: { taskId }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setMatches(data.matches || []);
      setHasSearched(true);

      if (data.matches?.length === 0) {
        toast({
          title: 'No Matches Found',
          description: 'No available taskers match your requirements right now.',
        });
      }
    } catch (error: any) {
      console.error('AI matching error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to find matches',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/10';
    if (score >= 60) return 'bg-yellow-500/10';
    return 'bg-orange-500/10';
  };

  if (!hasSearched) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">AI Smart Match</h3>
          <p className="text-muted-foreground mb-4">
            Let our AI find the perfect taskers for your job based on skills, ratings, and availability.
          </p>
          <Button onClick={findMatches} disabled={isLoading} className="gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Find Best Matches
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Recommended Taskers
        </CardTitle>
        <Button variant="outline" size="sm" onClick={findMatches} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground">Finding the best matches...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No matching taskers available right now.</p>
          </div>
        ) : (
          matches.map((match, index) => (
            <div
              key={match.tasker_id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                index === 0 ? 'border-primary/50 bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Rank badge */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {index === 0 ? <Trophy className="h-4 w-4" /> : index + 1}
                </div>

                {/* Avatar */}
                <Avatar className="h-12 w-12">
                  <AvatarImage src={match.tasker.avatar_url || undefined} />
                  <AvatarFallback>
                    {match.tasker.full_name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold">{match.tasker.full_name || 'Tasker'}</h4>
                    {match.tasker.rating && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span>{match.tasker.rating.toFixed(1)}</span>
                        {match.tasker.total_reviews && (
                          <span className="text-muted-foreground">({match.tasker.total_reviews})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Match score */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium ${getScoreBg(match.fit_score)} ${getScoreColor(match.fit_score)}`}>
                      <CheckCircle className="h-3 w-3" />
                      {match.fit_score}% match
                    </div>
                    <Progress value={match.fit_score} className="flex-1 h-2" />
                  </div>

                  {/* Reasoning */}
                  <p className="text-sm text-muted-foreground mt-2">{match.reasoning}</p>

                  {/* Key strengths */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {match.key_strengths.slice(0, 3).map((strength, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {strength}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                    {match.tasker.completed_tasks !== null && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {match.tasker.completed_tasks} tasks
                      </span>
                    )}
                    {match.tasker.hourly_rate && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        ${match.tasker.hourly_rate}/hr
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    onClick={() => onSelectTasker?.(match.tasker_id)}
                  >
                    Select
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/profile/${match.tasker_id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}