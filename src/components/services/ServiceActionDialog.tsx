import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuthContext";
import {
  Plus, Search, Users, Zap, ArrowRight, Briefcase, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";

interface ServiceActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryTitle: string;
  categoryIcon?: React.ElementType;
}

export function ServiceActionDialog({
  open,
  onOpenChange,
  categoryId,
  categoryTitle,
  categoryIcon: CategoryIcon,
}: ServiceActionDialogProps) {
  const navigate = useNavigate();
  const { isTaskGiver, isTaskDoer, hasBothRoles, isAuthenticated } = useAuth();

  const handleAction = (action: string) => {
    onOpenChange(false);
    
    switch (action) {
      case "post":
        navigate(`/post-task?category=${categoryId}`);
        break;
      case "browse":
        navigate(`/browse?category=${categoryId}`);
        break;
      case "find-taskers":
        navigate(`/find-taskers?category=${categoryId}`);
        break;
      case "instant":
        navigate(`/instant-work?category=${categoryId}`);
        break;
      case "map":
        navigate(`/map?category=${categoryId}`);
        break;
      default:
        navigate(`/browse?category=${categoryId}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {CategoryIcon && <CategoryIcon className="w-5 h-5 text-primary" />}
              {categoryTitle}
            </DialogTitle>
            <DialogDescription>
              Sign in to access all features for this service
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-4">
            <Button 
              className="w-full" 
              onClick={() => {
                onOpenChange(false);
                navigate(`/auth?redirect=/services-hub`);
              }}
            >
              Sign In to Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleAction("browse")}
            >
              Browse Tasks (View Only)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Task Giver actions
  const taskGiverActions = [
    {
      id: "post",
      title: "Post a Task",
      description: `Get help with ${categoryTitle.toLowerCase()} from verified professionals`,
      icon: Plus,
      color: "from-primary to-primary/70",
      highlight: true,
    },
    {
      id: "find-taskers",
      title: "Find Professionals",
      description: `Browse verified ${categoryTitle.toLowerCase()} experts`,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "instant",
      title: "Get Instant Help",
      description: "Request immediate assistance",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  // Task Doer actions
  const taskDoerActions = [
    {
      id: "browse",
      title: "Find Available Tasks",
      description: `Browse ${categoryTitle.toLowerCase()} tasks to accept`,
      icon: Search,
      color: "from-green-500 to-emerald-500",
      highlight: true,
    },
    {
      id: "map",
      title: "View on Map",
      description: "Find nearby tasks in this category",
      icon: Briefcase,
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: "instant",
      title: "Go Online for Instant Work",
      description: "Accept instant requests in this category",
      icon: Zap,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  // Determine which actions to show based on user role
  let actions = [];
  if (hasBothRoles) {
    actions = [...taskGiverActions, ...taskDoerActions];
  } else if (isTaskGiver) {
    actions = taskGiverActions;
  } else if (isTaskDoer) {
    actions = taskDoerActions;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {CategoryIcon && <CategoryIcon className="w-5 h-5 text-primary" />}
            {categoryTitle}
          </DialogTitle>
          <DialogDescription>
            {hasBothRoles
              ? "Choose what you'd like to do"
              : isTaskGiver
                ? "Post a task or find professionals"
                : "Find work opportunities in this category"}
          </DialogDescription>
        </DialogHeader>

        {hasBothRoles && (
          <div className="flex gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Task Giver
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Task Doer
            </Badge>
          </div>
        )}

        <div className="grid gap-3 pt-2">
          {actions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${
                  action.highlight ? "border-primary border-2" : ""
                }`}
                onClick={() => handleAction(action.id)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
