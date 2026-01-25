import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Clock,
  TrendingUp,
  Zap,
  ArrowRight,
  Loader2,
  Target,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SmartMatch {
  task_id: string;
  title: string;
  category: string;
  budget: number;
  location: string | null;
  match_score: number;
  match_reasons: {
    category?: number;
    location?: number;
    price?: number;
    skills?: number;
  };
  created_at: string;
  urgency: string | null;
}

interface MatchPreferences {
  ai_matching_enabled: boolean;
  preferred_categories: string[];
  preferred_distance_km: number;
  preferred_price_min: number | null;
  preferred_price_max: number | null;
}

export const SmartMatchingCard = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<SmartMatch[]>([]);
  const [preferences, setPreferences] = useState<MatchPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);

  useEffect(() => {
    fetchMatchData();
  }, [userId]);

  const fetchMatchData = async () => {
    try {
      // Get user preferences
      const { data: prefsData } = await supabase
        .from('user_match_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (prefsData) {
        setPreferences(prefsData as unknown as MatchPreferences);
        setAiEnabled(prefsData.ai_matching_enabled);
      } else {
        // Create default preferences
        await supabase
          .from('user_match_preferences')
          .insert({ user_id: userId });
      }

      // Get user profile for matching
      const { data: profile } = await supabase
        .from('profiles')
        .select('latitude, longitude, skills')
        .eq('id', userId)
        .single();

      // Get available tasks and calculate match scores
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, category, pay_amount, location, latitude, longitude, created_at, priority')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(20);

      if (tasks) {
        // Calculate match scores (simplified AI scoring)
        const scoredTasks: SmartMatch[] = tasks.map(task => {
          let score = 0;
          const reasons: SmartMatch['match_reasons'] = {};

          // Category matching (would use ML in production)
          if (prefsData?.preferred_categories?.includes(task.category)) {
            score += 35;
            reasons.category = 35;
          } else {
            score += 15;
            reasons.category = 15;
          }

          // Location proximity scoring
          if (profile?.latitude && profile?.longitude && task.latitude && task.longitude) {
            const distance = calculateDistance(
              profile.latitude, profile.longitude,
              task.latitude, task.longitude
            );
            const maxDist = prefsData?.preferred_distance_km || 25;
            if (distance <= maxDist) {
              const locScore = Math.round(30 * (1 - distance / maxDist));
              score += locScore;
              reasons.location = locScore;
            }
          } else {
            score += 15;
            reasons.location = 15;
          }

          // Price range scoring
          if (prefsData?.preferred_price_min && prefsData?.preferred_price_max) {
            if (task.pay_amount >= prefsData.preferred_price_min && 
                task.pay_amount <= prefsData.preferred_price_max) {
              score += 25;
              reasons.price = 25;
            } else {
              score += 10;
              reasons.price = 10;
            }
          } else {
            score += 20;
            reasons.price = 20;
          }

          // Skills matching (simplified)
          score += 10;
          reasons.skills = 10;

          return {
            task_id: task.id,
            title: task.title,
            category: task.category,
            budget: task.pay_amount,
            location: task.location,
            match_score: Math.min(100, score),
            match_reasons: reasons,
            created_at: task.created_at,
            urgency: task.priority
          };
        });

        // Sort by match score
        scoredTasks.sort((a, b) => b.match_score - a.match_score);
        setMatches(scoredTasks.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toggleAI = async () => {
    const newValue = !aiEnabled;
    setAiEnabled(newValue);
    
    try {
      await supabase
        .from('user_match_preferences')
        .upsert({ 
          user_id: userId, 
          ai_matching_enabled: newValue,
          updated_at: new Date().toISOString()
        });
      
      toast.success(newValue ? 'AI Matching enabled' : 'AI Matching disabled');
    } catch (error) {
      console.error('Error updating preferences:', error);
      setAiEnabled(!newValue);
    }
  };

  const logMatchAction = async (taskId: string, action: 'viewed' | 'applied' | 'dismissed') => {
    const match = matches.find(m => m.task_id === taskId);
    if (!match) return;

    try {
      await supabase
        .from('smart_match_logs')
        .insert({
          user_id: userId,
          task_id: taskId,
          match_score: match.match_score,
          match_reasons: match.match_reasons,
          action_taken: action
        });
    } catch (error) {
      console.error('Error logging match action:', error);
    }
  };

  const viewTask = (taskId: string) => {
    logMatchAction(taskId, 'viewed');
    navigate(`/task/${taskId}`);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500/20 to-green-500/5';
    if (score >= 60) return 'from-yellow-500/20 to-yellow-500/5';
    return 'from-orange-500/20 to-orange-500/5';
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Smart Match
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI
                  </Badge>
                </CardTitle>
                <CardDescription>Tasks matched to your skills and preferences</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">AI Matching</span>
              <Switch checked={aiEnabled} onCheckedChange={toggleAI} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {matches.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No matching tasks found</p>
              <p className="text-sm text-muted-foreground">Check back later or adjust your preferences</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              <AnimatePresence>
                {matches.map((match, idx) => (
                  <motion.div
                    key={match.task_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 hover:bg-accent/5 transition-colors cursor-pointer group"
                    onClick={() => viewTask(match.task_id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Match Score Circle */}
                      <div className={cn(
                        "h-14 w-14 rounded-full flex items-center justify-center shrink-0",
                        `bg-gradient-to-br ${getScoreBg(match.match_score)}`
                      )}>
                        <div className="text-center">
                          <div className={cn("text-lg font-bold", getScoreColor(match.match_score))}>
                            {match.match_score}%
                          </div>
                        </div>
                      </div>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{match.title}</h4>
                          {match.urgency === 'urgent' && (
                            <Badge variant="destructive" className="text-xs shrink-0">
                              <Zap className="h-3 w-3 mr-1" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {match.category}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${match.budget}
                          </span>
                          {match.location && (
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{match.location}</span>
                            </span>
                          )}
                        </div>
                        
                        {/* Match Reasons */}
                        <div className="flex gap-2 mt-2">
                          {Object.entries(match.match_reasons).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-1">
                              <div 
                                className="h-1.5 rounded-full bg-primary/50" 
                                style={{ width: `${value}px` }}
                              />
                              <span className="text-xs text-muted-foreground capitalize">{key}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* View All */}
          <div className="p-4 border-t border-border/50">
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/browse')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              View All Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SmartMatchingCard;
