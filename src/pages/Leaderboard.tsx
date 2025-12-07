import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, CheckCircle, Medal, Crown, Award, User, TrendingUp, Calendar, Flame, Zap, Target, Shield, ArrowUp, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { startOfWeek, startOfMonth, startOfYear } from "date-fns";

interface LeaderboardEntry {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  completed_tasks: number | null;
  rating: number | null;
  total_reviews: number | null;
  city: string | null;
  created_at: string | null;
}

interface UserRank {
  tasks_rank: number | null;
  rating_rank: number | null;
  total_taskers: number | null;
}

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  completed_tasks: number | null;
  rating: number | null;
  total_reviews: number | null;
}

interface UserBadge {
  badge_type: string;
  badge_level: string | null;
  earned_at: string | null;
}

type TimePeriod = "all" | "week" | "month" | "year";

// Badge definitions for leaderboard achievements
const leaderboardBadges = {
  champion: { icon: Crown, label: "Champion", description: "Ranked #1 on leaderboard", color: "text-yellow-500" },
  elite: { icon: Medal, label: "Elite", description: "Top 3 on leaderboard", color: "text-gray-400" },
  rising_star: { icon: Flame, label: "Rising Star", description: "New to top 10 this period", color: "text-orange-500" },
  consistent: { icon: Target, label: "Consistent", description: "On leaderboard 3+ periods", color: "text-blue-500" },
  high_rated: { icon: Star, label: "Highly Rated", description: "4.8+ rating with 10+ reviews", color: "text-yellow-400" },
  verified: { icon: Shield, label: "Verified Pro", description: "Fully verified tasker", color: "text-green-500" },
  speedster: { icon: Zap, label: "Speedster", description: "Fast response time", color: "text-purple-500" },
};

// Database badge type mapping
const dbBadgeMap: Record<string, { label: string; icon: typeof Crown; color: string }> = {
  leaderboard_champion: { label: "Leaderboard Champion", icon: Crown, color: "text-yellow-500" },
  leaderboard_elite: { label: "Elite Tasker", icon: Medal, color: "text-gray-400" },
  leaderboard_top10: { label: "Top 10", icon: Trophy, color: "text-amber-500" },
  highly_rated: { label: "Highly Rated", icon: Star, color: "text-yellow-400" },
  rating_champion: { label: "Rating Champion", icon: Star, color: "text-yellow-500" },
  century_tasker: { label: "Century Tasker", icon: Award, color: "text-purple-500" },
  fifty_tasks: { label: "50 Tasks", icon: CheckCircle, color: "text-blue-500" },
  twentyfive_tasks: { label: "25 Tasks", icon: CheckCircle, color: "text-green-500" },
  ten_tasks: { label: "10 Tasks", icon: CheckCircle, color: "text-teal-500" },
};

export default function Leaderboard() {
  const [topByTasks, setTopByTasks] = useState<LeaderboardEntry[]>([]);
  const [topByRating, setTopByRating] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("all");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchLeaderboards();
  }, [timePeriod]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUser(session?.user ?? null);
    if (session?.user) {
      await Promise.all([
        fetchUserProfile(session.user.id),
        fetchUserRank(session.user.id),
        fetchUserBadges(session.user.id),
      ]);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, completed_tasks, rating, total_reviews")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setUserProfile(data);
    }
  };

  const fetchUserRank = async (userId: string) => {
    const { data, error } = await supabase
      .rpc("get_user_leaderboard_rank", { p_user_id: userId });

    if (!error && data && data.length > 0) {
      setUserRank(data[0]);
    }
  };

  const fetchUserBadges = async (userId: string) => {
    const { data, error } = await supabase
      .from("badges")
      .select("badge_type, badge_level, earned_at")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (!error && data) {
      setUserBadges(data);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    switch (timePeriod) {
      case "week":
        return startOfWeek(now).toISOString();
      case "month":
        return startOfMonth(now).toISOString();
      case "year":
        return startOfYear(now).toISOString();
      default:
        return null;
    }
  };

  const fetchLeaderboards = async () => {
    setIsLoading(true);
    try {
      const dateFilter = getDateFilter();

      let tasksQuery = supabase
        .from("profiles")
        .select("id, full_name, avatar_url, completed_tasks, rating, total_reviews, city, created_at")
        .gt("completed_tasks", 0)
        .order("completed_tasks", { ascending: false })
        .limit(10);

      let ratingQuery = supabase
        .from("profiles")
        .select("id, full_name, avatar_url, completed_tasks, rating, total_reviews, city, created_at")
        .gte("total_reviews", 5)
        .order("rating", { ascending: false })
        .limit(10);

      if (dateFilter) {
        tasksQuery = tasksQuery.gte("updated_at", dateFilter);
        ratingQuery = ratingQuery.gte("updated_at", dateFilter);
      }

      const [{ data: byTasks, error: tasksError }, { data: byRating, error: ratingError }] = await Promise.all([
        tasksQuery,
        ratingQuery
      ]);

      if (tasksError) throw tasksError;
      if (ratingError) throw ratingError;

      setTopByTasks(byTasks || []);
      setTopByRating(byRating || []);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="h-6 w-6 flex items-center justify-center font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">🥇 Champion</Badge>;
      case 1:
        return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-white border-0">🥈 Elite</Badge>;
      case 2:
        return <Badge className="bg-gradient-to-r from-amber-500 to-amber-700 text-white border-0">🥉 Pro</Badge>;
      default:
        return null;
    }
  };

  const getEntryBadges = (entry: LeaderboardEntry, index: number) => {
    const badges: Array<keyof typeof leaderboardBadges> = [];
    
    if (index === 0) badges.push("champion");
    else if (index < 3) badges.push("elite");
    
    if (entry.rating && entry.rating >= 4.8 && (entry.total_reviews || 0) >= 10) {
      badges.push("high_rated");
    }
    
    if (index < 10 && timePeriod !== "all") {
      badges.push("rising_star");
    }
    
    return badges;
  };

  const getTimePeriodLabel = () => {
    switch (timePeriod) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      default:
        return "All Time";
    }
  };

  const getProgressToNextRank = () => {
    if (!userRank || !userRank.tasks_rank) return 0;
    const rank = userRank.tasks_rank;
    if (rank <= 3) return 100;
    if (rank <= 10) return Math.min(100, ((10 - rank) / 7) * 100 + 30);
    return Math.min(100, Math.max(0, 100 - (rank - 10) * 2));
  };

  const getNextMilestone = () => {
    if (!userRank || !userRank.tasks_rank) return "Complete tasks to join the leaderboard!";
    const rank = userRank.tasks_rank;
    if (rank === 1) return "You're the champion! 🏆";
    if (rank <= 3) return `${rank - 1} spot${rank > 2 ? 's' : ''} away from Champion!`;
    if (rank <= 10) return `${rank - 3} spots away from Top 3!`;
    return `${rank - 10} spots away from Top 10!`;
  };

  // Personal Ranking Card Component
  const PersonalRankingCard = () => {
    if (!currentUser) {
      return (
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold mb-2">Track Your Progress</h3>
                <p className="text-muted-foreground">Sign in to see your leaderboard ranking and earn badges</p>
              </div>
              <Button onClick={() => navigate("/auth")} className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-8 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20 overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Your Ranking
          </CardTitle>
          <CardDescription>Track your progress on the leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                <AvatarImage src={userProfile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {userProfile?.full_name?.charAt(0) || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg">{userProfile?.full_name || "Anonymous"}</p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {userProfile?.completed_tasks || 0} tasks
                  </span>
                  {userProfile?.rating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {userProfile.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Rankings */}
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Tasks Rank</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {userRank?.tasks_rank ? `#${userRank.tasks_rank}` : "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  of {userRank?.total_taskers || 0} taskers
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Rating Rank</span>
                </div>
                <div className="text-3xl font-bold text-yellow-500">
                  {userRank?.rating_rank ? `#${userRank.rating_rank}` : "—"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {!userRank?.rating_rank && "Need 5+ reviews"}
                </p>
              </div>
            </div>

            {/* Progress to Next Rank */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress to next rank</span>
                <span className="flex items-center gap-1 text-primary font-medium">
                  <ArrowUp className="h-3 w-3" />
                  {getNextMilestone()}
                </span>
              </div>
              <Progress value={getProgressToNextRank()} className="h-2" />
              
              {/* User's Earned Badges */}
              {userBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {userBadges.slice(0, 5).map((badge, idx) => {
                    const badgeInfo = dbBadgeMap[badge.badge_type];
                    if (!badgeInfo) return null;
                    const Icon = badgeInfo.icon;
                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div className={`p-1.5 rounded-full bg-muted ${badgeInfo.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-semibold">{badgeInfo.label}</p>
                          <p className="text-xs text-muted-foreground capitalize">{badge.badge_level} level</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {userBadges.length > 5 && (
                    <Badge variant="outline" className="text-xs">+{userBadges.length - 5} more</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LeaderboardList = ({ entries, type }: { entries: LeaderboardEntry[]; type: "tasks" | "rating" }) => (
    <div className="space-y-3">
      {entries.map((entry, index) => {
        const badges = getEntryBadges(entry, index);
        const isCurrentUser = currentUser && entry.id === currentUser.id;
        
        return (
          <Link
            key={entry.id}
            to={`/profile/${entry.id}`}
            className={`block p-4 rounded-xl border transition-all hover:shadow-md hover:border-primary/30 ${
              isCurrentUser ? "ring-2 ring-primary bg-primary/5" : index < 3 ? "bg-gradient-to-r from-primary/5 to-transparent" : "bg-card"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-10 flex justify-center">
                {getRankIcon(index)}
              </div>
              <Avatar className={`${index < 3 ? "h-14 w-14 ring-2 ring-primary/20" : "h-12 w-12"}`}>
                <AvatarImage src={entry.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {entry.full_name?.charAt(0) || <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold ${index < 3 ? "text-lg" : ""}`}>
                    {entry.full_name || "Anonymous Tasker"}
                  </span>
                  {isCurrentUser && <Badge variant="secondary">You</Badge>}
                  {getRankBadge(index)}
                </div>
                {entry.city && (
                  <p className="text-sm text-muted-foreground">{entry.city}</p>
                )}
                {badges.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {badges.slice(0, 3).map((badgeKey) => {
                      const badge = leaderboardBadges[badgeKey];
                      const Icon = badge.icon;
                      return (
                        <Tooltip key={badgeKey}>
                          <TooltipTrigger asChild>
                            <div className={`p-1 rounded-full bg-muted ${badge.color}`}>
                              <Icon className="h-3 w-3" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-semibold">{badge.label}</p>
                            <p className="text-xs text-muted-foreground">{badge.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                {type === "tasks" ? (
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-primary">{entry.completed_tasks || 0}</span>
                    <span className="text-xs text-muted-foreground">tasks completed</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{entry.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{entry.total_reviews || 0} reviews</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        );
      })}
      {entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No taskers on the leaderboard for {getTimePeriodLabel().toLowerCase()}.</p>
          <p className="text-sm">Complete tasks to appear here!</p>
        </div>
      )}
    </div>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl border bg-card flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Top Taskers Leaderboard</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Celebrating our most accomplished taskers. See who's leading in completed tasks and ratings.
          </p>
        </div>

        {/* Personal Ranking Card */}
        <PersonalRankingCard />

        {/* Time Period Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 p-1 bg-muted rounded-lg">
            <Calendar className="h-4 w-4 ml-3 text-muted-foreground" />
            <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
              <SelectTrigger className="w-[160px] border-0 bg-transparent">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Badge Legend */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievement Badges
            </CardTitle>
            <CardDescription>
              Earn badges by climbing the leaderboard and maintaining excellent performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(leaderboardBadges).map(([key, badge]) => {
                const Icon = badge.icon;
                return (
                  <div key={key} className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className={`p-2 rounded-full bg-background mb-2 ${badge.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium">{badge.label}</span>
                    <span className="text-xs text-muted-foreground line-clamp-2">{badge.description}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-200/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-500/20">
                <Crown className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Performer</p>
                <p className="font-semibold truncate">
                  {topByTasks[0]?.full_name || "—"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/20">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Most Tasks ({getTimePeriodLabel()})</p>
                <p className="font-semibold">
                  {topByTasks[0]?.completed_tasks || 0} completed
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/20">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Highest Rated</p>
                <p className="font-semibold">
                  {topByRating[0]?.rating?.toFixed(1) || "—"} ⭐
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Taskers</p>
                <p className="font-semibold">{topByTasks.length} on board</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            <TabsTrigger value="tasks" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              By Completed Tasks
            </TabsTrigger>
            <TabsTrigger value="rating" className="gap-2">
              <Star className="h-4 w-4" />
              By Rating
            </TabsTrigger>
          </TabsList>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Top 10 Taskers
                </span>
                <Badge variant="outline">{getTimePeriodLabel()}</Badge>
              </CardTitle>
              <CardDescription>
                Our highest performing taskers based on achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="tasks" className="mt-0">
                {isLoading ? <LoadingSkeleton /> : <LeaderboardList entries={topByTasks} type="tasks" />}
              </TabsContent>
              <TabsContent value="rating" className="mt-0">
                {isLoading ? <LoadingSkeleton /> : <LeaderboardList entries={topByRating} type="rating" />}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}