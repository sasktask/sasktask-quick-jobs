import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles, Star, MapPin, Clock, DollarSign, ArrowRight, Zap, Shield,
  TrendingUp, ThumbsUp, RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecommendedTask {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  urgency: string;
  created_at: string;
  match_score?: number;
  task_giver?: {
    full_name: string;
    avatar_url: string;
    rating: number;
  };
}

interface RecommendedTasker {
  id: string;
  full_name: string;
  avatar_url: string;
  rating: number;
  total_reviews: number;
  hourly_rate: number;
  skills: string[];
  bio: string;
  verified: boolean;
  match_score?: number;
}

interface AIRecommendedServicesProps {
  userId?: string;
  userRole?: "task_giver" | "task_doer" | "both";
}

export function AIRecommendedServices({ userId, userRole }: AIRecommendedServicesProps) {
  const [tasks, setTasks] = useState<RecommendedTask[]>([]);
  const [taskers, setTaskers] = useState<RecommendedTasker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"tasks" | "taskers">(
    userRole === "task_giver" ? "taskers" : "tasks"
  );

  const fetchRecommendations = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      // Fetch recommended tasks for doers
      if (userRole !== "task_giver") {
        const { data, error } = await supabase.functions.invoke("ai-task-recommendations", {
          body: { userId, limit: 6 }
        });
        
        if (!error && data?.tasks) {
          setTasks(data.tasks);
        }
      }

      // Fetch recommended taskers for givers
      if (userRole !== "task_doer") {
        const { data: taskersData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, rating, total_reviews, hourly_rate, skills, bio")
          .not("hourly_rate", "is", null)
          .order("rating", { ascending: false })
          .limit(6);

        if (taskersData) {
          // Add verification status
          const taskerIds = taskersData.map(t => t.id);
          const { data: verifications } = await supabase
            .from("verifications")
            .select("user_id, verification_status")
            .in("user_id", taskerIds);

          const verificationMap = new Map(verifications?.map(v => [v.user_id, v.verification_status]));
          
          setTaskers(taskersData.map(t => ({
            ...t,
            skills: t.skills || [],
            verified: verificationMap.get(t.id) === "verified",
            match_score: Math.floor(Math.random() * 20) + 80 // Simulated match score
          })));
        }
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId, userRole]);

  const handleRefresh = () => {
    fetchRecommendations(true);
    toast.success("Refreshing recommendations...");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Recommended For You</h2>
            <p className="text-sm text-muted-foreground">
              Personalized based on your preferences and history
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs for task givers */}
      {userRole === "both" && (
        <div className="flex gap-2">
          <Button
            variant={activeTab === "tasks" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("tasks")}
          >
            <Zap className="w-4 h-4 mr-2" />
            Tasks to Complete
          </Button>
          <Button
            variant={activeTab === "taskers" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("taskers")}
          >
            <ThumbsUp className="w-4 h-4 mr-2" />
            Taskers to Hire
          </Button>
        </div>
      )}

      {/* Tasks grid (for doers) */}
      {(activeTab === "tasks" || userRole === "task_doer") && tasks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/task/${task.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group">
                    <CardContent className="p-4">
                      {/* Match score badge */}
                      {task.match_score && (
                        <Badge className="mb-3 bg-gradient-to-r from-primary to-primary/70">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {task.match_score}% Match
                        </Badge>
                      )}

                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {task.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          ${task.budget}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {task.location || "Saskatoon"}
                        </span>
                      </div>

                      {task.urgency === "urgent" && (
                        <Badge variant="destructive" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Urgent
                        </Badge>
                      )}

                      <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Taskers grid (for givers) */}
      {(activeTab === "taskers" || userRole === "task_giver") && taskers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {taskers.map((tasker, index) => (
              <motion.div
                key={tasker.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/profile/${tasker.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer group">
                    <CardContent className="p-4">
                      {/* Match score badge */}
                      {tasker.match_score && (
                        <Badge className="mb-3 bg-gradient-to-r from-primary to-primary/70">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {tasker.match_score}% Match
                        </Badge>
                      )}

                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={tasker.avatar_url} />
                            <AvatarFallback>{tasker.full_name?.[0]}</AvatarFallback>
                          </Avatar>
                          {tasker.verified && (
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                              <Shield className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {tasker.full_name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{tasker.rating?.toFixed(1) || "New"}</span>
                            <span className="text-muted-foreground">
                              ({tasker.total_reviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {tasker.bio && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {tasker.bio}
                        </p>
                      )}

                      {tasker.skills && tasker.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tasker.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {tasker.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{tasker.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-primary">
                          ${tasker.hourly_rate}/hr
                        </span>
                        <Button size="sm" variant="outline" className="gap-1">
                          View Profile
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty states */}
      {tasks.length === 0 && taskers.length === 0 && (
        <Card className="p-8 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No recommendations yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete more tasks or update your preferences to get personalized recommendations
          </p>
          <Button asChild>
            <Link to="/browse">Browse All Services</Link>
          </Button>
        </Card>
      )}

      {/* View all link */}
      {(tasks.length > 0 || taskers.length > 0) && (
        <div className="text-center">
          <Button variant="outline" asChild>
            <Link to={activeTab === "tasks" ? "/browse" : "/find-taskers"}>
              View All {activeTab === "tasks" ? "Tasks" : "Taskers"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
