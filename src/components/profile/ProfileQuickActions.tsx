import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  Shield, 
  Eye, 
  MessageSquare, 
  ChevronRight,
  Download,
  Share2,
  Sparkles
} from "lucide-react";
import { ProfilePreviewDialog } from "./ProfilePreviewDialog";

interface ProfileQuickActionsProps {
  userId: string | null;
  userRole: string | null;
  profile?: any;
  verification?: any;
  trustScore?: number;
}

export const ProfileQuickActions = ({ 
  userId, 
  userRole,
  profile,
  verification,
  trustScore = 50
}: ProfileQuickActionsProps) => {
  const navigate = useNavigate();

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.full_name || 'User'}'s Profile`,
          text: 'Check out my profile on SaskTask!',
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled or error
        navigator.clipboard.writeText(profileUrl);
      }
    } else {
      navigator.clipboard.writeText(profileUrl);
    }
  };

  const actions = [
    {
      icon: Shield,
      label: "Verify Identity",
      description: "Build trust with verification",
      onClick: () => navigate("/verification"),
      highlight: !verification?.id_verified
    },
    {
      icon: Settings,
      label: "Account Settings",
      description: "Manage your account",
      onClick: () => navigate("/account"),
    },
    {
      icon: MessageSquare,
      label: "Messages",
      description: "View your conversations",
      onClick: () => navigate("/messages"),
    },
    {
      icon: Share2,
      label: "Share Profile",
      description: "Share your profile link",
      onClick: handleShareProfile,
    }
  ];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Profile Preview Button */}
        <ProfilePreviewDialog
          profile={profile}
          userRole={userRole}
          verification={verification}
          trustScore={trustScore}
        >
          <button
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all group text-left"
          >
            <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
              <Eye className="h-4 w-4 text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-primary transition-colors">Preview Profile</p>
              <p className="text-xs text-muted-foreground truncate">See how others view you</p>
            </div>
            <ChevronRight className="h-4 w-4 text-primary transition-colors" />
          </button>
        </ProfilePreviewDialog>

        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all group text-left ${
              action.highlight 
                ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10' 
                : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            <div className={`p-2 rounded-lg transition-colors ${
              action.highlight 
                ? 'bg-amber-500/20 group-hover:bg-amber-500/30' 
                : 'bg-muted group-hover:bg-primary/10'
            }`}>
              <action.icon className={`h-4 w-4 transition-colors ${
                action.highlight 
                  ? 'text-amber-600' 
                  : 'text-muted-foreground group-hover:text-primary'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm transition-colors ${
                action.highlight 
                  ? 'text-amber-600' 
                  : 'group-hover:text-primary'
              }`}>{action.label}</p>
              <p className="text-xs text-muted-foreground truncate">{action.description}</p>
            </div>
            <ChevronRight className={`h-4 w-4 transition-colors ${
              action.highlight 
                ? 'text-amber-600' 
                : 'text-muted-foreground group-hover:text-primary'
            }`} />
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
