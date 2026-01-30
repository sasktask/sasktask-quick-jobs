import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus, Search, Zap, Calendar, MapPin, Users, MessageSquare, DollarSign
} from "lucide-react";

interface ServiceQuickActionsProps {
  userRole?: "task_giver" | "task_doer" | "both";
}

export function ServiceQuickActions({ userRole }: ServiceQuickActionsProps) {
  const isTaskGiver = userRole === "task_giver" || userRole === "both";
  const isTaskDoer = userRole === "task_doer" || userRole === "both";

  const actions = [
    // Task Giver Actions
    ...(isTaskGiver ? [
      {
        title: "Post a Task",
        description: "Get help with anything",
        icon: Plus,
        href: "/post-task",
        color: "from-primary to-primary/70",
        highlight: true
      },
      {
        title: "Find Taskers",
        description: "Browse verified professionals",
        icon: Users,
        href: "/find-taskers",
        color: "from-blue-500 to-cyan-500"
      },
      {
        title: "Instant Help",
        description: "Get help within minutes",
        icon: Zap,
        href: "/instant-work",
        color: "from-yellow-500 to-orange-500"
      }
    ] : []),
    // Task Doer Actions
    ...(isTaskDoer ? [
      {
        title: "Find Tasks",
        description: "Browse available work",
        icon: Search,
        href: "/browse",
        color: "from-green-500 to-emerald-500",
        highlight: !isTaskGiver
      },
      {
        title: "Go Online",
        description: "Accept instant requests",
        icon: Zap,
        href: "/instant-work",
        color: "from-yellow-500 to-orange-500"
      },
      {
        title: "Map View",
        description: "Find nearby tasks",
        icon: MapPin,
        href: "/map",
        color: "from-red-500 to-pink-500"
      }
    ] : []),
    // Common Actions
    {
      title: "My Bookings",
      description: "View all bookings",
      icon: Calendar,
      href: "/bookings",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Messages",
      description: "Chat with users",
      icon: MessageSquare,
      href: "/messages",
      color: "from-indigo-500 to-blue-500"
    },
    {
      title: "Payments",
      description: "View transactions",
      icon: DollarSign,
      href: "/payments",
      color: "from-green-600 to-emerald-600"
    }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.href + action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={action.href}>
              <Card className={`h-full cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${action.highlight ? "border-primary border-2" : ""}`}>
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
