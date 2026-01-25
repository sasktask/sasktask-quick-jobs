import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Star, 
  Award, 
  Crown, 
  Gem,
  ThumbsUp,
  Heart,
  Sparkles,
  Medal,
  UserPlus,
  Users,
  Megaphone,
  Globe,
  ShieldCheck,
  Rocket,
  MessageCircle,
  Lock,
  CheckCircle,
  Loader2,
  Footprints
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tier: string;
  requirement_type: string;
  requirement_value: number;
  reward_type: string | null;
  reward_value: number | null;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
  claimed_at: string | null;
  achievement?: Achievement;
}

const TIER_COLORS = {
  bronze: 'from-amber-700 to-amber-500',
  silver: 'from-gray-400 to-gray-300',
  gold: 'from-yellow-500 to-yellow-400',
  platinum: 'from-cyan-400 to-cyan-300',
  diamond: 'from-purple-500 to-pink-500'
};

const TIER_BORDERS = {
  bronze: 'border-amber-600/50',
  silver: 'border-gray-400/50',
  gold: 'border-yellow-500/50',
  platinum: 'border-cyan-400/50',
  diamond: 'border-purple-500/50'
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy,
  Star,
  Award,
  Crown,
  Gem,
  ThumbsUp,
  Heart,
  Sparkles,
  Medal,
  UserPlus,
  Users,
  Megaphone,
  Globe,
  ShieldCheck,
  Rocket,
  MessageCircle,
  Footprints
};

export const AchievementsDisplay = ({ userId }: { userId: string }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [celebratingId, setCelebratingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, [userId]);

  const fetchAchievements = async () => {
    try {
      // Fetch all achievements
      const { data: allAchievements, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true });

      if (achError) throw achError;

      // Check user achievements (this also updates progress)
      const { data: userAchData, error: userError } = await supabase
        .rpc('check_user_achievements', { p_user_id: userId });

      if (userError) throw userError;

      setAchievements(allAchievements || []);
      setUserAchievements(userAchData || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (userAchievementId: string, achievementName: string) => {
    try {
      setCelebratingId(userAchievementId);
      
      const { error } = await supabase
        .from('user_achievements')
        .update({ claimed_at: new Date().toISOString() })
        .eq('id', userAchievementId);

      if (error) throw error;

      toast.success(`🎉 Claimed reward for "${achievementName}"!`);
      await fetchAchievements();
      
      setTimeout(() => setCelebratingId(null), 2000);
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
      setCelebratingId(null);
    }
  };

  const getUserProgress = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievement_id === achievementId);
  };

  const categories = ['all', ...new Set(achievements.map(a => a.category))];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const completedCount = userAchievements.filter(ua => ua.is_completed).length;
  const totalCount = achievements.length;

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
      className="space-y-6"
    >
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Achievements</CardTitle>
                <CardDescription>
                  Unlock badges and earn rewards for your accomplishments
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{completedCount}/{totalCount}</div>
              <div className="text-sm text-muted-foreground">Unlocked</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={(completedCount / totalCount) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="capitalize shrink-0"
          >
            {cat === 'all' ? 'All' : cat}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement, idx) => {
            const userProgress = getUserProgress(achievement.id);
            const isCompleted = userProgress?.is_completed || false;
            const isClaimed = !!userProgress?.claimed_at;
            const progress = userProgress?.progress || 0;
            const progressPercent = Math.min(100, (progress / achievement.requirement_value) * 100);
            const IconComponent = ICON_MAP[achievement.icon] || Trophy;
            const tierColor = TIER_COLORS[achievement.tier as keyof typeof TIER_COLORS] || TIER_COLORS.bronze;
            const tierBorder = TIER_BORDERS[achievement.tier as keyof typeof TIER_BORDERS] || TIER_BORDERS.bronze;

            return (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: celebratingId === userProgress?.id ? [1, 1.05, 1] : 1 
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={cn(
                  "relative overflow-hidden transition-all duration-300",
                  isCompleted 
                    ? `bg-card/80 ${tierBorder} border-2` 
                    : "bg-card/30 border-border/30 opacity-80",
                  "hover:shadow-lg"
                )}>
                  {/* Celebration Effect */}
                  {celebratingId === userProgress?.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2 }}
                      className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 pointer-events-none"
                    />
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                        isCompleted 
                          ? `bg-gradient-to-br ${tierColor}` 
                          : "bg-muted/50"
                      )}>
                        {isCompleted ? (
                          <IconComponent className="h-6 w-6 text-white" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={cn(
                            "font-semibold truncate",
                            !isCompleted && "text-muted-foreground"
                          )}>
                            {achievement.name}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs capitalize shrink-0",
                              isCompleted && tierBorder
                            )}
                          >
                            {achievement.tier}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {achievement.description}
                        </p>

                        {/* Progress */}
                        {!isCompleted && (
                          <div className="space-y-1">
                            <Progress value={progressPercent} className="h-1.5" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{progress}/{achievement.requirement_value}</span>
                              <span>{Math.round(progressPercent)}%</span>
                            </div>
                          </div>
                        )}

                        {/* Completed State */}
                        {isCompleted && (
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span>Completed</span>
                            </div>
                            {achievement.reward_value && achievement.reward_value > 0 && !isClaimed && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={() => claimReward(userProgress!.id, achievement.name)}
                              >
                                Claim ${achievement.reward_value}
                              </Button>
                            )}
                            {isClaimed && (
                              <Badge variant="secondary" className="text-xs">
                                Claimed
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default AchievementsDisplay;
