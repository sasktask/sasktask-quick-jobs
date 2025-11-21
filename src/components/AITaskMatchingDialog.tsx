import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Star, TrendingUp, Clock, DollarSign, Award, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AITaskMatchingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  onSelectTasker?: (taskerId: string) => void;
}

interface TaskerMatch {
  tasker_id: string;
  fit_score: number;
  reasoning: string;
  key_strengths: string[];
  tasker: any;
}

export const AITaskMatchingDialog = ({ open, onOpenChange, taskId, onSelectTasker }: AITaskMatchingDialogProps) => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<TaskerMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const findMatches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-task-matching", {
        body: { taskId }
      });

      if (error) throw error;

      if (data.error) {
        if (data.error.includes("Rate limit") || data.error.includes("credits")) {
          toast({
            title: "AI Service Unavailable",
            description: data.error,
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      setMatches(data.matches);
      toast({
        title: "AI Matching Complete",
        description: `Found ${data.matches.length} highly qualified taskers for your job`,
      });
    } catch (error: any) {
      console.error("AI Matching Error:", error);
      toast({
        title: "Error",
        description: "Failed to find matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && matches.length === 0) {
      findMatches();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            AI-Powered Tasker Matching
          </DialogTitle>
          <DialogDescription>
            Our AI analyzes skills, ratings, availability, and experience to find your perfect match
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Analyzing taskers with AI...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Click to start AI matching</p>
            <Button onClick={findMatches} className="mt-4">
              <Sparkles className="mr-2 h-4 w-4" />
              Find Best Matches
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <Card key={match.tasker_id} className="border-border hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage 
                          src={match.tasker?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.tasker?.full_name}`} 
                          alt={match.tasker?.full_name} 
                        />
                        <AvatarFallback>{match.tasker?.full_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <Badge className="absolute -top-2 -right-2 bg-primary text-white">
                        #{index + 1}
                      </Badge>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{match.tasker?.full_name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold">{match.tasker?.rating?.toFixed(1) || "New"}</span>
                              <span className="text-muted-foreground text-sm">
                                ({match.tasker?.total_reviews || 0} reviews)
                              </span>
                            </div>
                            <Badge variant="secondary">
                              {match.tasker?.completed_tasks || 0} tasks
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary mb-1">
                            {match.fit_score}%
                          </div>
                          <p className="text-sm text-muted-foreground">Match Score</p>
                        </div>
                      </div>

                      <Progress value={match.fit_score} className="h-2 mb-3" />

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {match.tasker?.hourly_rate && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span>${match.tasker.hourly_rate}/hr</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span>{match.tasker?.on_time_rate || 100}% on-time</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{match.tasker?.response_rate || 100}% response</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          Key Strengths:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {match.key_strengths.map((strength, idx) => (
                            <Badge key={idx} variant="outline">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-accent/10 rounded-lg mb-3">
                        <p className="text-sm"><strong>AI Analysis:</strong> {match.reasoning}</p>
                      </div>

                      <Button 
                        onClick={() => {
                          onSelectTasker?.(match.tasker_id);
                          onOpenChange(false);
                        }}
                        className="w-full"
                      >
                        Select This Tasker
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
