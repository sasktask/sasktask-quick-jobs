import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";

interface ProfileCompletionBadgeProps {
  userId: string;
}

interface CompletionItem {
  label: string;
  completed: boolean;
  field: string;
}

export const ProfileCompletionBadge = ({ userId }: ProfileCompletionBadgeProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [completion, setCompletion] = useState(0);
  const [items, setItems] = useState<CompletionItem[]>([]);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile(data);
        calculateCompletion(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const calculateCompletion = (profile: any) => {
    const checks: CompletionItem[] = [
      {
        label: "Full Name",
        completed: !!profile.full_name,
        field: "full_name",
      },
      {
        label: "Profile Photo",
        completed: !!profile.avatar_url,
        field: "avatar_url",
      },
      {
        label: "Phone Number",
        completed: !!profile.phone,
        field: "phone",
      },
      {
        label: "City / Location",
        completed: !!profile.city,
        field: "city",
      },
      {
        label: "Bio",
        completed: !!profile.bio && profile.bio.length >= 10,
        field: "bio",
      },
      {
        label: "Skills (for Task Doers)",
        completed: !!profile.skills && profile.skills.length > 0,
        field: "skills",
      },
      {
        label: "Hourly Rate (for Task Doers)",
        completed: !!profile.hourly_rate,
        field: "hourly_rate",
      },
    ];

    setItems(checks);

    const completedCount = checks.filter((item) => item.completed).length;
    const percentage = Math.round((completedCount / checks.length) * 100);
    setCompletion(percentage);
  };

  const getCompletionColor = () => {
    if (completion >= 80) return "text-green-600";
    if (completion >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompletionBadge = () => {
    if (completion === 100) return <Badge className="bg-green-600">Complete</Badge>;
    if (completion >= 80) return <Badge className="bg-yellow-600">Almost There</Badge>;
    return <Badge variant="destructive">Incomplete</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Completion</CardTitle>
          {getCompletionBadge()}
        </div>
        <CardDescription>
          Complete your profile to increase visibility and trust
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-3xl font-bold ${getCompletionColor()}`}>
              {completion}%
            </span>
            <span className="text-sm text-muted-foreground">
              {items.filter(i => i.completed).length} of {items.length} completed
            </span>
          </div>
          <Progress value={completion} className="h-3" />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Checklist:</h4>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.field}
                className={`flex items-center gap-2 text-sm ${
                  item.completed ? "text-muted-foreground" : "text-foreground font-medium"
                }`}
              >
                {item.completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {completion < 100 && (
          <p className="text-xs text-muted-foreground">
            💡 Complete your profile to unlock more opportunities and build trust with clients
          </p>
        )}
      </CardContent>
    </Card>
  );
};
