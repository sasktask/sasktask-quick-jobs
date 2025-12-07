import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star, CheckCircle, Medal, Crown, Award, User, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface LeaderboardEntry {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  completed_tasks: number | null;
  rating: number | null;
  total_reviews: number | null;
  city: string | null;
}

export default function Leaderboard() {
  const [topByTasks, setTopByTasks] = useState<LeaderboardEntry[]>([]);
  const [topByRating, setTopByRating] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      // Fetch top taskers by completed tasks
      const { data: byTasks, error: tasksError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, completed_tasks, rating, total_reviews, city")
        .gt("completed_tasks", 0)
        .order("completed_tasks", { ascending: false })
        .limit(10);

      if (tasksError) throw tasksError;

      // Fetch top taskers by rating (minimum 5 reviews)
      const { data: byRating, error: ratingError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, completed_tasks, rating, total_reviews, city")
        .gte("total_reviews", 5)
        .order("rating", { ascending: false })
        .limit(10);

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

  const LeaderboardList = ({ entries, type }: { entries: LeaderboardEntry[]; type: "tasks" | "rating" }) => (
    <div className="space-y-3">
      {entries.map((entry, index) => (
        <Link
          key={entry.id}
          to={`/profile/${entry.id}`}
          className={`block p-4 rounded-xl border transition-all hover:shadow-md hover:border-primary/30 ${
            index < 3 ? "bg-gradient-to-r from-primary/5 to-transparent" : "bg-card"
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
                {getRankBadge(index)}
              </div>
              {entry.city && (
                <p className="text-sm text-muted-foreground">{entry.city}</p>
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
      ))}
      {entries.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No taskers on the leaderboard yet.</p>
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

      <main className="flex-1 container py-8">
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
                <p className="text-sm text-muted-foreground">Most Tasks</p>
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
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Top 10 Taskers
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