import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SkillEndorsement {
  id: string;
  user_id: string;
  skill: string;
  endorsed_by: string;
  created_at: string;
}

interface SkillsShowcaseProps {
  userId: string;
  userSkills: string[];
  isOwnProfile: boolean;
}

export const SkillsShowcase = ({ userId, userSkills, isOwnProfile }: SkillsShowcaseProps) => {
  const [endorsements, setEndorsements] = useState<SkillEndorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    loadEndorsements();
    loadCurrentUser();
  }, [userId]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const loadEndorsements = async () => {
    try {
      const { data, error } = await supabase
        .from("skill_endorsements")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      setEndorsements(data || []);
    } catch (error: any) {
      console.error("Error loading endorsements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEndorsementCount = (skill: string) => {
    return endorsements.filter(e => e.skill === skill).length;
  };

  const hasEndorsed = (skill: string) => {
    return endorsements.some(e => e.skill === skill && e.endorsed_by === currentUser);
  };

  const handleEndorse = async (skill: string) => {
    if (!currentUser) {
      toast.error("Please sign in to endorse skills");
      return;
    }

    if (currentUser === userId) {
      toast.error("You cannot endorse your own skills");
      return;
    }

    try {
      if (hasEndorsed(skill)) {
        // Remove endorsement
        const { error } = await supabase
          .from("skill_endorsements")
          .delete()
          .eq("user_id", userId)
          .eq("skill", skill)
          .eq("endorsed_by", currentUser);

        if (error) throw error;
        toast.success("Endorsement removed");
      } else {
        // Add endorsement
        const { error } = await supabase
          .from("skill_endorsements")
          .insert({
            user_id: userId,
            skill: skill,
            endorsed_by: currentUser,
          });

        if (error) throw error;
        toast.success("Skill endorsed!");
      }

      loadEndorsements();
    } catch (error: any) {
      console.error("Error endorsing skill:", error);
      toast.error("Failed to endorse skill");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (userSkills.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            {isOwnProfile ? "Add skills to your profile to get started" : "No skills listed yet"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Endorsements</CardTitle>
        <CardDescription>
          {isOwnProfile ? "Your skills and their endorsements" : "Click to endorse skills"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {userSkills.map((skill) => {
            const count = getEndorsementCount(skill);
            const endorsed = hasEndorsed(skill);

            return (
              <TooltipProvider key={skill}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={endorsed ? "default" : "outline"}
                      size="sm"
                      onClick={() => !isOwnProfile && handleEndorse(skill)}
                      disabled={isOwnProfile}
                      className="gap-2"
                    >
                      {skill}
                      {count > 0 && (
                        <Badge variant="secondary" className="ml-1 px-2">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {count}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isOwnProfile ? (
                      <p>{count} {count === 1 ? "endorsement" : "endorsements"}</p>
                    ) : (
                      <p>{endorsed ? "Remove endorsement" : "Endorse this skill"}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
