import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  Shield, 
  Wallet, 
  Eye, 
  MessageSquare, 
  FileText,
  ExternalLink,
  ChevronRight
} from "lucide-react";

interface ProfileQuickActionsProps {
  userId: string | null;
  userRole: string | null;
}

export const ProfileQuickActions = ({ userId, userRole }: ProfileQuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Eye,
      label: "View Public Profile",
      description: "See how others see you",
      onClick: () => userId && navigate(`/profile/${userId}`),
      variant: "outline" as const
    },
    {
      icon: Shield,
      label: "Verify Identity",
      description: "Build trust with verification",
      onClick: () => navigate("/verification"),
      variant: "outline" as const
    },
    {
      icon: Settings,
      label: "Account Settings",
      description: "Manage your account",
      onClick: () => navigate("/account"),
      variant: "outline" as const
    },
    {
      icon: MessageSquare,
      label: "Messages",
      description: "View your conversations",
      onClick: () => navigate("/messages"),
      variant: "outline" as const
    }
  ];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group text-left"
          >
            <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
              <action.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm group-hover:text-primary transition-colors">{action.label}</p>
              <p className="text-xs text-muted-foreground truncate">{action.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
